DROP POLICY IF EXISTS products_select_public ON public.products;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;