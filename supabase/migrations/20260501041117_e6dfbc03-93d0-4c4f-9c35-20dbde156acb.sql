CREATE POLICY "Admins can delete payment webhooks"
ON public.payment_webhooks
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));