CREATE TABLE public.stock_settings (
  id text PRIMARY KEY CHECK (id = 'unavailable_ingredients'),
  unavailable_items text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.stock_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.stock_settings TO authenticated;
GRANT ALL ON public.stock_settings TO service_role;
ALTER TABLE public.stock_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY stock_read ON public.stock_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY stock_insert ON public.stock_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY stock_update ON public.stock_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_settings;