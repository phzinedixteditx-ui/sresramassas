CREATE OR REPLACE FUNCTION public.create_order(
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
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_base numeric(10,2);
  v_limit int;
  v_shrimp_price numeric(10,2);
  v_number integer;
BEGIN
  IF p_size = 'pequeno' THEN v_base := 24.00; v_limit := 6;
  ELSIF p_size = 'grande' THEN v_base := 27.00; v_limit := 8;
  ELSE RAISE EXCEPTION 'Tamanho inválido';
  END IF;

  IF coalesce(array_length(p_ingredients, 1), 0) > v_limit THEN
    RAISE EXCEPTION 'Limite de ingredientes excedido';
  END IF;

  IF p_order_type NOT IN ('retirada','entrega') THEN RAISE EXCEPTION 'Tipo de pedido inválido'; END IF;
  IF length(trim(p_customer_name)) < 2 OR length(p_customer_name) > 80 THEN RAISE EXCEPTION 'Nome inválido'; END IF;
  IF length(regexp_replace(p_phone,'\D','','g')) < 10 THEN RAISE EXCEPTION 'Telefone inválido'; END IF;

  v_shrimp_price := CASE WHEN p_shrimp THEN 10.00 ELSE 0 END;

  INSERT INTO public.orders (
    customer_name, phone, order_type, address, number, complement, neighborhood, reference,
    size, base_price, pasta_type, sauce, ingredients, shrimp, shrimp_price, saute_type,
    finishing, notes, total
  ) VALUES (
    trim(p_customer_name), p_phone, p_order_type,
    nullif(trim(coalesce(p_address,'')),''), nullif(trim(coalesce(p_number,'')),''),
    nullif(trim(coalesce(p_complement,'')),''), nullif(trim(coalesce(p_neighborhood,'')),''),
    nullif(trim(coalesce(p_reference,'')),''),
    p_size, v_base, p_pasta_type, p_sauce, coalesce(p_ingredients,'{}'), coalesce(p_shrimp,false),
    v_shrimp_price, p_saute_type, coalesce(p_finishing,'{}'), left(nullif(trim(coalesce(p_notes,'')),''), 400),
    v_base + v_shrimp_price
  ) RETURNING order_number INTO v_number;

  RETURN v_number;
END; $$;

REVOKE EXECUTE ON FUNCTION public.create_order(text,text,text,text,text,text,text,text,text,text,text,text[],boolean,text,text[],text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order(text,text,text,text,text,text,text,text,text,text,text,text[],boolean,text,text[],text) TO anon, authenticated;