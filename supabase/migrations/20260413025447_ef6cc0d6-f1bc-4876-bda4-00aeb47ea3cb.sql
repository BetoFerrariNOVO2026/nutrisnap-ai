
-- Add subscription plan and phone to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_plan text NOT NULL DEFAULT 'free',
ADD COLUMN IF NOT EXISTS phone text;

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Payment webhooks log table
CREATE TABLE public.payment_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text,
  customer_email text,
  plan text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  raw_payload jsonb,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_webhooks ENABLE ROW LEVEL SECURITY;

-- Admins can view webhook logs
CREATE POLICY "Admins can view payment webhooks"
ON public.payment_webhooks
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
