-- Basic anti-spam guard on the contact form: block obvious flooding
-- without needing an external CAPTCHA service.
CREATE OR REPLACE FUNCTION public.limit_contact_messages()
RETURNS TRIGGER AS $$
DECLARE
  recent_count INT;
  same_text_count INT;
BEGIN
  -- No more than 5 messages total in the last 5 minutes, from anyone.
  SELECT COUNT(*) INTO recent_count
    FROM public.contact_messages
    WHERE created_at > now() - interval '5 minutes';
  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Too many messages sent recently, please try again later.';
  END IF;

  -- Same exact message text repeated more than twice in the last 24h
  -- is almost certainly a bot re-sending the same spam payload.
  SELECT COUNT(*) INTO same_text_count
    FROM public.contact_messages
    WHERE message = NEW.message AND created_at > now() - interval '24 hours';
  IF same_text_count >= 2 THEN
    RAISE EXCEPTION 'Duplicate message detected.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_limit_contact_messages ON public.contact_messages;
CREATE TRIGGER trg_limit_contact_messages
  BEFORE INSERT ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.limit_contact_messages();
