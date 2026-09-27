CREATE OR REPLACE FUNCTION public.submit_enquiry(p_details jsonb)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_reference text; v_name text; v_location text;
BEGIN
  v_name := trim(p_details->>'full_name');
  v_location := trim(p_details->>'location');
  IF length(v_name) NOT BETWEEN 2 AND 160 OR length(trim(p_details->>'phone')) NOT BETWEEN 6 AND 40 OR length(v_location) NOT BETWEEN 2 AND 250 OR length(trim(p_details->>'description')) NOT BETWEEN 5 AND 5000 OR (nullif(p_details->>'service_id','') IS NULL AND length(trim(coalesce(p_details->>'service_other',''))) < 2) THEN
    RAISE EXCEPTION 'Please complete your name, phone, location, service and job description.';
  END IF;
  IF jsonb_array_length(coalesce(p_details->'attachments','[]'::jsonb)) > 8 THEN RAISE EXCEPTION 'Too many attachments'; END IF;
  INSERT INTO public.enquiries (full_name,phone,whatsapp,email,location,service_id,service_other,description,property_type,preferred_date,preferred_time,urgency,attachments,created_by)
  VALUES (v_name,trim(p_details->>'phone'),nullif(trim(p_details->>'whatsapp'),''),nullif(trim(p_details->>'email'),''),v_location,nullif(p_details->>'service_id','')::uuid,nullif(trim(p_details->>'service_other'),''),trim(p_details->>'description'),nullif(p_details->>'property_type',''),nullif(p_details->>'preferred_date','')::date,nullif(p_details->>'preferred_time',''),coalesce(nullif(p_details->>'urgency',''),'normal'),coalesce(p_details->'attachments','[]'::jsonb),auth.uid())
  RETURNING reference INTO v_reference;
  INSERT INTO public.notifications (audience,title,body,link) VALUES ('staff','New quote request',v_name || ' — ' || v_location || ' (' || v_reference || ')','/admin/enquiries');
  RETURN v_reference;
END; $$;
REVOKE ALL ON FUNCTION public.submit_enquiry(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_enquiry(jsonb) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.submit_booking(p_details jsonb)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_reference text; v_name text; v_location text;
BEGIN
  v_name := trim(p_details->>'full_name'); v_location := trim(p_details->>'location');
  IF length(v_name) NOT BETWEEN 2 AND 160 OR length(trim(p_details->>'phone')) NOT BETWEEN 6 AND 40 OR length(v_location) NOT BETWEEN 2 AND 250 OR nullif(p_details->>'scheduled_date','') IS NULL OR nullif(p_details->>'scheduled_time','') IS NULL THEN
    RAISE EXCEPTION 'Please complete your name, phone, location, date and time.';
  END IF;
  INSERT INTO public.bookings (full_name,phone,whatsapp,email,location,service_id,description,scheduled_date,scheduled_time,created_by)
  VALUES (v_name,trim(p_details->>'phone'),nullif(trim(p_details->>'whatsapp'),''),nullif(trim(p_details->>'email'),''),v_location,nullif(p_details->>'service_id','')::uuid,nullif(trim(p_details->>'description'),''), (p_details->>'scheduled_date')::date,p_details->>'scheduled_time',auth.uid())
  RETURNING reference INTO v_reference;
  INSERT INTO public.notifications (audience,title,body,link) VALUES ('staff','New site visit booking',v_name || ' — ' || v_location || ' (' || v_reference || ')','/admin/bookings');
  RETURN v_reference;
END; $$;
REVOKE ALL ON FUNCTION public.submit_booking(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_booking(jsonb) TO anon, authenticated;