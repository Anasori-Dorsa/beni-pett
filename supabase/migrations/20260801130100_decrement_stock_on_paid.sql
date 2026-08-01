-- When an order's status flips to 'paid', decrement the stock of every
-- product in that order (never goes below zero).
CREATE OR REPLACE FUNCTION public.decrement_stock_on_paid()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS DISTINCT FROM 'paid') THEN
    UPDATE public.products p
      SET stock = GREATEST(p.stock - oi.quantity, 0)
      FROM public.order_items oi
      WHERE oi.order_id = NEW.id AND oi.product_id = p.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_decrement_stock_on_paid ON public.orders;
CREATE TRIGGER trg_decrement_stock_on_paid
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.decrement_stock_on_paid();
