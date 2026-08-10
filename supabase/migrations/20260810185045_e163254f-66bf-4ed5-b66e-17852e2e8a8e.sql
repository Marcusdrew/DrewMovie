CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;

DROP POLICY "Admin voit tout" ON public.content;
DROP POLICY "Admin modifie tout" ON public.content;
DROP POLICY "Admin supprime tout" ON public.content;
DROP POLICY "Créateur publie ses contenus" ON public.content;

CREATE POLICY "Admin voit tout" ON public.content FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin modifie tout" ON public.content FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin supprime tout" ON public.content FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Créateur publie ses contenus" ON public.content FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = uploader_id) AND (private.has_role(auth.uid(), 'creator'::public.app_role) OR private.has_role(auth.uid(), 'admin'::public.app_role)));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);