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
import SponsorCarousel from '@/components/SponsorCarousel';
import MatchRevealCard from '@/components/MatchRevealCard';
import InstantMatchPrompt from '@/components/InstantMatchPrompt';
import VIPCodeEntry from '@/components/VIPCodeEntry';
import { toast } from 'sonner';
import CountdownTimer from '@/components/CountdownTimer';

interface MatchedProfile {
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
  email?: string;
}

interface Match {
  id: string;
  matched_at: string;
  is_instant_match: boolean;
  matchedProfile: MatchedProfile | null;
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

interface VIPCode {
  id: string;
  code: string;
  is_used: boolean;
  match_id: string | null;
}

const HomePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInstantMatchPrompt, setShowInstantMatchPrompt] = useState(false);
  const [showVIPEntry, setShowVIPEntry] = useState(false);
  const [vipCode, setVipCode] = useState<VIPCode | null>(null);
  const [vipMatchRevealed, setVipMatchRevealed] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Fetch VIP code for this user
    const { data: vipData } = await supabase
      .from('vip_codes')
      .select('*')
      .eq('assigned_user_id', user.id)
      .maybeSingle();

    if (vipData) {
      setVipCode(vipData);
      setVipMatchRevealed(vipData.is_used);
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

    if (!matchesData || matchesData.length === 0) {
      setMatches([]);
      return;
    }

    // Fetch matched user profiles with email
    const matchedUserIds = matchesData.map(m => 
      isUserMale ? m.female_user_id : m.male_user_id
    );

    const { data: matchedProfiles } = await supabase
      .from('profiles')
      .select('user_id, name, profile_picture_url, about, interests, wishlist, relationship_status, show_profile_to_match, gender, whatsapp_phone, email')
      .in('user_id', matchedUserIds);

    const formattedMatches: Match[] = matchesData.map(match => ({
      id: match.id,
      matched_at: match.matched_at,
      is_instant_match: match.is_instant_match || false,
      matchedProfile: matchedProfiles?.find(p => 
        p.user_id === (isUserMale ? match.female_user_id : match.male_user_id)
      ) || null,
    }));

    setMatches(formattedMatches);
  };

  const handleInstantMatch = () => {
    // If user has a VIP code, show entry modal directly
    if (vipCode && !vipCode.is_used) {
      setShowVIPEntry(true);
      return;
    }
    
    // Show the prompt to contact admin
    setShowInstantMatchPrompt(true);
  };

  const handleEnterCode = () => {
    setShowInstantMatchPrompt(false);
    setShowVIPEntry(true);
  };

  const handleVIPCodeVerified = async () => {
    setVipMatchRevealed(true);
    setShowVIPEntry(false);
    await fetchMatches();
    toast.success('Your match has been revealed! 💕');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const getCountdownDate = () => {
    // Quick test: if URL contains ?testDays=NUMBER use that many days from now
    try {
      const params = new URLSearchParams(window.location.search);
      const testDays = params.get('testDays');
      if (testDays) {
        const days = Number(testDays);
        if (!isNaN(days)) {
          return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        }
      }
    } catch (e) {
      // ignore (SSR or window not available)
    }

    // Valentine's Day 2026 at 6am
    return new Date('2026-02-14T06:00:00');
  };

  // Filter matches based on VIP status
  const visibleMatches = matches.filter(match => {
    if (match.is_instant_match) {
      // Only show instant matches if VIP code is used
      return vipMatchRevealed || (vipCode && vipCode.is_used);
    }
    return true;
  });

  // Check if user has pending VIP code (assigned but not used)
  const hasPendingVIPCode = vipCode && !vipCode.is_used;
  const hasUsedVIPCode = vipCode && vipCode.is_used;

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

        {/* Main Display Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card-romantic mb-6"
        >
          {/* Show revealed match if VIP code was used */}
          {hasUsedVIPCode && visibleMatches.length > 0 ? (
            <MatchRevealCard 
              profile={visibleMatches[0].matchedProfile!} 
              isInstantMatch={visibleMatches[0].is_instant_match}
            />
          ) : visibleMatches.length > 0 && !hasPendingVIPCode ? (
            // Show regular matches (non-instant)
            <div className="space-y-4">
              <div className="text-center">
                <Heart className="w-12 h-12 mx-auto text-primary animate-heartbeat mb-2" />
                <h2 className="text-xl font-serif font-bold">Your Matches</h2>
              </div>
              
              <div className="space-y-3">
                {visibleMatches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 cursor-pointer hover:bg-secondary/70 transition-colors"
                    onClick={() => setSelectedMatch(match)}
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
                          {match.is_instant_match ? '⚡ Instant Match' : '💕 Your Match'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMatch(match);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Show countdown - match is pending
            <div className="space-y-6 py-8">
              <CountdownTimer 
                targetDate={getCountdownDate()} 
                onComplete={fetchMatches}
                gender={profile?.gender === 'male' ? 'male' : 'female'}
                name={profile?.name}
              />
            </div>
          )}
        </motion.div>

        {/* Instant Match Button - Only show if no matches yet and no used VIP code */}
        {!hasUsedVIPCode && visibleMatches.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={handleInstantMatch}
              className="w-full py-6 text-lg gradient-romantic text-primary-foreground rounded-2xl shadow-lg hover:scale-[1.02] transition-transform"
            >
              <span className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                GET AN INSTANT MATCH
              </span>
            </Button>
          </motion.div>
        )}

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

      {/* Instant Match Prompt Modal */}
      <Dialog open={showInstantMatchPrompt} onOpenChange={setShowInstantMatchPrompt}>
        <DialogContent className="max-w-md">
          <InstantMatchPrompt onEnterCode={handleEnterCode} />
        </DialogContent>
      </Dialog>

      {/* VIP Code Entry Modal */}
      <Dialog open={showVIPEntry} onOpenChange={setShowVIPEntry}>
        <DialogContent>
          <VIPCodeEntry userId={user!.id} onCodeVerified={handleVIPCodeVerified} />
        </DialogContent>
      </Dialog>

      {/* Match Detail Modal */}
      <Dialog open={!!selectedMatch} onOpenChange={(open) => !open && setSelectedMatch(null)}>
        <DialogContent className="max-w-md">
          {selectedMatch?.matchedProfile && (
            <MatchRevealCard 
              profile={selectedMatch.matchedProfile} 
              isInstantMatch={selectedMatch.is_instant_match}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;
