import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, User, LogOut, Zap, Loader2, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Logo from '@/components/Logo';
import FloatingHearts from '@/components/FloatingHearts';
import CountdownTimer from '@/components/CountdownTimer';
import SponsorCarousel from '@/components/SponsorCarousel';
import ViewProfileModal from '@/components/ViewProfileModal';
import { toast } from 'sonner';

interface Match {
  id: string;
  matched_at: string;
  is_instant_match: boolean;
  matchedProfile: {
    user_id: string;
    name: string;
    profile_picture_url: string | null;
    about: string | null;
    interests: string[] | null;
    wishlist: string | null;
    relationship_status: string | null;
    show_profile_to_match: boolean;
    gender: string;
    whatsapp_phone: string;
  } | null;
}

interface Profile {
  name: string;
  gender: string;
  created_at: string;
  payment_status: boolean;
  about: string | null;
  interests: string[] | null;
  profile_picture_url: string | null;
}

const HomePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [instantMatchLoading, setInstantMatchLoading] = useState(false);
  const [showNoMatchModal, setShowNoMatchModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Match['matchedProfile'] | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('name, gender, created_at, payment_status, about, interests, profile_picture_url')
      .eq('user_id', user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
    }

    // Fetch matches
    await fetchMatches();
    setLoading(false);
  };

  const fetchMatches = async () => {
    if (!user) return;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('gender')
      .eq('user_id', user.id)
      .single();

    if (!profileData) return;

    const isUserMale = profileData.gender === 'male';
    
    // Fetch matches where user is either male or female participant
    const { data: matchesData } = await supabase
      .from('matches')
      .select('*')
      .or(`male_user_id.eq.${user.id},female_user_id.eq.${user.id}`);

    if (!matchesData) {
      setMatches([]);
      return;
    }

    // Fetch matched user profiles
    const matchedUserIds = matchesData.map(m => 
      isUserMale ? m.female_user_id : m.male_user_id
    );

    const { data: matchedProfiles } = await supabase
      .from('profiles')
      .select('user_id, name, profile_picture_url, about, interests, wishlist, relationship_status, show_profile_to_match, gender, whatsapp_phone')
      .in('user_id', matchedUserIds);

    const formattedMatches: Match[] = matchesData.map(match => ({
      id: match.id,
      matched_at: match.matched_at,
      is_instant_match: match.is_instant_match,
      matchedProfile: matchedProfiles?.find(p => 
        p.user_id === (isUserMale ? match.female_user_id : match.male_user_id)
      ) || null,
    }));

    setMatches(formattedMatches);
  };

  const handleInstantMatch = async () => {
    if (!user || !profile) return;

    setInstantMatchLoading(true);

    try {
      const oppositeGender = profile.gender === 'male' ? 'female' : 'male';
      
      // Find available user of opposite gender who is not already matched
      const { data: existingMatches } = await supabase
        .from('matches')
        .select('male_user_id, female_user_id');

      const matchedUserIds = existingMatches?.flatMap(m => [m.male_user_id, m.female_user_id]) || [];
      matchedUserIds.push(user.id); // Exclude current user

      const { data: availableUsers } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('gender', oppositeGender)
        .not('user_id', 'in', `(${matchedUserIds.join(',')})`)
        .limit(1);

      if (!availableUsers || availableUsers.length === 0) {
        setShowNoMatchModal(true);
        setInstantMatchLoading(false);
        return;
      }

      const matchedUserId = availableUsers[0].user_id;
      
      // Create instant match
      const { error } = await supabase
        .from('matches')
        .insert({
          male_user_id: profile.gender === 'male' ? user.id : matchedUserId,
          female_user_id: profile.gender === 'female' ? user.id : matchedUserId,
          is_instant_match: true,
        });

      if (error) {
        toast.error('Failed to create match');
      } else {
        toast.success('You got an instant match! 💕');
        await fetchMatches();
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setInstantMatchLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const getCountdownDate = () => {
    if (!profile) return new Date();
    const createdAt = new Date(profile.created_at);
    createdAt.setDate(createdAt.getDate() + 4);
    return createdAt;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-muted relative overflow-hidden">
      <FloatingHearts />
      
      {/* Header */}
      <header className="relative z-10 p-4 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <Link to="/profile">
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Sponsors */}
      <SponsorCarousel />

      {/* Main Content */}
      <main className="relative z-10 container max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
            Welcome, <span className="text-gradient">{profile?.name}</span>
          </h1>
          <p className="text-muted-foreground">Your journey to love begins here</p>
        </motion.div>

        {/* Countdown or Match Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card-romantic mb-6"
        >
          {matches.length > 0 ? (
            <div className="space-y-4">
              <div className="text-center">
                <Heart className="w-12 h-12 mx-auto text-primary animate-heartbeat mb-2" />
                <h2 className="text-xl font-serif font-bold">Your Matches</h2>
              </div>
              
              <div className="space-y-3">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10">
                        {match.matchedProfile?.profile_picture_url ? (
                          <img
                            src={match.matchedProfile.profile_picture_url}
                            alt={match.matchedProfile.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{match.matchedProfile?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {match.is_instant_match ? '⚡ Instant Match' : '💕 Regular Match'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProfile(match.matchedProfile);
                        setShowProfileModal(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Profile
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <CountdownTimer 
              targetDate={getCountdownDate()} 
              onComplete={fetchMatches} 
              gender={profile?.gender as 'male' | 'female'}
            />
          )}
        </motion.div>

        {/* Instant Match Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handleInstantMatch}
            disabled={instantMatchLoading}
            className="w-full py-6 text-lg gradient-romantic text-primary-foreground rounded-2xl shadow-lg hover:scale-[1.02] transition-transform"
          >
            {instantMatchLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Finding your match...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                GET AN INSTANT MATCH
              </span>
            )}
          </Button>
        </motion.div>

        {/* Edit Profile Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6"
        >
          <Link to="/profile" className="text-primary hover:underline text-sm">
            {profile?.about && profile?.interests && profile.interests.length > 0 && profile?.profile_picture_url
              ? 'Edit your profile →'
              : 'Complete your profile to attract better matches →'}
          </Link>
        </motion.div>
      </main>

      {/* No Match Modal */}
      <Dialog open={showNoMatchModal} onOpenChange={setShowNoMatchModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              No Available Matches Yet
            </DialogTitle>
            <DialogDescription>
              Don't worry! We'll match you as soon as someone suitable becomes available. 
              Keep your profile updated to attract the best matches!
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowNoMatchModal(false)} className="btn-romantic mt-4">
            Got it!
          </Button>
        </DialogContent>
      </Dialog>

      {/* View Profile Modal */}
      <ViewProfileModal
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        profile={selectedProfile}
      />
    </div>
  );
};

export default HomePage;
