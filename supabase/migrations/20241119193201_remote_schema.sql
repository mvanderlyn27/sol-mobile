drop policy "admin, can adjust members" on "public"."group_members";

drop policy "members can see other members in their groups" on "public"."group_members";

drop policy "Auth'd users can insert into the groups table" on "public"."groups";

drop policy "admin can do anything" on "public"."groups";

drop policy "members can view groups" on "public"."groups";

drop policy "members can view pages" on "public"."pages";

alter table "public"."group_members" drop constraint "group_members_pkey";

drop index if exists "public"."group_members_pkey";

alter table "public"."group_members" add column "id" uuid not null default gen_random_uuid();

alter table "public"."group_members" alter column "status" set default 'pending'::text;

alter table "public"."group_members" alter column "status" set not null;

alter table "public"."group_members" disable row level security;

alter table "public"."groups" add column "created_by" uuid default auth.uid();

alter table "public"."groups" disable row level security;

alter table "public"."pages" disable row level security;

alter table "public"."profiles" disable row level security;

alter table "public"."reactions" disable row level security;

CREATE UNIQUE INDEX unique_group_members ON public.group_members USING btree (group_id, user_id);

CREATE UNIQUE INDEX group_members_pkey ON public.group_members USING btree (id);

alter table "public"."group_members" add constraint "group_members_pkey" PRIMARY KEY using index "group_members_pkey";

alter table "public"."group_members" add constraint "group_members_group_id_fkey" FOREIGN KEY (group_id) REFERENCES groups(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."group_members" validate constraint "group_members_group_id_fkey";

alter table "public"."group_members" add constraint "group_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."group_members" validate constraint "group_members_user_id_fkey";

alter table "public"."group_members" add constraint "unique_group_members" UNIQUE using index "unique_group_members";

alter table "public"."groups" add constraint "groups_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) not valid;

alter table "public"."groups" validate constraint "groups_created_by_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_group_admin(p_user_id uuid, p_group_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    member_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.group_members
        WHERE user_id = p_user_id AND group_id = p_group_id AND role='admin'
    ) INTO member_exists;

    RETURN member_exists;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_group_member(p_user_id uuid, p_group_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    member_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.group_members
        WHERE user_id = p_user_id AND group_id = p_group_id AND role='member'
    ) INTO member_exists;

    RETURN member_exists;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.protect_group_members()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
-- Check if the user has the role 'member'
IF NEW.deleted = TRUE THEN RETURN NEW;

ELSIF NEW.role = 'member' THEN
-- Allow update only if the user_id matches auth.uid()
IF NEW.user_id <> auth.uid ()::UUID THEN RAISE EXCEPTION 'You can only update your own group membership.';

END IF;

-- Prevent updating the role field
IF NEW.role <> OLD.role THEN RAISE EXCEPTION 'You cannot change the role field.';

END IF;

END IF;

RETURN NEW;

END;$function$
;

create policy "admin/ creator can insert"
on "public"."group_members"
as permissive
for insert
to public
with check (((EXISTS ( SELECT 1
   FROM groups g
  WHERE ((g.id = group_members.group_id) AND (g.created_by = auth.uid())))) OR is_group_admin(auth.uid(), group_id)));


create policy "anyone can view group members"
on "public"."group_members"
as permissive
for select
to authenticated
using (true);


create policy "delete"
on "public"."group_members"
as permissive
for delete
to public
using (((EXISTS ( SELECT 1
   FROM groups g
  WHERE ((g.id = group_members.group_id) AND (g.created_by = auth.uid())))) OR is_group_admin(auth.uid(), group_id) OR (user_id = auth.uid())));


create policy "update"
on "public"."group_members"
as permissive
for update
to public
using (((EXISTS ( SELECT 1
   FROM groups g
  WHERE ((g.id = group_members.group_id) AND (g.created_by = auth.uid())))) OR is_group_admin(auth.uid(), group_id) OR (user_id = auth.uid())))
with check (((EXISTS ( SELECT 1
   FROM groups g
  WHERE ((g.id = group_members.group_id) AND (g.created_by = auth.uid())))) OR is_group_admin(auth.uid(), group_id) OR (user_id = auth.uid())));


create policy "admin/owner can do all"
on "public"."groups"
as permissive
for all
to public
using (((auth.uid() = created_by) OR (EXISTS ( SELECT 1
   FROM group_members
  WHERE ((group_members.group_id = groups.id) AND (group_members.user_id = auth.uid()) AND (group_members.role = 'admin'::text))))))
with check (((auth.uid() = created_by) OR (EXISTS ( SELECT 1
   FROM group_members
  WHERE ((group_members.group_id = groups.id) AND (group_members.user_id = auth.uid()) AND (group_members.role = 'admin'::text))))));


create policy "user and members can view group"
on "public"."groups"
as permissive
for select
to public
using (((auth.uid() = created_by) OR (EXISTS ( SELECT 1
   FROM group_members
  WHERE ((group_members.group_id = groups.id) AND (group_members.user_id = auth.uid()))))));


create policy "members can view pages"
on "public"."pages"
as permissive
for select
to public
using (((EXISTS ( SELECT 1
   FROM group_members
  WHERE ((group_members.group_id = pages.group_id) AND (group_members.user_id = auth.uid())))) OR (created_by = auth.uid())));


CREATE TRIGGER protect_group_members_trigger BEFORE UPDATE ON public.group_members FOR EACH ROW EXECUTE FUNCTION protect_group_members();


