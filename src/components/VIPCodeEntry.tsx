import { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Loader2, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VIPCodeEntryProps {
  userId: string;
  onCodeVerified: () => void;
}

const VIPCodeEntry = ({ userId, onCodeVerified }: VIPCodeEntryProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      toast.error('Please enter your VIP code');
      return;
    }

    setLoading(true);

    try {
      // Check if code exists and is assigned to this user
      const { data: vipCode, error } = await supabase
        .from('vip_codes')
        .select('*')
        .eq('code', code.trim().toUpperCase())
        .eq('assigned_user_id', userId)
        .eq('is_used', false)
        .single();

      if (error || !vipCode) {
        toast.error('Invalid or already used VIP code');
        setLoading(false);
        return;
      }

      // Mark code as used
      await supabase
        .from('vip_codes')
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq('id', vipCode.id);

      toast.success('VIP code verified! Revealing your match... 💕');
      onCodeVerified();
    } catch (err) {
      toast.error('Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <div className="flex justify-center">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 rounded-full gradient-romantic flex items-center justify-center"
        >
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </motion.div>
      </div>

      <div>
        <h2 className="text-xl font-serif font-bold mb-2">VIP Instant Match</h2>
        <p className="text-muted-foreground text-sm">
          Enter your VIP code to reveal your instant match
        </p>
      </div>

      <div className="space-y-4 max-w-xs mx-auto">
        <div className="relative">
          <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Enter VIP Code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="pl-10 text-center uppercase tracking-widest font-mono"
            maxLength={12}
          />
        </div>

        <Button
          onClick={handleVerifyCode}
          disabled={loading || !code.trim()}
          className="w-full btn-romantic"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Reveal My Match
            </span>
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Don't have a VIP code? Contact admin for instant match access.
      </p>
    </motion.div>
  );
};

export default VIPCodeEntry;
