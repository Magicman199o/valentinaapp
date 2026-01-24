import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, Gift, Plus, Trash2, Eye, LogOut, Loader2, Upload, Building2, Key, Link2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Logo from '@/components/Logo';
import ViewProfileModal from '@/components/ViewProfileModal';
import { toast } from 'sonner';

const ADMIN_SESSION_KEY = 'valentina_admin_authenticated';
const ADMIN_USERNAME = 'Valentina';
const ADMIN_PASSWORD = 'Valentina@admin';

// Helper to call admin API
const callAdminAPI = async (action: string, params: Record<string, any> = {}) => {
  const { data, error } = await supabase.functions.invoke('admin-api', {
    body: {
      action,
      adminUsername: ADMIN_USERNAME,
      adminPassword: ADMIN_PASSWORD,
      ...params,
    },
  });
  if (error) throw error;
  return data;
};

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  });
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [users, setUsers] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [sponsorInquiries, setSponsorInquiries] = useState<any[]>([]);
  const [vipCodes, setVipCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newSponsor, setNewSponsor] = useState({ name: '', link: '' });
  const [sponsorIcon, setSponsorIcon] = useState<File | null>(null);
  const [uploadingSponsor, setUploadingSponsor] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual match state
  const [manualMatchMale, setManualMatchMale] = useState('');
  const [manualMatchFemale, setManualMatchFemale] = useState('');
  const [creatingMatch, setCreatingMatch] = useState(false);

  // VIP code state - now includes match selection
  const [newVIPUser, setNewVIPUser] = useState('');
  const [vipMatchWith, setVipMatchWith] = useState('');
  const [creatingVIP, setCreatingVIP] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.username === 'Valentina' && loginData.password === 'Valentina@admin') {
      setIsAuthenticated(true);
      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
      fetchAllData();
    } else {
      toast.error('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(ADMIN_SESSION_KEY);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const data = await callAdminAPI('fetchAll');
      setUsers(data.profiles || []);
      setMatches(data.matches || []);
      setVipCodes(data.vipCodes || []);
      
      const allSponsors = data.sponsors || [];
      setSponsors(allSponsors.filter((s: any) => s.is_active && !s.name.startsWith('INQUIRY:')));
      setSponsorInquiries(allSponsors.filter((s: any) => s.name.startsWith('INQUIRY:')));
    } catch (error: any) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to fetch data');
    }
    setLoading(false);
  };

  const addSponsor = async () => {
    if (!newSponsor.name) {
      toast.error('Please enter sponsor name');
      return;
    }

    setUploadingSponsor(true);
    
    let iconUrl = '';
    
    if (sponsorIcon) {
      const fileExt = sponsorIcon.name.split('.').pop();
      const filePath = `sponsors/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, sponsorIcon, { upsert: true });
      
      if (uploadError) {
        toast.error('Failed to upload icon');
        setUploadingSponsor(false);
        return;
      }
      
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);
      
      iconUrl = urlData.publicUrl;
    }
    
    const { error } = await supabase.from('sponsors').insert([{
      name: newSponsor.name,
      icon_url: iconUrl || 'https://via.placeholder.com/40',
      link: newSponsor.link || '#',
      is_active: true,
    }]);
    
    setUploadingSponsor(false);
    
    if (error) {
      toast.error('Failed to add sponsor');
    } else {
      toast.success('Sponsor added!');
      setNewSponsor({ name: '', link: '' });
      setSponsorIcon(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchAllData();
    }
  };

  const deleteSponsor = async (id: string) => {
    try {
      await callAdminAPI('deleteSponsor', { sponsorId: id });
      toast.success('Sponsor deleted');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to delete sponsor');
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/png', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a PNG or SVG file');
        return;
      }
      setSponsorIcon(file);
    }
  };

  // Generate random VIP code
  const generateVIPCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'VIP-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Get opposite gender users for VIP match selection
  const getOppositeGenderUsers = (userId: string) => {
    const selectedUser = users.find(u => u.user_id === userId);
    if (!selectedUser) return [];
    
    const oppositeGender = selectedUser.gender === 'male' ? 'female' : 'male';
    return users.filter(u => u.gender === oppositeGender);
  };

  // Create VIP code with match
  const createVIPCode = async () => {
    if (!newVIPUser) {
      toast.error('Please select a user');
      return;
    }

    if (!vipMatchWith) {
      toast.error('Please select who to match with');
      return;
    }

    setCreatingVIP(true);

    // Check if user already has a VIP code
    const existingCode = vipCodes.find(c => c.assigned_user_id === newVIPUser);
    if (existingCode) {
      toast.error('User already has a VIP code');
      setCreatingVIP(false);
      return;
    }

    // Check same gender matching
    const user1 = users.find(u => u.user_id === newVIPUser);
    const user2 = users.find(u => u.user_id === vipMatchWith);
    if (user1?.gender === user2?.gender) {
      toast.error('Cannot match users of the same gender');
      setCreatingVIP(false);
      return;
    }

    const code = generateVIPCode();
    
    try {
      await callAdminAPI('createVIPCodeWithMatch', { 
        code, 
        assignedUserId: newVIPUser,
        matchWithUserId: vipMatchWith
      });
      toast.success(`VIP code created: ${code}`);
      setNewVIPUser('');
      setVipMatchWith('');
      fetchAllData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create VIP code');
    }
    setCreatingVIP(false);
  };

  // Delete VIP code
  const deleteVIPCode = async (id: string) => {
    try {
      await callAdminAPI('deleteVIPCode', { vipId: id });
      toast.success('VIP code deleted');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to delete VIP code');
    }
  };

  // Create manual match
  const createManualMatch = async () => {
    if (!manualMatchMale || !manualMatchFemale) {
      toast.error('Please select both users');
      return;
    }

    if (manualMatchMale === manualMatchFemale) {
      toast.error('Cannot match user with themselves');
      return;
    }

    setCreatingMatch(true);

    const existingMatch = matches.find(
      m => (m.male_user_id === manualMatchMale && m.female_user_id === manualMatchFemale) ||
           (m.male_user_id === manualMatchFemale && m.female_user_id === manualMatchMale)
    );

    if (existingMatch) {
      toast.error('These users are already matched');
      setCreatingMatch(false);
      return;
    }

    try {
      await callAdminAPI('createMatch', { maleUserId: manualMatchMale, femaleUserId: manualMatchFemale });
      toast.success('Match created successfully!');
      setManualMatchMale('');
      setManualMatchFemale('');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to create match');
    }
    setCreatingMatch(false);
  };

  // Delete match
  const deleteMatch = async (id: string) => {
    try {
      await callAdminAPI('deleteMatch', { matchId: id });
      toast.success('Match deleted');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to delete match');
    }
  };

  const maleUsers = users.filter(u => u.gender === 'male');
  const femaleUsers = users.filter(u => u.gender === 'female');
  const oppositeGenderOptions = newVIPUser ? getOppositeGenderUsers(newVIPUser) : [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-background to-muted">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-romantic w-full max-w-md mx-4">
          <div className="text-center mb-6">
            <Logo size="md" />
            <p className="text-muted-foreground mt-2">Admin Access</p>
          </div>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <Label>Username</Label>
              <Input value={loginData.username} onChange={(e) => setLoginData({ ...loginData, username: e.target.value })} />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />
            </div>
            <Button type="submit" className="w-full btn-romantic">Login</Button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 flex items-center justify-between border-b bg-card">
        <Logo size="sm" />
        <Button variant="ghost" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" />Logout</Button>
      </header>

      <main className="container max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-serif font-bold mb-6">Admin Dashboard</h1>
        
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <Tabs defaultValue="users">
            <TabsList className="mb-4 flex-wrap">
              <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" />Users ({users.length})</TabsTrigger>
              <TabsTrigger value="matches"><Heart className="w-4 h-4 mr-2" />Matches ({matches.length})</TabsTrigger>
              <TabsTrigger value="vip"><Key className="w-4 h-4 mr-2" />VIP Codes ({vipCodes.length})</TabsTrigger>
              <TabsTrigger value="sponsors"><Gift className="w-4 h-4 mr-2" />Sponsors</TabsTrigger>
              <TabsTrigger value="inquiries"><Building2 className="w-4 h-4 mr-2" />Inquiries ({sponsorInquiries.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <div className="card-romantic overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="p-2 text-left">Name</th><th className="p-2">Email</th><th className="p-2">Phone</th><th className="p-2">Gender</th><th className="p-2">Joined</th><th className="p-2">Actions</th></tr></thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-secondary/50">
                        <td className="p-2 font-medium">{u.name}</td>
                        <td className="p-2">{u.email}</td>
                        <td className="p-2">{u.whatsapp_phone}</td>
                        <td className="p-2 capitalize">{u.gender}</td>
                        <td className="p-2">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="p-2">
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedProfile(u); setShowProfileModal(true); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="matches">
              <div className="card-romantic space-y-6">
                {/* Manual Match Creation */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Link2 className="w-5 h-5" />
                    Create Manual Match
                  </h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label>Male User</Label>
                      <Select value={manualMatchMale} onValueChange={setManualMatchMale}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select male user" />
                        </SelectTrigger>
                        <SelectContent>
                          {maleUsers.map(u => (
                            <SelectItem key={u.user_id} value={u.user_id}>
                              {u.name} ({u.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Female User</Label>
                      <Select value={manualMatchFemale} onValueChange={setManualMatchFemale}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select female user" />
                        </SelectTrigger>
                        <SelectContent>
                          {femaleUsers.map(u => (
                            <SelectItem key={u.user_id} value={u.user_id}>
                              {u.name} ({u.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={createManualMatch} disabled={creatingMatch} className="btn-romantic">
                        {creatingMatch ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Heart className="w-4 h-4 mr-2" />}
                        Create Match
                      </Button>
                    </div>
                  </div>
                </div>

                <hr className="border-border" />

                {/* Existing Matches */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Existing Matches</h3>
                  {matches.map((m) => {
                    const male = users.find(u => u.user_id === m.male_user_id);
                    const female = users.find(u => u.user_id === m.female_user_id);
                    return (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <span>{male?.name || 'Unknown'} ❤️ {female?.name || 'Unknown'}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{m.is_instant_match ? '⚡ Instant' : 'Regular'}</span>
                          <Button size="sm" variant="destructive" onClick={() => deleteMatch(m.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {matches.length === 0 && <p className="text-center text-muted-foreground py-4">No matches yet</p>}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="vip">
              <div className="card-romantic space-y-6">
                {/* Create VIP Code with Match Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Create VIP Code with Match
                  </h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label>Assign VIP Code to</Label>
                      <Select value={newVIPUser} onValueChange={(val) => { setNewVIPUser(val); setVipMatchWith(''); }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                        <SelectContent>
                          {users
                            .filter(u => !vipCodes.find(v => v.assigned_user_id === u.user_id))
                            .map(u => (
                              <SelectItem key={u.user_id} value={u.user_id}>
                                {u.name} ({u.email}) - {u.gender}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Match with (opposite gender)</Label>
                      <Select value={vipMatchWith} onValueChange={setVipMatchWith} disabled={!newVIPUser}>
                        <SelectTrigger>
                          <SelectValue placeholder={newVIPUser ? "Select match" : "Select user first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {oppositeGenderOptions.map(u => (
                            <SelectItem key={u.user_id} value={u.user_id}>
                              {u.name} ({u.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={createVIPCode} disabled={creatingVIP || !newVIPUser || !vipMatchWith} className="btn-romantic">
                        {creatingVIP ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        Generate VIP Code
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    VIP codes allow instant match reveal. The match will be created when the code is generated and revealed when the user enters the code.
                  </p>
                </div>

                <hr className="border-border" />

                {/* Existing VIP Codes */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Existing VIP Codes</h3>
                  {vipCodes.map((v) => {
                    const user = users.find(u => u.user_id === v.assigned_user_id);
                    const match = matches.find(m => m.id === v.match_id);
                    let matchedWithUser = null;
                    if (match) {
                      const matchedUserId = match.male_user_id === v.assigned_user_id ? match.female_user_id : match.male_user_id;
                      matchedWithUser = users.find(u => u.user_id === matchedUserId);
                    }
                    return (
                      <div key={v.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <code className="bg-background px-2 py-1 rounded font-mono text-sm">{v.code}</code>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${v.is_used ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {v.is_used ? 'Used' : 'Unused'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Assigned to: {user?.name || 'Unknown'} ({user?.email})
                          </p>
                          {matchedWithUser && (
                            <p className="text-sm text-primary">
                              Matched with: {matchedWithUser.name}
                            </p>
                          )}
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => deleteVIPCode(v.id)} disabled={v.is_used}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                  {vipCodes.length === 0 && <p className="text-center text-muted-foreground py-4">No VIP codes yet</p>}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sponsors">
              <div className="card-romantic space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>Sponsor Name *</Label>
                    <Input 
                      placeholder="Company Name" 
                      value={newSponsor.name} 
                      onChange={(e) => setNewSponsor({ ...newSponsor, name: e.target.value })} 
                    />
                  </div>
                  <div>
                    <Label>Icon (PNG/SVG)</Label>
                    <Input 
                      ref={fileInputRef}
                      type="file" 
                      accept=".png,.svg,image/png,image/svg+xml"
                      onChange={handleIconChange}
                    />
                  </div>
                  <div>
                    <Label>Link (optional)</Label>
                    <Input 
                      placeholder="https://..." 
                      value={newSponsor.link} 
                      onChange={(e) => setNewSponsor({ ...newSponsor, link: e.target.value })} 
                    />
                  </div>
                </div>
                <Button onClick={addSponsor} className="btn-romantic" disabled={uploadingSponsor}>
                  {uploadingSponsor ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</>
                  ) : (
                    <><Plus className="w-4 h-4 mr-2" />Add Sponsor</>
                  )}
                </Button>
                
                <div className="space-y-2 mt-4">
                  {sponsors.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {s.icon_url && <img src={s.icon_url} alt={s.name} className="w-8 h-8 rounded object-contain" />}
                        <span>{s.name}</span>
                        {s.link && s.link !== '#' && (
                          <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                            {s.link.slice(0, 30)}...
                          </a>
                        )}
                      </div>
                      <Button size="sm" variant="destructive" onClick={() => deleteSponsor(s.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                  {sponsors.length === 0 && <p className="text-center text-muted-foreground py-4">No sponsors yet</p>}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="inquiries">
              <div className="card-romantic space-y-2">
                <h3 className="text-lg font-semibold mb-4">Sponsor Inquiries</h3>
                {sponsorInquiries.map((inquiry) => {
                  const name = inquiry.name.replace('INQUIRY: ', '');
                  const details = inquiry.icon_url;
                  return (
                    <div key={inquiry.id} className="p-4 bg-secondary/50 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{name}</span>
                        <Button size="sm" variant="destructive" onClick={() => deleteSponsor(inquiry.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{details}</p>
                    </div>
                  );
                })}
                {sponsorInquiries.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No sponsor inquiries yet</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>

      <ViewProfileModal open={showProfileModal} onOpenChange={setShowProfileModal} profile={selectedProfile} isAdmin />
    </div>
  );
};

export default AdminPage;
