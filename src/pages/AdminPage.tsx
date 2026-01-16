import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Heart, Gift, Plus, Trash2, Eye, LogOut, Loader2, Upload, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Logo from '@/components/Logo';
import ViewProfileModal from '@/components/ViewProfileModal';
import { toast } from 'sonner';

const AdminPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [users, setUsers] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [sponsorInquiries, setSponsorInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newSponsor, setNewSponsor] = useState({ name: '', link: '' });
  const [sponsorIcon, setSponsorIcon] = useState<File | null>(null);
  const [uploadingSponsor, setUploadingSponsor] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.username === 'Valentina' && loginData.password === 'Valentina@admin') {
      setIsAuthenticated(true);
      fetchAllData();
    } else {
      toast.error('Invalid credentials');
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    const [usersRes, matchesRes, sponsorsRes] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('matches').select('*'),
      supabase.from('sponsors').select('*'),
    ]);
    setUsers(usersRes.data || []);
    setMatches(matchesRes.data || []);
    
    // Separate active sponsors from inquiries
    const allSponsors = sponsorsRes.data || [];
    setSponsors(allSponsors.filter(s => s.is_active && !s.name.startsWith('INQUIRY:')));
    setSponsorInquiries(allSponsors.filter(s => s.name.startsWith('INQUIRY:')));
    
    setLoading(false);
  };

  const addSponsor = async () => {
    if (!newSponsor.name) {
      toast.error('Please enter sponsor name');
      return;
    }

    setUploadingSponsor(true);
    
    let iconUrl = '';
    
    // Upload icon if provided
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
    await supabase.from('sponsors').delete().eq('id', id);
    toast.success('Sponsor deleted');
    fetchAllData();
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const validTypes = ['image/png', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a PNG or SVG file');
        return;
      }
      setSponsorIcon(file);
    }
  };

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
        <Button variant="ghost" onClick={() => setIsAuthenticated(false)}><LogOut className="w-4 h-4 mr-2" />Logout</Button>
      </header>

      <main className="container max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-serif font-bold mb-6">Admin Dashboard</h1>
        
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <Tabs defaultValue="users">
            <TabsList className="mb-4">
              <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" />Users ({users.length})</TabsTrigger>
              <TabsTrigger value="matches"><Heart className="w-4 h-4 mr-2" />Matches ({matches.length})</TabsTrigger>
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
              <div className="card-romantic">
                <div className="space-y-2">
                  {matches.map((m) => {
                    const male = users.find(u => u.user_id === m.male_user_id);
                    const female = users.find(u => u.user_id === m.female_user_id);
                    return (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <span>{male?.name || 'Unknown'} ❤️ {female?.name || 'Unknown'}</span>
                        <span className="text-xs text-muted-foreground">{m.is_instant_match ? '⚡ Instant' : 'Regular'}</span>
                      </div>
                    );
                  })}
                  {matches.length === 0 && <p className="text-center text-muted-foreground py-4">No matches yet</p>}
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
                  const details = inquiry.icon_url; // Contains email, phone, etc.
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
