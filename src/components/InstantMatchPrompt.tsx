import { motion } from 'framer-motion';
import { Zap, MessageCircle, Key, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InstantMatchPromptProps {
  onEnterCode: () => void;
}

const InstantMatchPrompt = ({ onEnterCode }: InstantMatchPromptProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <div className="flex justify-center">
        <motion.div
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 rounded-full gradient-romantic flex items-center justify-center"
        >
          <Zap className="w-10 h-10 text-primary-foreground" />
        </motion.div>
      </div>

      <div>
        <h2 className="text-2xl font-serif font-bold mb-2">
          Get Your Instant Match! ⚡
        </h2>
        <p className="text-muted-foreground">
          Skip the countdown and discover your perfect match right now!
        </p>
      </div>

      <div className="bg-secondary/50 rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-3 text-left">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Contact Admin</h3>
            <p className="text-sm text-muted-foreground">
              Reach out to our admin team to request your exclusive VIP code for instant matching.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 text-left">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Get Matched</h3>
            <p className="text-sm text-muted-foreground">
              Once you have your VIP code, enter it to instantly reveal your perfect match!
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Already have a VIP code?
        </p>
        <Button
          onClick={onEnterCode}
          className="btn-romantic px-8"
        >
          <Key className="w-4 h-4 mr-2" />
          Enter Code
        </Button>
      </div>
    </motion.div>
  );
};

export default InstantMatchPrompt;
