-- Recalculate each order item's price straight from the real product row
-- (never trust the price the browser sends), and reject the insert if
-- there isn't enough stock or the product is inactive/missing.
CREATE OR REPLACE FUNCTION public.validate_order_item()
RETURNS TRIGGER AS $$
DECLARE
  real_price BIGINT;
  available_stock INT;
  active BOOLEAN;
BEGIN
  SELECT price_toman, stock, is_active
    INTO real_price, available_stock, active
    FROM public.products
    WHERE id = NEW.product_id;

  IF real_price IS NULL THEN
    RAISE EXCEPTION 'Product % not found', NEW.product_id;
  END IF;

  IF NOT active THEN
    RAISE EXCEPTION 'Product % is not available', NEW.product_id;
  END IF;

  IF NEW.quantity > available_stock THEN
    RAISE EXCEPTION 'Insufficient stock for product % (requested %, available %)',
      NEW.product_id, NEW.quantity, available_stock;
  END IF;

  -- Always use the real, current DB price — ignore whatever the client sent.
  NEW.unit_price_toman := real_price;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_validate_order_item ON public.order_items;
CREATE TRIGGER trg_validate_order_item
  BEFORE INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.validate_order_item();


-- Whenever order items change, recompute the parent order's subtotal,
-- shipping, and total from the (now-verified) item prices — never from
-- whatever the client submitted when the order row was first created.
CREATE OR REPLACE FUNCTION public.recompute_order_totals()
RETURNS TRIGGER AS $$
DECLARE
  target_order UUID;
  new_subtotal BIGINT;
  new_shipping BIGINT;
BEGIN
  target_order := COALESCE(NEW.order_id, OLD.order_id);

  SELECT COALESCE(SUM(unit_price_toman * quantity), 0)
    INTO new_subtotal
    FROM public.order_items
    WHERE order_id = target_order;

  -- Keep this in sync with the shipping rule in checkout.tsx:
  -- free shipping over 1,000,000 toman, otherwise a flat 80,000 toman fee.
  new_shipping := CASE WHEN new_subtotal >= 1000000 THEN 0 ELSE 80000 END;

  UPDATE public.orders
    SET subtotal_toman = new_subtotal,
        shipping_toman = new_shipping,
        total_toman = new_subtotal + new_shipping
    WHERE id = target_order;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_recompute_order_totals ON public.order_items;
CREATE TRIGGER trg_recompute_order_totals
  AFTER INSERT OR UPDATE OR DELETE ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.recompute_order_totals();
