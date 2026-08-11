CREATE TYPE public.app_role AS ENUM ('admin','staff');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE SEQUENCE public.order_number_seq START 101;

CREATE TYPE public.order_status AS ENUM ('novo','em_preparo','pronto','saiu_entrega','concluido');

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number integer NOT NULL DEFAULT nextval('public.order_number_seq') UNIQUE,
  customer_name text NOT NULL,
  phone text NOT NULL,
  order_type text NOT NULL CHECK (order_type IN ('retirada','entrega')),
  address text,
  number text,
  complement text,
  neighborhood text,
  reference text,
  size text NOT NULL CHECK (size IN ('pequeno','grande')),
  base_price numeric(10,2) NOT NULL,
  pasta_type text NOT NULL,
  sauce text NOT NULL,
  ingredients text[] NOT NULL DEFAULT '{}',
  shrimp boolean NOT NULL DEFAULT false,
  shrimp_price numeric(10,2) NOT NULL DEFAULT 0,
  saute_type text NOT NULL,
  finishing text[] NOT NULL DEFAULT '{}',
  notes text,
  total numeric(10,2) NOT NULL,
  status public.order_status NOT NULL DEFAULT 'novo',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
GRANT USAGE ON SEQUENCE public.order_number_seq TO anon, authenticated, service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create an order" ON public.orders
FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can view orders" ON public.orders
FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));

CREATE POLICY "Admins can update orders" ON public.orders
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'))
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.track_order(p_order_number integer, p_phone text)
RETURNS TABLE (order_number integer, status public.order_status, order_type text, total numeric, created_at timestamptz, customer_name text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT o.order_number, o.status, o.order_type, o.total, o.created_at, o.customer_name
  FROM public.orders o
  WHERE o.order_number = p_order_number
    AND regexp_replace(o.phone,'\D','','g') = regexp_replace(p_phone,'\D','','g')
  LIMIT 1
$$;
GRANT EXECUTE ON FUNCTION public.track_order(integer, text) TO anon, authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;