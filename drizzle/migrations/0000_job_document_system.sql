
-- Roles for future staff
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'finance';

-- Numbering
ALTER TABLE public.jobs ALTER COLUMN reference SET DEFAULT public.next_doc_number('ZEC-J');
ALTER TABLE public.quotes ALTER COLUMN reference SET DEFAULT public.next_doc_number('ZEC-Q');
ALTER TABLE public.invoices ALTER COLUMN reference SET DEFAULT public.next_doc_number('ZEC-INV');
ALTER TABLE public.payments ALTER COLUMN reference SET DEFAULT public.next_doc_number('ZEC-PAY');
ALTER TABLE public.receipts ALTER COLUMN reference SET DEFAULT public.next_doc_number('ZEC-RC');
ALTER TABLE public.jobs ALTER COLUMN status SET DEFAULT 'NEW_ENQUIRY';
ALTER TABLE public.invoices ALTER COLUMN status SET DEFAULT 'DRAFT';

-- Columns
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS company_name text, ADD COLUMN IF NOT EXISTS site_address text;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS site_address text, ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false, ADD COLUMN IF NOT EXISTS archived_at timestamptz;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS scope text, ADD COLUMN IF NOT EXISTS exclusions text, ADD COLUMN IF NOT EXISTS assumptions text, ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS subtotal numeric(12,2) NOT NULL DEFAULT 0, ADD COLUMN IF NOT EXISTS tax_amount numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deposit numeric(12,2) NOT NULL DEFAULT 0, ADD COLUMN IF NOT EXISTS approved_by_name text, ADD COLUMN IF NOT EXISTS approval_signature text,
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1, ADD COLUMN IF NOT EXISTS parent_quote_id uuid REFERENCES public.quotes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false, ADD COLUMN IF NOT EXISTS archived_at timestamptz;
ALTER TABLE public.quote_items ADD COLUMN IF NOT EXISTS item_type text NOT NULL DEFAULT 'material';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS description text, ADD COLUMN IF NOT EXISTS tax_amount numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_instructions text, ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false, ADD COLUMN IF NOT EXISTS archived_at timestamptz;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL, ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS method text, ADD COLUMN IF NOT EXISTS external_reference text, ADD COLUMN IF NOT EXISTS balance_after numeric(12,2), ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS receipts_payment_unique ON public.receipts(payment_id);
ALTER TABLE public.customers ALTER COLUMN customer_number SET DEFAULT public.next_doc_number('ZEC-C');
ALTER TABLE public.job_materials ADD COLUMN IF NOT EXISTS specification text, ADD COLUMN IF NOT EXISTS qty_purchased numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS qty_used numeric NOT NULL DEFAULT 0, ADD COLUMN IF NOT EXISTS supplier text, ADD COLUMN IF NOT EXISTS notes text;

-- Internal material costs are never visible to customers
DROP POLICY IF EXISTS job_materials_select ON public.job_materials;
CREATE POLICY job_materials_select ON public.job_materials FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_materials.job_id AND (public.is_staff(auth.uid()) OR j.technician_id = public.current_technician_id())));

-- Field documents (survey, job card, material list, testing, handover, warranty, maintenance)
CREATE TABLE public.field_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  doc_type text NOT NULL CHECK (doc_type IN ('site_survey','job_card','material_list','testing','handover','warranty','maintenance')),
  reference text UNIQUE,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','COMPLETED')),
  version integer NOT NULL DEFAULT 1,
  is_demo boolean NOT NULL DEFAULT false,
  archived_at timestamptz,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.field_documents TO authenticated;
GRANT ALL ON public.field_documents TO service_role;
ALTER TABLE public.field_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY field_docs_staff ON public.field_documents FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY field_docs_tech_read ON public.field_documents FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.technician_id = public.current_technician_id()));
CREATE POLICY field_docs_tech_write ON public.field_documents FOR INSERT TO authenticated WITH CHECK (doc_type IN ('site_survey','job_card','testing') AND EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.technician_id = public.current_technician_id()));
CREATE POLICY field_docs_tech_update ON public.field_documents FOR UPDATE TO authenticated USING (status = 'DRAFT' AND EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.technician_id = public.current_technician_id())) WITH CHECK (doc_type IN ('site_survey','job_card','testing'));
CREATE POLICY field_docs_customer_read ON public.field_documents FOR SELECT TO authenticated USING (status = 'COMPLETED' AND doc_type IN ('handover','warranty','maintenance') AND customer_id = public.current_customer_id());

CREATE TABLE public.document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity text NOT NULL,
  entity_id uuid NOT NULL,
  version integer NOT NULL,
  snapshot jsonb NOT NULL,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.document_versions TO authenticated;
GRANT ALL ON public.document_versions TO service_role;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY doc_versions_staff_read ON public.document_versions FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY doc_versions_staff_insert ON public.document_versions FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

-- Field document numbering, customer carry-forward, locking + versions
CREATE OR REPLACE FUNCTION public.field_document_before() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.reference := public.next_doc_number(CASE NEW.doc_type WHEN 'site_survey' THEN 'ZEC-SS' WHEN 'job_card' THEN 'ZEC-JC' WHEN 'material_list' THEN 'ZEC-MAT'
      WHEN 'testing' THEN 'ZEC-TST' WHEN 'handover' THEN 'ZEC-HO' WHEN 'warranty' THEN 'ZEC-W' ELSE 'ZEC-MA' END);
    SELECT customer_id, is_demo INTO NEW.customer_id, NEW.is_demo FROM public.jobs WHERE id = NEW.job_id;
    RETURN NEW;
  END IF;
  IF OLD.status = 'COMPLETED' AND (NEW.data IS DISTINCT FROM OLD.data OR NEW.job_id <> OLD.job_id OR NEW.doc_type <> OLD.doc_type) THEN
    RAISE EXCEPTION 'This document is completed and locked. Reopen it to create a new version.';
  END IF;
  IF OLD.status = 'COMPLETED' AND NEW.status = 'DRAFT' THEN
    INSERT INTO public.document_versions(entity, entity_id, version, snapshot) VALUES ('field_documents', OLD.id, OLD.version, to_jsonb(OLD));
    NEW.version := OLD.version + 1;
  END IF;
  NEW.reference := OLD.reference; NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER trg_field_documents_before BEFORE INSERT OR UPDATE ON public.field_documents FOR EACH ROW EXECUTE FUNCTION public.field_document_before();

-- Quote totals (server-side, never trusted from the browser) + locking
CREATE OR REPLACE FUNCTION public.quote_before() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE items numeric;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status <> 'DRAFT' AND (NEW.labour_cost <> OLD.labour_cost OR NEW.transport_cost <> OLD.transport_cost OR NEW.other_charges <> OLD.other_charges
     OR NEW.discount <> OLD.discount OR NEW.tax_rate <> OLD.tax_rate OR NEW.deposit <> OLD.deposit OR NEW.customer_id <> OLD.customer_id
     OR NEW.scope IS DISTINCT FROM OLD.scope OR NEW.description IS DISTINCT FROM OLD.description OR NEW.title <> OLD.title) THEN
    RAISE EXCEPTION 'Quotation % has been issued and is locked. Create a revision instead.', OLD.reference;
  END IF;
  IF NEW.labour_cost < 0 OR NEW.transport_cost < 0 OR NEW.other_charges < 0 OR NEW.discount < 0 OR NEW.deposit < 0 OR NEW.tax_rate < 0 OR NEW.tax_rate > 100 THEN
    RAISE EXCEPTION 'Amounts cannot be negative and tax must be between 0 and 100%%.';
  END IF;
  SELECT COALESCE(sum(quantity * unit_price), 0) INTO items FROM public.quote_items WHERE quote_id = NEW.id;
  NEW.subtotal := round(items + NEW.labour_cost + NEW.transport_cost + NEW.other_charges, 2);
  IF NEW.discount > NEW.subtotal THEN RAISE EXCEPTION 'Discount cannot exceed the subtotal.'; END IF;
  NEW.tax_amount := round((NEW.subtotal - NEW.discount) * NEW.tax_rate / 100, 2);
  NEW.total := NEW.subtotal - NEW.discount + NEW.tax_amount;
  IF NEW.deposit > NEW.total THEN RAISE EXCEPTION 'Deposit cannot exceed the total.'; END IF;
  IF TG_OP = 'UPDATE' AND NEW.status IN ('ACCEPTED','REJECTED') AND OLD.status <> NEW.status THEN NEW.responded_at := now(); END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_quote_before BEFORE INSERT OR UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.quote_before();

CREATE OR REPLACE FUNCTION public.quote_item_change() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE qid uuid := COALESCE(NEW.quote_id, OLD.quote_id); st text;
BEGIN
  SELECT status INTO st FROM public.quotes WHERE id = qid;
  IF st IS NOT NULL AND st <> 'DRAFT' THEN RAISE EXCEPTION 'This quotation has been issued and its items are locked.'; END IF;
  IF TG_OP <> 'DELETE' AND (NEW.quantity <= 0 OR NEW.unit_price < 0) THEN RAISE EXCEPTION 'Quantity must be above zero and price cannot be negative.'; END IF;
  RETURN COALESCE(NEW, OLD);
END $$;
CREATE TRIGGER trg_quote_item_before BEFORE INSERT OR UPDATE OR DELETE ON public.quote_items FOR EACH ROW EXECUTE FUNCTION public.quote_item_change();
CREATE OR REPLACE FUNCTION public.quote_item_after() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN UPDATE public.quotes SET updated_at = now() WHERE id = COALESCE(NEW.quote_id, OLD.quote_id); RETURN NULL; END $$;
CREATE TRIGGER trg_quote_item_after AFTER INSERT OR UPDATE OR DELETE ON public.quote_items FOR EACH ROW EXECUTE FUNCTION public.quote_item_after();

-- Quote accepted -> job approved
CREATE OR REPLACE FUNCTION public.quote_after() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.job_id IS NOT NULL AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'ACCEPTED' THEN
      UPDATE public.jobs SET status = 'APPROVED' WHERE id = NEW.job_id AND status IN ('NEW_ENQUIRY','SITE_SURVEY','QUOTATION_SENT','AWAITING_APPROVAL','NEW');
    ELSIF NEW.status = 'SENT' THEN
      UPDATE public.jobs SET status = 'AWAITING_APPROVAL' WHERE id = NEW.job_id AND status IN ('NEW_ENQUIRY','SITE_SURVEY','QUOTATION_SENT','NEW');
    END IF;
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER trg_quote_after AFTER UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.quote_after();

-- Invoice totals, balance from confirmed payments only, locking
CREATE OR REPLACE FUNCTION public.invoice_before() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE items numeric; paid numeric;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status NOT IN ('DRAFT') AND (NEW.discount <> OLD.discount OR NEW.tax_rate <> OLD.tax_rate OR NEW.customer_id <> OLD.customer_id) THEN
    RAISE EXCEPTION 'Invoice % has been issued and is locked.', OLD.reference;
  END IF;
  IF NEW.discount < 0 OR NEW.tax_rate < 0 OR NEW.tax_rate > 100 THEN RAISE EXCEPTION 'Invalid discount or tax.'; END IF;
  SELECT COALESCE(sum(quantity * unit_price), 0) INTO items FROM public.invoice_items WHERE invoice_id = NEW.id;
  SELECT COALESCE(sum(amount), 0) INTO paid FROM public.payments WHERE invoice_id = NEW.id AND status = 'CONFIRMED';
  NEW.subtotal := round(items, 2);
  IF NEW.discount > NEW.subtotal THEN RAISE EXCEPTION 'Discount cannot exceed the subtotal.'; END IF;
  NEW.tax_amount := round((NEW.subtotal - NEW.discount) * NEW.tax_rate / 100, 2);
  NEW.total := NEW.subtotal - NEW.discount + NEW.tax_amount;
  NEW.amount_paid := paid;
  IF NEW.status NOT IN ('CANCELLED') THEN
    IF paid > 0 AND paid >= NEW.total THEN NEW.status := 'PAID';
    ELSIF paid > 0 THEN NEW.status := 'PARTIALLY_PAID';
    ELSIF NEW.status IN ('PAID','PARTIALLY_PAID','UNPAID') THEN NEW.status := 'SENT';
    END IF;
    IF NEW.status = 'SENT' AND NEW.due_date IS NOT NULL AND NEW.due_date < current_date THEN NEW.status := 'OVERDUE'; END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_invoice_before BEFORE INSERT OR UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.invoice_before();

CREATE OR REPLACE FUNCTION public.invoice_after() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.job_id IS NOT NULL AND (TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status) THEN
    UPDATE public.jobs SET status = CASE NEW.status WHEN 'PAID' THEN 'PAID' WHEN 'PARTIALLY_PAID' THEN 'PARTIALLY_PAID' ELSE 'INVOICED' END
    WHERE id = NEW.job_id AND status NOT IN ('CLOSED','CANCELLED') AND NEW.status IN ('SENT','OVERDUE','PAID','PARTIALLY_PAID');
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER trg_invoice_after AFTER INSERT OR UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.invoice_after();

CREATE OR REPLACE FUNCTION public.invoice_item_change() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE st text;
BEGIN
  SELECT status INTO st FROM public.invoices WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  IF st IS NOT NULL AND st <> 'DRAFT' THEN RAISE EXCEPTION 'This invoice has been issued and its items are locked.'; END IF;
  IF TG_OP <> 'DELETE' AND (NEW.quantity <= 0 OR NEW.unit_price < 0) THEN RAISE EXCEPTION 'Quantity must be above zero and price cannot be negative.'; END IF;
  RETURN COALESCE(NEW, OLD);
END $$;
CREATE TRIGGER trg_invoice_item_before BEFORE INSERT OR UPDATE OR DELETE ON public.invoice_items FOR EACH ROW EXECUTE FUNCTION public.invoice_item_change();
CREATE OR REPLACE FUNCTION public.invoice_item_after() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN UPDATE public.invoices SET updated_at = now() WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id); RETURN NULL; END $$;
CREATE TRIGGER trg_invoice_item_after AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items FOR EACH ROW EXECUTE FUNCTION public.invoice_item_after();

-- Payments: validation, no overpayment, immutable once confirmed
CREATE OR REPLACE FUNCTION public.payment_before() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inv record; other numeric;
BEGIN
  IF NEW.amount IS NULL OR NEW.amount <= 0 THEN RAISE EXCEPTION 'Payment amount must be greater than zero.'; END IF;
  IF NEW.method NOT IN ('mpesa','cash','bank','other') THEN RAISE EXCEPTION 'Unknown payment method.'; END IF;
  IF NEW.status NOT IN ('PENDING','CONFIRMED','FAILED','REFUNDED') THEN RAISE EXCEPTION 'Unknown payment status.'; END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'CONFIRMED' AND (NEW.amount <> OLD.amount OR NEW.invoice_id IS DISTINCT FROM OLD.invoice_id OR NEW.status NOT IN ('CONFIRMED','REFUNDED')) THEN
    RAISE EXCEPTION 'A confirmed payment cannot be changed. Mark it refunded and record a new one.';
  END IF;
  IF NEW.invoice_id IS NOT NULL THEN
    SELECT * INTO inv FROM public.invoices WHERE id = NEW.invoice_id;
    IF inv.status IN ('CANCELLED','DRAFT') THEN RAISE EXCEPTION 'Issue the invoice before recording payments.'; END IF;
    NEW.customer_id := inv.customer_id; NEW.job_id := COALESCE(NEW.job_id, inv.job_id); NEW.is_demo := inv.is_demo;
    IF NEW.status = 'CONFIRMED' THEN
      SELECT COALESCE(sum(amount),0) INTO other FROM public.payments WHERE invoice_id = NEW.invoice_id AND status = 'CONFIRMED' AND id <> NEW.id;
      IF other + NEW.amount > inv.total THEN RAISE EXCEPTION 'Payment exceeds the balance due (KSh %).', inv.total - other; END IF;
    END IF;
  END IF;
  IF NEW.status = 'CONFIRMED' AND NEW.paid_at IS NULL THEN NEW.paid_at := now(); END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_payment_before BEFORE INSERT OR UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.payment_before();
CREATE OR REPLACE FUNCTION public.payment_after() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.invoices SET updated_at = now() WHERE id IN (NEW.invoice_id, OLD.invoice_id);
  RETURN NULL;
END $$;
CREATE TRIGGER trg_payment_after AFTER INSERT OR UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.payment_after();

-- Receipts only from confirmed payments; values copied from the payment
CREATE OR REPLACE FUNCTION public.receipt_before() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p record; inv record;
BEGIN
  IF TG_OP = 'UPDATE' THEN RAISE EXCEPTION 'Receipts cannot be edited.'; END IF;
  SELECT * INTO p FROM public.payments WHERE id = NEW.payment_id;
  IF p.id IS NULL OR p.status <> 'CONFIRMED' THEN RAISE EXCEPTION 'A receipt can only be issued for a confirmed payment.'; END IF;
  NEW.amount := p.amount; NEW.customer_id := p.customer_id; NEW.invoice_id := p.invoice_id; NEW.method := p.method;
  NEW.external_reference := p.external_reference; NEW.is_demo := p.is_demo;
  IF p.invoice_id IS NOT NULL THEN SELECT * INTO inv FROM public.invoices WHERE id = p.invoice_id; NEW.balance_after := inv.total - inv.amount_paid; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_receipt_before BEFORE INSERT OR UPDATE ON public.receipts FOR EACH ROW EXECUTE FUNCTION public.receipt_before();

-- Audit trail
CREATE OR REPLACE FUNCTION public.audit_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE act text; meta jsonb := '{}'::jsonb; rec jsonb := to_jsonb(COALESCE(NEW, OLD));
BEGIN
  act := lower(TG_OP);
  IF TG_OP = 'UPDATE' THEN
    IF (to_jsonb(OLD)->>'status') IS DISTINCT FROM (to_jsonb(NEW)->>'status') THEN
      act := 'status_changed'; meta := jsonb_build_object('from', to_jsonb(OLD)->>'status', 'to', to_jsonb(NEW)->>'status');
    ELSIF (to_jsonb(OLD)->>'archived_at') IS NULL AND (to_jsonb(NEW)->>'archived_at') IS NOT NULL THEN act := 'archived';
    ELSE act := 'edited'; END IF;
  END IF;
  meta := meta || jsonb_build_object('reference', COALESCE(rec->>'reference', rec->>'customer_number'));
  INSERT INTO public.audit_logs(user_id, action, entity, entity_id, metadata) VALUES (auth.uid(), act, TG_TABLE_NAME, (rec->>'id')::uuid, meta);
  RETURN NULL;
END $$;
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['customers','jobs','quotes','invoices','payments','receipts','field_documents'] LOOP
    EXECUTE format('CREATE TRIGGER trg_audit_%1$s AFTER INSERT OR UPDATE OR DELETE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.audit_change()', t);
  END LOOP; END $$;

-- Demo data: owner/admin-only removal
CREATE OR REPLACE FUNCTION public.remove_demo_data() RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer;
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  ALTER TABLE public.receipts DISABLE TRIGGER trg_receipt_before;
  DELETE FROM public.receipts WHERE is_demo OR customer_id IN (SELECT id FROM public.customers WHERE is_demo);
  ALTER TABLE public.receipts ENABLE TRIGGER trg_receipt_before;
  DELETE FROM public.payments WHERE customer_id IN (SELECT id FROM public.customers WHERE is_demo);
  ALTER TABLE public.invoice_items DISABLE TRIGGER trg_invoice_item_before;
  ALTER TABLE public.quote_items DISABLE TRIGGER trg_quote_item_before;
  DELETE FROM public.invoice_items WHERE invoice_id IN (SELECT id FROM public.invoices WHERE customer_id IN (SELECT id FROM public.customers WHERE is_demo));
  DELETE FROM public.quote_items WHERE quote_id IN (SELECT id FROM public.quotes WHERE customer_id IN (SELECT id FROM public.customers WHERE is_demo));
  ALTER TABLE public.invoice_items ENABLE TRIGGER trg_invoice_item_before;
  ALTER TABLE public.quote_items ENABLE TRIGGER trg_quote_item_before;
  DELETE FROM public.invoices WHERE customer_id IN (SELECT id FROM public.customers WHERE is_demo);
  DELETE FROM public.quotes WHERE customer_id IN (SELECT id FROM public.customers WHERE is_demo);
  DELETE FROM public.jobs WHERE customer_id IN (SELECT id FROM public.customers WHERE is_demo);
  DELETE FROM public.customers WHERE is_demo;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;
REVOKE EXECUTE ON FUNCTION public.remove_demo_data() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.remove_demo_data() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.field_document_before(), public.quote_after(), public.invoice_before(), public.invoice_after(), public.payment_before(), public.payment_after(), public.receipt_before(), public.audit_change() FROM public, anon, authenticated;
