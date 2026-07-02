
-- Products: split policies so anon doesn't need has_role
DROP POLICY IF EXISTS "products_select" ON public.products;
DROP POLICY IF EXISTS "products_admin_all" ON public.products;

CREATE POLICY "products_select_public" ON public.products
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "products_admin_all" ON public.products
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Categories: same treatment
DROP POLICY IF EXISTS "categories_select" ON public.categories;
DROP POLICY IF EXISTS "categories_admin_all" ON public.categories;

CREATE POLICY "categories_select_public" ON public.categories
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "categories_admin_all" ON public.categories
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Revoke has_role from anon; only authenticated (for RLS on admin-scoped tables) may call it
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
