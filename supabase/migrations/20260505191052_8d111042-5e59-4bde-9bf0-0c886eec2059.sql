
-- Plan settings table for admin-editable pricing & texts
CREATE TABLE public.plan_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_key TEXT NOT NULL UNIQUE, -- 'start' | 'pro' | 'premium'
  sort_order INT NOT NULL DEFAULT 0,
  highlight BOOLEAN NOT NULL DEFAULT false,
  badge TEXT,
  card_link TEXT,
  pix_link TEXT,
  price_brl TEXT NOT NULL DEFAULT '',
  price_usd TEXT NOT NULL DEFAULT '',
  name_pt TEXT NOT NULL DEFAULT '',
  name_en TEXT NOT NULL DEFAULT '',
  name_es TEXT NOT NULL DEFAULT '',
  desc_pt TEXT NOT NULL DEFAULT '',
  desc_en TEXT NOT NULL DEFAULT '',
  desc_es TEXT NOT NULL DEFAULT '',
  cta_pt TEXT NOT NULL DEFAULT '',
  cta_en TEXT NOT NULL DEFAULT '',
  cta_es TEXT NOT NULL DEFAULT '',
  features_pt TEXT[] NOT NULL DEFAULT '{}',
  features_en TEXT[] NOT NULL DEFAULT '{}',
  features_es TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.plan_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view (public pricing page)
CREATE POLICY "Anyone can view plan settings"
ON public.plan_settings FOR SELECT
USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can insert plan settings"
ON public.plan_settings FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update plan settings"
ON public.plan_settings FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete plan settings"
ON public.plan_settings FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed defaults
INSERT INTO public.plan_settings (plan_key, sort_order, highlight, badge, card_link, pix_link, price_brl, price_usd, name_pt, name_en, name_es, desc_pt, desc_en, desc_es, cta_pt, cta_en, cta_es, features_pt, features_en, features_es) VALUES
('start', 1, false, NULL, NULL, 'https://pay.lowify.com.br/go.php?offer=2jbo01y',
 'R$ 9,90', '$1.99',
 'Start', 'Start', 'Start',
 'Ideal para começar sua transformação', 'Perfect to start your transformation', 'Ideal para comenzar tu transformación',
 'Assinar Start', 'Subscribe Start', 'Suscribirse a Start',
 ARRAY['5 scans por dia','Histórico de 30 dias','Análise nutricional com IA','Sugestões personalizadas','Receitas com IA'],
 ARRAY['5 scans per day','30-day history','AI nutritional analysis','Personalized suggestions','AI Recipes'],
 ARRAY['5 escaneos por día','Historial de 30 días','Análisis nutricional con IA','Sugerencias personalizadas','Recetas con IA']),
('pro', 2, true, 'MAIS POPULAR', 'https://adsroi.com.br/checkout/9PmDwk', 'https://pay.lowify.com.br/checkout?product_id=LjGA4s',
 'R$ 19,90', '$3.99',
 'PRO', 'PRO', 'PRO',
 'Para quem leva a sério', 'For those who are serious', 'Para quienes van en serio',
 'Assinar PRO', 'Subscribe PRO', 'Suscribirse a PRO',
 ARRAY['Scans ilimitados','Histórico completo','Análise avançada com IA','Sugestões personalizadas','Dashboard completo','Exportar relatórios','Suporte prioritário'],
 ARRAY['Unlimited scans','Full history','Advanced AI analysis','Personalized suggestions','Complete dashboard','Export reports','Priority support'],
 ARRAY['Escaneos ilimitados','Historial completo','Análisis avanzado con IA','Sugerencias personalizadas','Panel completo','Exportar informes','Soporte prioritario']),
('premium', 3, false, NULL, 'https://adsroi.com.br/checkout/9PmDwk?offer=offer-1776009383029', 'https://pay.lowify.com.br/go.php?offer=2sweh1d',
 'R$ 39,90', '$7.99',
 'Premium', 'Premium', 'Premium',
 'Para profissionais', 'For professionals', 'Para profesionales',
 'Assinar Premium', 'Subscribe Premium', 'Suscribirse a Premium',
 ARRAY['Tudo do PRO','Plano alimentar personalizado','Integração com smartwatch','Consultas com nutricionista IA','API para integrações','Multi-perfil (família)'],
 ARRAY['Everything in PRO','Personalized meal plan','Smartwatch integration','AI nutritionist consultations','API for integrations','Multi-profile (family)'],
 ARRAY['Todo lo del PRO','Plan alimentario personalizado','Integración con smartwatch','Consultas con nutricionista IA','API para integraciones','Multi-perfil (familia)']);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_plan_settings_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER plan_settings_updated_at
BEFORE UPDATE ON public.plan_settings
FOR EACH ROW EXECUTE FUNCTION public.update_plan_settings_updated_at();
