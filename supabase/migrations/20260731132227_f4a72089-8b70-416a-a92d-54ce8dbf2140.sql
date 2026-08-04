
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('owner','manager','staff');
CREATE TYPE public.table_location AS ENUM ('indoor','outdoor','bar','private','window');
CREATE TYPE public.table_status AS ENUM ('available','occupied','reserved','unavailable');
CREATE TYPE public.reservation_status AS ENUM ('pending','confirmed','seated','completed','cancelled','no_show');
CREATE TYPE public.reservation_source AS ENUM ('online','walk_in','phone','admin');
CREATE TYPE public.waitlist_status AS ENUM ('waiting','notified','seated','cancelled','expired');
CREATE TYPE public.occasion_type AS ENUM ('none','birthday','anniversary','business','other');

-- UPDATED_AT HELPER
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- RESTAURANTS
CREATE TABLE public.restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  phone text,
  email text,
  address text,
  timezone text NOT NULL DEFAULT 'America/New_York',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- STAFF
CREATE TABLE public.staff_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE,
  full_name text,
  email text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.can_manage(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('owner','manager'));
$$;

-- SETTINGS
CREATE TABLE public.restaurant_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL UNIQUE REFERENCES public.restaurants(id) ON DELETE CASCADE,
  opening_hours jsonb NOT NULL DEFAULT '{"0":{"open":"11:30","close":"22:00","closed":false},"1":{"open":"11:30","close":"22:00","closed":false},"2":{"open":"11:30","close":"22:00","closed":false},"3":{"open":"11:30","close":"22:00","closed":false},"4":{"open":"11:30","close":"22:00","closed":false},"5":{"open":"11:30","close":"23:00","closed":false},"6":{"open":"11:30","close":"23:00","closed":false}}'::jsonb,
  default_duration_minutes int NOT NULL DEFAULT 120,
  buffer_minutes int NOT NULL DEFAULT 15,
  slot_interval_minutes int NOT NULL DEFAULT 30,
  max_covers_per_slot int NOT NULL DEFAULT 40,
  max_party_size int NOT NULL DEFAULT 12,
  advance_booking_days int NOT NULL DEFAULT 90,
  auto_confirm boolean NOT NULL DEFAULT true,
  cancellation_policy text NOT NULL DEFAULT 'Please cancel at least 2 hours before your reservation time.',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- SECTIONS
CREATE TABLE public.table_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  location public.table_location NOT NULL DEFAULT 'indoor',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- TABLES
CREATE TABLE public.restaurant_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  section_id uuid REFERENCES public.table_sections(id) ON DELETE SET NULL,
  table_number text NOT NULL,
  name text,
  capacity int NOT NULL DEFAULT 2,
  minimum_guests int NOT NULL DEFAULT 1,
  maximum_guests int NOT NULL DEFAULT 4,
  location public.table_location NOT NULL DEFAULT 'indoor',
  status public.table_status NOT NULL DEFAULT 'available',
  description text,
  pos_x int NOT NULL DEFAULT 0,
  pos_y int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, table_number)
);

-- CUSTOMERS
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  notes text,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  total_reservations int NOT NULL DEFAULT 0,
  completed_visits int NOT NULL DEFAULT 0,
  no_show_count int NOT NULL DEFAULT 0,
  last_visit_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, phone)
);

-- RESERVATIONS
CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code text NOT NULL UNIQUE,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  table_id uuid REFERENCES public.restaurant_tables(id) ON DELETE SET NULL,
  guest_count int NOT NULL,
  reserved_at timestamptz NOT NULL,
  duration_minutes int NOT NULL DEFAULT 120,
  buffer_minutes int NOT NULL DEFAULT 15,
  status public.reservation_status NOT NULL DEFAULT 'pending',
  source public.reservation_source NOT NULL DEFAULT 'online',
  preferred_location public.table_location,
  occasion public.occasion_type NOT NULL DEFAULT 'none',
  special_request text,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  internal_notes text,
  created_by uuid,
  seated_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reservations_reserved_at_idx ON public.reservations (restaurant_id, reserved_at);
CREATE INDEX reservations_status_idx ON public.reservations (status);

-- COMBINED TABLES FOR LARGE PARTIES
CREATE TABLE public.reservation_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  table_id uuid NOT NULL REFERENCES public.restaurant_tables(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (reservation_id, table_id)
);
CREATE INDEX reservation_tables_table_idx ON public.reservation_tables (table_id);

-- WAITLIST
CREATE TABLE public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  guest_count int NOT NULL,
  preferred_time timestamptz NOT NULL,
  status public.waitlist_status NOT NULL DEFAULT 'waiting',
  notes text,
  notified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid REFERENCES public.reservations(id) ON DELETE CASCADE,
  waitlist_id uuid REFERENCES public.waitlist(id) ON DELETE CASCADE,
  channel text NOT NULL DEFAULT 'email',
  type text NOT NULL,
  recipient text NOT NULL,
  subject text,
  body text,
  status text NOT NULL DEFAULT 'queued',
  error text,
  scheduled_for timestamptz,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_pending_idx ON public.notifications (status, scheduled_for);

-- AUDIT LOGS
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_label text,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- TRIGGERS
CREATE TRIGGER trg_restaurants_updated BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_staff_updated BEFORE UPDATE ON public.staff_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON public.restaurant_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_tables_updated BEFORE UPDATE ON public.restaurant_tables FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_reservations_updated BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_waitlist_updated BEFORE UPDATE ON public.waitlist FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- GRANTS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurants, public.staff_members, public.user_roles, public.restaurant_settings, public.table_sections, public.restaurant_tables, public.customers, public.reservations, public.reservation_tables, public.waitlist, public.notifications, public.audit_logs TO authenticated;
GRANT ALL ON public.restaurants, public.staff_members, public.user_roles, public.restaurant_settings, public.table_sections, public.restaurant_tables, public.customers, public.reservations, public.reservation_tables, public.waitlist, public.notifications, public.audit_logs TO service_role;

-- RLS
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "staff read restaurants" ON public.restaurants FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "managers update restaurants" ON public.restaurants FOR UPDATE TO authenticated USING (public.can_manage(auth.uid())) WITH CHECK (public.can_manage(auth.uid()));

CREATE POLICY "staff read staff" ON public.staff_members FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "owners manage staff" ON public.staff_members FOR ALL TO authenticated USING (public.has_role(auth.uid(),'owner')) WITH CHECK (public.has_role(auth.uid(),'owner'));

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "owners manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'owner')) WITH CHECK (public.has_role(auth.uid(),'owner'));

CREATE POLICY "staff read settings" ON public.restaurant_settings FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "managers write settings" ON public.restaurant_settings FOR ALL TO authenticated USING (public.can_manage(auth.uid())) WITH CHECK (public.can_manage(auth.uid()));

CREATE POLICY "staff read sections" ON public.table_sections FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "managers write sections" ON public.table_sections FOR ALL TO authenticated USING (public.can_manage(auth.uid())) WITH CHECK (public.can_manage(auth.uid()));

CREATE POLICY "staff read tables" ON public.restaurant_tables FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "staff update table status" ON public.restaurant_tables FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "managers insert tables" ON public.restaurant_tables FOR INSERT TO authenticated WITH CHECK (public.can_manage(auth.uid()));
CREATE POLICY "managers delete tables" ON public.restaurant_tables FOR DELETE TO authenticated USING (public.can_manage(auth.uid()));

CREATE POLICY "staff read customers" ON public.customers FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "managers write customers" ON public.customers FOR ALL TO authenticated USING (public.can_manage(auth.uid())) WITH CHECK (public.can_manage(auth.uid()));

CREATE POLICY "staff read reservations" ON public.reservations FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "staff write reservations" ON public.reservations FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "staff update reservations" ON public.reservations FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "managers delete reservations" ON public.reservations FOR DELETE TO authenticated USING (public.can_manage(auth.uid()));

CREATE POLICY "staff manage reservation tables" ON public.reservation_tables FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "staff manage waitlist" ON public.waitlist FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "staff read notifications" ON public.notifications FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "staff read audit" ON public.audit_logs FOR SELECT TO authenticated USING (public.can_manage(auth.uid()));

-- SEED
INSERT INTO public.restaurants (id, name, slug, phone, email, address)
VALUES ('11111111-1111-4111-8111-111111111111','Himalchuli Bar & Grill','himalchuli','(224) 900-0144','info@himalchulibarandgrill.com','36 Plaistow RD, Haverhill, MA 01830');

INSERT INTO public.restaurant_settings (restaurant_id) VALUES ('11111111-1111-4111-8111-111111111111');

INSERT INTO public.table_sections (id, restaurant_id, name, location, sort_order) VALUES
 ('22222222-2222-4222-8222-000000000001','11111111-1111-4111-8111-111111111111','Main Dining','indoor',1),
 ('22222222-2222-4222-8222-000000000002','11111111-1111-4111-8111-111111111111','Window Row','window',2),
 ('22222222-2222-4222-8222-000000000003','11111111-1111-4111-8111-111111111111','Patio','outdoor',3),
 ('22222222-2222-4222-8222-000000000004','11111111-1111-4111-8111-111111111111','Bar','bar',4),
 ('22222222-2222-4222-8222-000000000005','11111111-1111-4111-8111-111111111111','Private Room','private',5);

INSERT INTO public.restaurant_tables (restaurant_id, section_id, table_number, name, capacity, minimum_guests, maximum_guests, location, description, pos_x, pos_y) VALUES
 ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000002','T1','Window Two',2,1,3,'window','Cozy two-top by the window',0,0),
 ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000002','T2','Window Four',4,2,5,'window','Four-top by the window',1,0),
 ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000002','T3','Window Four',4,2,5,'window','Four-top by the window',2,0),
 ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000001','T4','Main Four',4,2,5,'indoor','Centre of the dining room',0,1),
 ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000001','T5','Main Six',6,4,7,'indoor','Large round table',1,1),
 ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000001','T6','Main Two',2,1,3,'indoor','Two-top',2,1),
 ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000001','T7','Main Four',4,2,5,'indoor','Four-top',3,1),
 ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000003','P1','Patio Two',2,1,3,'outdoor','Patio two-top',0,2),
 ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000003','P2','Patio Four',4,2,5,'outdoor','Patio four-top',1,2),
 ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000003','P3','Patio Six',6,4,7,'outdoor','Patio family table',2,2),
 ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000004','B1','Bar Seat 1-2',2,1,2,'bar','High-top at the bar',0,3),
 ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000004','B2','Bar Seat 3-4',2,1,2,'bar','High-top at the bar',1,3),
 ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000005','VIP-1','Private Eight',8,5,10,'private','Private dining area',0,4),
 ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000005','VIP-2','Private Twelve',12,8,14,'private','Private room, large parties',1,4);
