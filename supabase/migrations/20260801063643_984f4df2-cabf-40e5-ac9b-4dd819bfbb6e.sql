CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION private.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION private.can_manage(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('owner','manager'));
$$;

CREATE OR REPLACE FUNCTION private.is_staff_of(_user_id uuid, _restaurant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_members sm
    WHERE sm.user_id = _user_id AND sm.is_active AND sm.restaurant_id = _restaurant_id
  ) AND private.is_staff(_user_id);
$$;

CREATE OR REPLACE FUNCTION private.can_manage_restaurant(_user_id uuid, _restaurant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT private.is_staff_of(_user_id, _restaurant_id) AND private.can_manage(_user_id);
$$;

GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_staff(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.can_manage(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_staff_of(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.can_manage_restaurant(uuid, uuid) TO authenticated, service_role;

-- Repoint every policy to the private helpers
DROP POLICY IF EXISTS "staff read own restaurant customers" ON public.customers;
DROP POLICY IF EXISTS "managers write own restaurant customers" ON public.customers;
CREATE POLICY "staff read own restaurant customers" ON public.customers
  FOR SELECT TO authenticated USING (private.is_staff_of(auth.uid(), restaurant_id));
CREATE POLICY "managers write own restaurant customers" ON public.customers
  FOR ALL TO authenticated
  USING (private.can_manage_restaurant(auth.uid(), restaurant_id))
  WITH CHECK (private.can_manage_restaurant(auth.uid(), restaurant_id));

DROP POLICY IF EXISTS "staff read own restaurant reservations" ON public.reservations;
DROP POLICY IF EXISTS "staff update own restaurant reservations" ON public.reservations;
DROP POLICY IF EXISTS "staff insert own restaurant reservations" ON public.reservations;
DROP POLICY IF EXISTS "managers delete own restaurant reservations" ON public.reservations;
CREATE POLICY "staff read own restaurant reservations" ON public.reservations
  FOR SELECT TO authenticated USING (private.is_staff_of(auth.uid(), restaurant_id));
CREATE POLICY "staff update own restaurant reservations" ON public.reservations
  FOR UPDATE TO authenticated
  USING (private.is_staff_of(auth.uid(), restaurant_id))
  WITH CHECK (private.is_staff_of(auth.uid(), restaurant_id));
CREATE POLICY "staff insert own restaurant reservations" ON public.reservations
  FOR INSERT TO authenticated WITH CHECK (private.is_staff_of(auth.uid(), restaurant_id));
CREATE POLICY "managers delete own restaurant reservations" ON public.reservations
  FOR DELETE TO authenticated USING (private.can_manage_restaurant(auth.uid(), restaurant_id));

DROP POLICY IF EXISTS "staff manage own restaurant waitlist" ON public.waitlist;
CREATE POLICY "staff manage own restaurant waitlist" ON public.waitlist
  FOR ALL TO authenticated
  USING (private.is_staff_of(auth.uid(), restaurant_id))
  WITH CHECK (private.is_staff_of(auth.uid(), restaurant_id));

DROP POLICY IF EXISTS "staff read own restaurant tables" ON public.restaurant_tables;
DROP POLICY IF EXISTS "staff update own restaurant tables" ON public.restaurant_tables;
DROP POLICY IF EXISTS "managers insert own restaurant tables" ON public.restaurant_tables;
DROP POLICY IF EXISTS "managers delete own restaurant tables" ON public.restaurant_tables;
CREATE POLICY "staff read own restaurant tables" ON public.restaurant_tables
  FOR SELECT TO authenticated USING (private.is_staff_of(auth.uid(), restaurant_id));
CREATE POLICY "staff update own restaurant tables" ON public.restaurant_tables
  FOR UPDATE TO authenticated
  USING (private.is_staff_of(auth.uid(), restaurant_id))
  WITH CHECK (private.is_staff_of(auth.uid(), restaurant_id));
CREATE POLICY "managers insert own restaurant tables" ON public.restaurant_tables
  FOR INSERT TO authenticated WITH CHECK (private.can_manage_restaurant(auth.uid(), restaurant_id));
CREATE POLICY "managers delete own restaurant tables" ON public.restaurant_tables
  FOR DELETE TO authenticated USING (private.can_manage_restaurant(auth.uid(), restaurant_id));

DROP POLICY IF EXISTS "staff read own restaurant sections" ON public.table_sections;
DROP POLICY IF EXISTS "managers write own restaurant sections" ON public.table_sections;
CREATE POLICY "staff read own restaurant sections" ON public.table_sections
  FOR SELECT TO authenticated USING (private.is_staff_of(auth.uid(), restaurant_id));
CREATE POLICY "managers write own restaurant sections" ON public.table_sections
  FOR ALL TO authenticated
  USING (private.can_manage_restaurant(auth.uid(), restaurant_id))
  WITH CHECK (private.can_manage_restaurant(auth.uid(), restaurant_id));

DROP POLICY IF EXISTS "staff read own restaurant settings" ON public.restaurant_settings;
DROP POLICY IF EXISTS "managers write own restaurant settings" ON public.restaurant_settings;
CREATE POLICY "staff read own restaurant settings" ON public.restaurant_settings
  FOR SELECT TO authenticated USING (private.is_staff_of(auth.uid(), restaurant_id));
CREATE POLICY "managers write own restaurant settings" ON public.restaurant_settings
  FOR ALL TO authenticated
  USING (private.can_manage_restaurant(auth.uid(), restaurant_id))
  WITH CHECK (private.can_manage_restaurant(auth.uid(), restaurant_id));

DROP POLICY IF EXISTS "staff read own restaurant" ON public.restaurants;
DROP POLICY IF EXISTS "managers update own restaurant" ON public.restaurants;
CREATE POLICY "staff read own restaurant" ON public.restaurants
  FOR SELECT TO authenticated USING (private.is_staff_of(auth.uid(), id));
CREATE POLICY "managers update own restaurant" ON public.restaurants
  FOR UPDATE TO authenticated
  USING (private.can_manage_restaurant(auth.uid(), id))
  WITH CHECK (private.can_manage_restaurant(auth.uid(), id));

DROP POLICY IF EXISTS "staff read own restaurant staff" ON public.staff_members;
DROP POLICY IF EXISTS "owners manage staff" ON public.staff_members;
CREATE POLICY "staff read own restaurant staff" ON public.staff_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR private.is_staff_of(auth.uid(), restaurant_id));
CREATE POLICY "owners manage staff" ON public.staff_members
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'owner'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'owner'::public.app_role));

DROP POLICY IF EXISTS "staff manage own restaurant reservation tables" ON public.reservation_tables;
CREATE POLICY "staff manage own restaurant reservation tables" ON public.reservation_tables
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.reservations r
                 WHERE r.id = reservation_tables.reservation_id
                   AND private.is_staff_of(auth.uid(), r.restaurant_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.reservations r
                      WHERE r.id = reservation_tables.reservation_id
                        AND private.is_staff_of(auth.uid(), r.restaurant_id)));

DROP POLICY IF EXISTS "staff read own restaurant notifications" ON public.notifications;
CREATE POLICY "staff read own restaurant notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.reservations r
            WHERE r.id = notifications.reservation_id
              AND private.is_staff_of(auth.uid(), r.restaurant_id))
    OR EXISTS (SELECT 1 FROM public.waitlist w
               WHERE w.id = notifications.waitlist_id
                 AND private.is_staff_of(auth.uid(), w.restaurant_id))
  );

DROP POLICY IF EXISTS "managers read own restaurant audit" ON public.audit_logs;
CREATE POLICY "managers read own restaurant audit" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (restaurant_id IS NOT NULL AND private.can_manage_restaurant(auth.uid(), restaurant_id));

DROP POLICY IF EXISTS "owners manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "read own roles" ON public.user_roles;
CREATE POLICY "owners manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'owner'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'owner'::public.app_role));
CREATE POLICY "read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Remove the publicly exposed SECURITY DEFINER helpers
DROP FUNCTION IF EXISTS public.my_restaurant_ids(uuid);
DROP FUNCTION IF EXISTS public.can_manage_restaurant(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_staff_of(uuid, uuid);
DROP FUNCTION IF EXISTS public.can_manage(uuid);
DROP FUNCTION IF EXISTS public.is_staff(uuid);
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);