import { useState, useEffect } from 'react';
import { Pencil, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: any;
  onSave: (userId: string, updates: Record<string, any>) => Promise<void>;
}

const EditUserModal = ({ open, onOpenChange, profile, onSave }: EditUserModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp_phone: '',
    gender: '',
    payment_status: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        whatsapp_phone: profile.whatsapp_phone || '',
        gender: profile.gender || '',
        payment_status: profile.payment_status ?? false,
      });
    }
  }, [profile]);

  if (!profile) return null;

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    setSaving(true);
    try {
      await onSave(profile.user_id, {
        name: formData.name,
        email: formData.email,
        whatsapp_phone: formData.whatsapp_phone,
        gender: formData.gender,
        payment_status: formData.payment_status,
      });
      onOpenChange(false);
    } catch {
      // error handled by parent
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <Pencil className="w-5 h-5 text-primary" />
            Edit {profile.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <Label>WhatsApp Phone</Label>
            <Input
              value={formData.whatsapp_phone}
              onChange={(e) => setFormData({ ...formData, whatsapp_phone: e.target.value })}
            />
          </div>

          <div>
            <Label>Gender</Label>
            <Select value={formData.gender} onValueChange={(val) => setFormData({ ...formData, gender: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Payment Status</Label>
            <Switch
              checked={formData.payment_status}
              onCheckedChange={(checked) => setFormData({ ...formData, payment_status: checked })}
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full btn-romantic">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Pencil className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;
