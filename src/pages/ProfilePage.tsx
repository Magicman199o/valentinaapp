import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Save, User, Heart, BookOpen, Gift, Users, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Logo from '@/components/Logo';
import { toast } from 'sonner';

const INTERESTS_OPTIONS = [
  'Music', 'Movies', 'Sports', 'Reading', 'Travel', 'Cooking', 'Gaming', 
  'Photography', 'Art', 'Dancing', 'Fitness', 'Nature', 'Technology', 'Fashion'
];

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    profile_picture_url: '',
    about: '',
    interests: [] as string[],
    wishlist: '',
    relationship_status: 'single' as 'single' | 'divorced' | 'widowed' | 'complicated',
    show_profile_to_match: true,
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setProfile({
        profile_picture_url: data.profile_picture_url || '',
        about: data.about || '',
        interests: data.interests || [],
        wishlist: data.wishlist || '',
        relationship_status: data.relationship_status || 'single',
        show_profile_to_match: data.show_profile_to_match ?? true,
      });
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Check file size (600KB = 614400 bytes)
    if (file.size > 614400) {
      toast.error('Image must be less than 600KB');
      return;
    }

    setUploading(true);
    
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error('Failed to upload image');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(filePath);

    setProfile({ ...profile, profile_picture_url: urlData.publicUrl });
    setUploading(false);
    toast.success('Image uploaded!');
  };

  const toggleInterest = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        profile_picture_url: profile.profile_picture_url,
        about: profile.about,
        interests: profile.interests,
        wishlist: profile.wishlist,
        relationship_status: profile.relationship_status,
        show_profile_to_match: profile.show_profile_to_match,
      })
      .eq('user_id', user.id);

    setSaving(false);

    if (error) {
      toast.error('Failed to save profile');
    } else {
      toast.success('Profile saved! 💕');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-muted py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center mb-6">
          <Logo size="md" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-romantic"
        >
          <h1 className="text-2xl font-serif font-bold text-center mb-6">Your Profile</h1>

          {/* Profile Picture */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-secondary border-4 border-primary/20">
                {profile.profile_picture_url ? (
                  <img
                    src={profile.profile_picture_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-10 h-10 rounded-full gradient-romantic flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 transition-transform">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {uploading ? (
                  <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-primary-foreground" />
                )}
              </label>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mb-6">
            Max file size: 600KB
          </p>

          <div className="space-y-6">
            {/* About */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4" />
                About Me
              </Label>
              <Textarea
                placeholder="Tell your match something about yourself..."
                value={profile.about}
                onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                className="min-h-[100px]"
              />
            </div>

            {/* Interests */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4" />
                Interests
              </Label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS_OPTIONS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      profile.interests.includes(interest)
                        ? 'gradient-romantic text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Wishlist */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4" />
                Wishlist (What I'm looking for)
              </Label>
              <Textarea
                placeholder="Describe your ideal match..."
                value={profile.wishlist}
                onChange={(e) => setProfile({ ...profile, wishlist: e.target.value })}
              />
            </div>

            {/* Relationship Status */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4" />
                Relationship Status
              </Label>
              <Select
                value={profile.relationship_status}
                onValueChange={(value) => setProfile({ 
                  ...profile, 
                  relationship_status: value as typeof profile.relationship_status 
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
                  <SelectItem value="complicated">It's Complicated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                {profile.show_profile_to_match ? (
                  <Eye className="w-5 h-5 text-primary" />
                ) : (
                  <EyeOff className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">Show Profile to Match</p>
                  <p className="text-sm text-muted-foreground">
                    Allow your match to view your profile details
                  </p>
                </div>
              </div>
              <Switch
                checked={profile.show_profile_to_match}
                onCheckedChange={(checked) => setProfile({ ...profile, show_profile_to_match: checked })}
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full btn-romantic"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Profile
                </span>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
