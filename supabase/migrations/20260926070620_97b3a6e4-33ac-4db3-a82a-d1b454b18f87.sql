
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.next_doc_number(text) FROM public;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM public;
REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM public;
REVOKE ALL ON FUNCTION public.current_customer_id() FROM public;
REVOKE ALL ON FUNCTION public.current_technician_id() FROM public;
GRANT EXECUTE ON FUNCTION public.next_doc_number(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_customer_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_technician_id() TO anon, authenticated;
