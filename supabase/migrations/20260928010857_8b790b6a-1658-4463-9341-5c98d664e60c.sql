CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), NEW.email, NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer') ON CONFLICT DO NOTHING;
  IF lower(NEW.email) = 'zentricelectrical@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'owner') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $function$;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'owner' FROM auth.users WHERE lower(email) = 'zentricelectrical@gmail.com'
ON CONFLICT DO NOTHING;