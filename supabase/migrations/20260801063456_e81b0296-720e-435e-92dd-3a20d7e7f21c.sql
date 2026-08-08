-- Helper: is the user an active staff member of this restaurant?
CREATE OR REPLACE FUNCTION public.is_staff_of(_user_id uuid, _restaurant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_members sm
    WHERE sm.user_id = _user_id
      AND sm.is_active
      AND sm.restaurant_id = _restaurant_id
  ) AND public.is_staff(_user_id);
$$;

CREATE OR REPLACE FUNCTION public.can_manage_restaurant(_user_id uuid, _restaurant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT public.is_staff_of(_user_id, _restaurant_id) AND public.can_manage(_user_id);
$$;

-- The restaurant(s) the user belongs to
CREATE OR REPLACE FUNCTION public.my_restaurant_ids(_user_id uuid)
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT sm.restaurant_id FROM public.staff_members sm
  WHERE sm.user_id = _user_id AND sm.is_active AND sm.restaurant_id IS NOT NULL;
$$;

-- ---------------------------------------------------------------- customers
DROP POLICY IF EXISTS "staff read customers" ON public.customers;
DROP POLICY IF EXISTS "managers write customers" ON public.customers;
CREATE POLICY "staff read own restaurant customers" ON public.customers
  FOR SELECT TO authenticated USING (public.is_staff_of(auth.uid(), restaurant_id));
CREATE POLICY "managers write own restaurant customers" ON public.customers
  FOR ALL TO authenticated
  USING (public.can_manage_restaurant(auth.uid(), restaurant_id))
  WITH CHECK (public.can_manage_restaurant(auth.uid(), restaurant_id));

-- ------------------------------------------------------------- reservations
DROP POLICY IF EXISTS "staff read reservations" ON public.reservations;
DROP POLICY IF EXISTS "staff update reservations" ON public.reservations;
DROP POLICY IF EXISTS "staff write reservations" ON public.reservations;
DROP POLICY IF EXISTS "managers delete reservations" ON public.reservations;
CREATE POLICY "staff read own restaurant reservations" ON public.reservations
  FOR SELECT TO authenticated USING (public.is_staff_of(auth.uid(), restaurant_id));
CREATE POLICY "staff update own restaurant reservations" ON public.reservations
  FOR UPDATE TO authenticated
  USING (public.is_staff_of(auth.uid(), restaurant_id))
  WITH CHECK (public.is_staff_of(auth.uid(), restaurant_id));
CREATE POLICY "staff insert own restaurant reservations" ON public.reservations
  FOR INSERT TO authenticated WITH CHECK (public.is_staff_of(auth.uid(), restaurant_id));
CREATE POLICY "managers delete own restaurant reservations" ON public.reservations
  FOR DELETE TO authenticated USING (public.can_manage_restaurant(auth.uid(), restaurant_id));

-- ------------------------------------------------------------------ waitlist
DROP POLICY IF EXISTS "staff manage waitlist" ON public.waitlist;
CREATE POLICY "staff manage own restaurant waitlist" ON public.waitlist
  FOR ALL TO authenticated
  USING (public.is_staff_of(auth.uid(), restaurant_id))
  WITH CHECK (public.is_staff_of(auth.uid(), restaurant_id));

-- --------------------------------------------------------- restaurant_tables
DROP POLICY IF EXISTS "staff read tables" ON public.restaurant_tables;
DROP POLICY IF EXISTS "staff update table status" ON public.restaurant_tables;
DROP POLICY IF EXISTS "managers insert tables" ON public.restaurant_tables;
DROP POLICY IF EXISTS "managers delete tables" ON public.restaurant_tables;
CREATE POLICY "staff read own restaurant tables" ON public.restaurant_tables
  FOR SELECT TO authenticated USING (public.is_staff_of(auth.uid(), restaurant_id));
CREATE POLICY "staff update own restaurant tables" ON public.restaurant_tables
  FOR UPDATE TO authenticated
  USING (public.is_staff_of(auth.uid(), restaurant_id))
  WITH CHECK (public.is_staff_of(auth.uid(), restaurant_id));
CREATE POLICY "managers insert own restaurant tables" ON public.restaurant_tables
  FOR INSERT TO authenticated WITH CHECK (public.can_manage_restaurant(auth.uid(), restaurant_id));
CREATE POLICY "managers delete own restaurant tables" ON public.restaurant_tables
  FOR DELETE TO authenticated USING (public.can_manage_restaurant(auth.uid(), restaurant_id));

-- ------------------------------------------------------------ table_sections
DROP POLICY IF EXISTS "staff read sections" ON public.table_sections;
DROP POLICY IF EXISTS "managers write sections" ON public.table_sections;
CREATE POLICY "staff read own restaurant sections" ON public.table_sections
  FOR SELECT TO authenticated USING (public.is_staff_of(auth.uid(), restaurant_id));
CREATE POLICY "managers write own restaurant sections" ON public.table_sections
  FOR ALL TO authenticated
  USING (public.can_manage_restaurant(auth.uid(), restaurant_id))
  WITH CHECK (public.can_manage_restaurant(auth.uid(), restaurant_id));

-- ------------------------------------------------------- restaurant_settings
DROP POLICY IF EXISTS "staff read settings" ON public.restaurant_settings;
DROP POLICY IF EXISTS "managers write settings" ON public.restaurant_settings;
CREATE POLICY "staff read own restaurant settings" ON public.restaurant_settings
  FOR SELECT TO authenticated USING (public.is_staff_of(auth.uid(), restaurant_id));
CREATE POLICY "managers write own restaurant settings" ON public.restaurant_settings
  FOR ALL TO authenticated
  USING (public.can_manage_restaurant(auth.uid(), restaurant_id))
  WITH CHECK (public.can_manage_restaurant(auth.uid(), restaurant_id));

-- --------------------------------------------------------------- restaurants
DROP POLICY IF EXISTS "staff read restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "managers update restaurants" ON public.restaurants;
CREATE POLICY "staff read own restaurant" ON public.restaurants
  FOR SELECT TO authenticated USING (public.is_staff_of(auth.uid(), id));
CREATE POLICY "managers update own restaurant" ON public.restaurants
  FOR UPDATE TO authenticated
  USING (public.can_manage_restaurant(auth.uid(), id))
  WITH CHECK (public.can_manage_restaurant(auth.uid(), id));

-- ------------------------------------------------------------- staff_members
DROP POLICY IF EXISTS "staff read staff" ON public.staff_members;
CREATE POLICY "staff read own restaurant staff" ON public.staff_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff_of(auth.uid(), restaurant_id));

-- -------------------------------------------------------- reservation_tables
DROP POLICY IF EXISTS "staff manage reservation tables" ON public.reservation_tables;
CREATE POLICY "staff manage own restaurant reservation tables" ON public.reservation_tables
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reservations r
    WHERE r.id = reservation_tables.reservation_id
      AND public.is_staff_of(auth.uid(), r.restaurant_id)))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.reservations r
    WHERE r.id = reservation_tables.reservation_id
      AND public.is_staff_of(auth.uid(), r.restaurant_id)));

-- ------------------------------------------------------------- notifications
DROP POLICY IF EXISTS "staff read notifications" ON public.notifications;
CREATE POLICY "staff read own restaurant notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.reservations r
            WHERE r.id = notifications.reservation_id
              AND public.is_staff_of(auth.uid(), r.restaurant_id))
    OR EXISTS (SELECT 1 FROM public.waitlist w
               WHERE w.id = notifications.waitlist_id
                 AND public.is_staff_of(auth.uid(), w.restaurant_id))
  );

-- ---------------------------------------------------------------- audit_logs
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS restaurant_id uuid REFERENCES public.restaurants(id);
UPDATE public.audit_logs a SET restaurant_id = (SELECT id FROM public.restaurants LIMIT 1)
  WHERE a.restaurant_id IS NULL;
DROP POLICY IF EXISTS "staff read audit" ON public.audit_logs;
CREATE POLICY "managers read own restaurant audit" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (restaurant_id IS NOT NULL AND public.can_manage_restaurant(auth.uid(), restaurant_id));

-- --------------------------------------- lock down SECURITY DEFINER helpers
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.can_manage(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.is_staff_of(uuid, uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.can_manage_restaurant(uuid, uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.my_restaurant_ids(uuid) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.can_manage(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_staff_of(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.can_manage_restaurant(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.my_restaurant_ids(uuid) TO service_role;