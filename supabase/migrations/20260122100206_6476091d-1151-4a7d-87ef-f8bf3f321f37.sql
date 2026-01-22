-- Create VIP codes table for instant match access
CREATE TABLE public.vip_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  assigned_user_id UUID REFERENCES public.profiles(user_id),
  match_id UUID REFERENCES public.matches(id),
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS
ALTER TABLE public.vip_codes ENABLE ROW LEVEL SECURITY;

-- Admins can manage VIP codes
CREATE POLICY "Admins can manage VIP codes"
ON public.vip_codes
FOR ALL
USING (is_admin());

-- Users can view their assigned VIP code
CREATE POLICY "Users can view their assigned VIP code"
ON public.vip_codes
FOR SELECT
USING (assigned_user_id = auth.uid());

-- Users can update their VIP code (to mark as used)
CREATE POLICY "Users can use their VIP code"
ON public.vip_codes
FOR UPDATE
USING (assigned_user_id = auth.uid())
WITH CHECK (assigned_user_id = auth.uid());