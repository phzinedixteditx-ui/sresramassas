-- Concede permissão de exclusão para usuários autenticados (admin e staff)
GRANT DELETE ON public.orders TO authenticated;

-- Cria política RLS para permitir que administradores e equipe excluam pedidos
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;

CREATE POLICY "Admins can delete orders" ON public.orders
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
