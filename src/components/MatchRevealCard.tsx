import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Mail, Phone, Gift, Sparkles, User, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MatchProfile {
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

interface MatchRevealCardProps {
  profile: MatchProfile;
  isInstantMatch?: boolean;
}

const MatchRevealCard = ({ profile, isInstantMatch }: MatchRevealCardProps) => {
  const [showFullProfile, setShowFullProfile] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="space-y-6"
      >
      {/* Celebration Header */}
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-romantic mb-4"
        >
          <Heart className="w-10 h-10 text-primary-foreground fill-primary-foreground" />
        </motion.div>
        <h2 className="text-2xl font-serif font-bold text-gradient">
          {isInstantMatch ? '⚡ Instant Match Found!' : '💕 Your Match!'}
        </h2>
      </div>

      {/* Profile Card */}
      <div className="bg-secondary/30 rounded-2xl p-6 border border-primary/20">
        {/* Profile Picture */}
        <div className="flex justify-center mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="relative"
          >
            <div className="w-28 h-28 rounded-full overflow-hidden bg-secondary border-4 border-primary shadow-lg">
              {profile.profile_picture_url ? (
                <img
                  src={profile.profile_picture_url}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <User className="w-12 h-12 text-primary" />
                </div>
              )}
            </div>
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full gradient-romantic flex items-center justify-center"
            >
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </motion.div>
          </motion.div>
        </div>

        {/* Name */}
        <h3 className="text-xl font-serif font-bold text-center mb-1">{profile.name}</h3>
        <p className="text-center text-muted-foreground text-sm capitalize mb-4">
          {profile.relationship_status || 'Ready for love'}
        </p>

        {/* Contact Info */}
        <div className="space-y-3 mb-4">
          {profile.email && (
            <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <a href={`mailto:${profile.email}`} className="text-sm font-medium hover:text-primary">
                  {profile.email}
                </a>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
            <Phone className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">WhatsApp</p>
              <a href={`https://wa.me/${profile.whatsapp_phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-primary">
                {profile.whatsapp_phone}
              </a>
            </div>
          </div>
        </div>

        {/* About */}
        {profile.about && (
          <div className="p-3 bg-background rounded-lg mb-4">
            <p className="text-sm text-muted-foreground">{profile.about}</p>
          </div>
        )}

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {profile.interests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs"
              >
                {interest}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* View Full Profile Button - only if profile is visible */}
      {profile.show_profile_to_match && (
        <div className="text-center">
          <Button 
            onClick={() => setShowFullProfile(true)}
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Full Profile
          </Button>
        </div>
      )}

      {/* Romantic Messages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="p-4 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-xl border border-primary/20">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-primary" />
            <span className="font-medium text-primary">What's Next?</span>
          </div>
          <p className="text-sm text-foreground">
            Send a message to your match, connect & share gifts 🎁
          </p>
        </div>

        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-block"
        >
          <p className="text-2xl font-serif text-gradient">
            Happy Valentine! 💌
          </p>
        </motion.div>
      </motion.div>
    </motion.div>

    {/* Full Profile Modal */}
    <Dialog open={showFullProfile} onOpenChange={setShowFullProfile}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center font-serif text-xl">
            {profile.name}'s Profile
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {/* Profile Picture */}
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-secondary border-4 border-primary shadow-lg">
              {profile.profile_picture_url ? (
                <img
                  src={profile.profile_picture_url}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <User className="w-16 h-16 text-primary" />
                </div>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="text-center">
            <h3 className="text-xl font-serif font-bold">{profile.name}</h3>
            <p className="text-muted-foreground capitalize">
              {profile.gender}
            </p>
          </div>

          {/* Relationship Status */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Relationship Status
            </h4>
            <p className="text-sm bg-secondary/50 rounded-lg p-3 capitalize">
              {profile.relationship_status || 'Not specified'}
            </p>
          </div>

          {/* About */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">About</h4>
            <p className="text-sm bg-secondary/50 rounded-lg p-3">
              {profile.about || 'No about info provided'}
            </p>
          </div>

          {/* Interests */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Interests</h4>
            {profile.interests && profile.interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm bg-secondary/50 rounded-lg p-3 text-muted-foreground">No interests listed</p>
            )}
          </div>

          {/* Wishlist */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Wishlist
            </h4>
            <p className="text-sm bg-secondary/50 rounded-lg p-3">
              {profile.wishlist || 'No wishlist provided'}
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Contact</h4>
            <div className="space-y-2">
              {profile.email && (
                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                  <Mail className="w-5 h-5 text-primary" />
                  <a href={`mailto:${profile.email}`} className="text-sm hover:text-primary">
                    {profile.email}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                <Phone className="w-5 h-5 text-primary" />
                <a href={`https://wa.me/${profile.whatsapp_phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary">
                  {profile.whatsapp_phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default MatchRevealCard;
