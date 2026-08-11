ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_order_type_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_order_type_check CHECK (order_type IN ('retirada','entrega','local'));

DROP FUNCTION IF EXISTS public.create_order(text,text,text,text,text,text,text,text,text,text,text,text[],boolean,text,text[],text);

CREATE FUNCTION public.create_order(
  p_customer_name text,
  p_phone text,
  p_order_type text,
  p_address text,
  p_number text,
  p_complement text,
  p_neighborhood text,
  p_reference text,
  p_size text,
  p_pasta_type text,
  p_sauce text,
  p_ingredients text[],
  p_shrimp boolean,
  p_saute_type text,
  p_finishing text[],
  p_notes text
) RETURNS TABLE (order_number integer, total numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_base numeric;
  v_limit int;
  v_shrimp_price numeric := 0;
  v_total numeric;
  v_num integer;
BEGIN
  IF length(trim(coalesce(p_customer_name,''))) < 2 THEN RAISE EXCEPTION 'Nome inválido'; END IF;
  IF length(regexp_replace(coalesce(p_phone,''), '\D', '', 'g')) < 10 THEN RAISE EXCEPTION 'Telefone inválido'; END IF;
  IF p_order_type NOT IN ('retirada','entrega','local') THEN RAISE EXCEPTION 'Tipo de pedido inválido'; END IF;
  IF p_size = 'Pequeno' THEN v_base := 24; v_limit := 6;
  ELSIF p_size = 'Grande' THEN v_base := 27; v_limit := 8;
  ELSE RAISE EXCEPTION 'Tamanho inválido'; END IF;
  IF coalesce(array_length(p_ingredients, 1), 0) > v_limit THEN RAISE EXCEPTION 'Limite de ingredientes excedido'; END IF;
  IF p_order_type = 'entrega' AND (length(trim(coalesce(p_address,''))) = 0 OR length(trim(coalesce(p_neighborhood,''))) = 0) THEN
    RAISE EXCEPTION 'Endereço obrigatório para entrega';
  END IF;
  IF p_shrimp THEN v_shrimp_price := 10; END IF;
  v_total := v_base + v_shrimp_price;

  INSERT INTO public.orders (
    customer_name, phone, order_type, address, number, complement, neighborhood, reference,
    size, base_price, pasta_type, sauce, ingredients, shrimp, shrimp_price, saute_type, finishing, notes, total
  ) VALUES (
    trim(p_customer_name), p_phone, p_order_type,
    nullif(trim(coalesce(p_address,'')),''), nullif(trim(coalesce(p_number,'')),''),
    nullif(trim(coalesce(p_complement,'')),''), nullif(trim(coalesce(p_neighborhood,'')),''),
    nullif(trim(coalesce(p_reference,'')),''),
    p_size, v_base, p_pasta_type, p_sauce, coalesce(p_ingredients, '{}'), coalesce(p_shrimp,false),
    v_shrimp_price, p_saute_type, coalesce(p_finishing, '{}'),
    nullif(trim(coalesce(p_notes,'')),''), v_total
  ) RETURNING orders.order_number, orders.total INTO v_num, v_total;

  RETURN QUERY SELECT v_num, v_total;
END; $$;

REVOKE EXECUTE ON FUNCTION public.create_order(text,text,text,text,text,text,text,text,text,text,text,text[],boolean,text,text[],text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order(text,text,text,text,text,text,text,text,text,text,text,text[],boolean,text,text[],text) TO anon, authenticated;