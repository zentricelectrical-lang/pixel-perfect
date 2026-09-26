
CREATE POLICY "enquiry_uploads_insert" ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'customer-uploads' AND (storage.foldername(name))[1] = 'enquiries');
CREATE POLICY "customer_uploads_staff_all" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'customer-uploads' AND public.is_staff(auth.uid()))
  WITH CHECK (bucket_id = 'customer-uploads' AND public.is_staff(auth.uid()));
CREATE POLICY "customer_uploads_own_folder" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'customer-uploads' AND (storage.foldername(name))[1] = 'users'
         AND (storage.foldername(name))[2] = auth.uid()::text);
CREATE POLICY "customer_uploads_own_folder_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'customer-uploads' AND (storage.foldername(name))[1] = 'users'
              AND (storage.foldername(name))[2] = auth.uid()::text);
CREATE POLICY "site_media_read" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'site-media');
CREATE POLICY "site_media_staff_write" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'site-media' AND public.is_staff(auth.uid()))
  WITH CHECK (bucket_id = 'site-media' AND public.is_staff(auth.uid()));
