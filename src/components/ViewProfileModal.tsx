import { motion } from 'framer-motion';
import { User, Heart, BookOpen, Gift, Users, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ProfileData {
  name: string;
  profile_picture_url: string | null;
  about: string | null;
  interests: string[] | null;
  wishlist: string | null;
  relationship_status: string | null;
  show_profile_to_match: boolean;
  gender: string;
}

interface ViewProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ProfileData | null;
  isAdmin?: boolean;
}

const ViewProfileModal = ({ open, onOpenChange, profile, isAdmin = false }: ViewProfileModalProps) => {
  if (!profile) return null;

  const canViewProfile = isAdmin || profile.show_profile_to_match;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            {profile.name}'s Profile
          </DialogTitle>
        </DialogHeader>

        {!canViewProfile ? (
          <div className="text-center py-8">
            <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              This user has chosen to keep their profile private.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Profile Picture */}
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary border-4 border-primary/20">
                {profile.profile_picture_url ? (
                  <img
                    src={profile.profile_picture_url}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold">{profile.name}</h3>
              <span className="inline-block px-3 py-1 rounded-full bg-secondary text-sm capitalize">
                {profile.gender}
              </span>
            </div>

            {/* About */}
            {profile.about && (
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <BookOpen className="w-4 h-4" />
                  About
                </div>
                <p className="text-sm">{profile.about}</p>
              </div>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <Heart className="w-4 h-4" />
                  Interests
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Wishlist */}
            {profile.wishlist && (
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <Gift className="w-4 h-4" />
                  Looking For
                </div>
                <p className="text-sm">{profile.wishlist}</p>
              </div>
            )}

            {/* Relationship Status */}
            {profile.relationship_status && (
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <Users className="w-4 h-4" />
                  Relationship Status
                </div>
                <p className="text-sm capitalize">{profile.relationship_status}</p>
              </div>
            )}
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewProfileModal;
