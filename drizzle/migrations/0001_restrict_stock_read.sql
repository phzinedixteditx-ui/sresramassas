DROP POLICY IF EXISTS stock_read ON public.stock_settings;
CREATE POLICY stock_read ON public.stock_settings FOR SELECT TO anon, authenticated
  USING (id = 'unavailable_ingredients');