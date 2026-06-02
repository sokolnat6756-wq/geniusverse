
-- profiles: admin can select all
CREATE POLICY "admins select all profiles" ON public.profiles
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- subscriptions: admin full management
CREATE POLICY "admins select all subscriptions" ON public.subscriptions
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins insert subscriptions" ON public.subscriptions
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update subscriptions" ON public.subscriptions
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- user_genius_access: admin full management
CREATE POLICY "admins select all access" ON public.user_genius_access
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins insert access" ON public.user_genius_access
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update access" ON public.user_genius_access
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins delete access" ON public.user_genius_access
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
