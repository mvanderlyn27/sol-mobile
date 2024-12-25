drop trigger if exists "handle_times_pages" on "public"."pages";

drop trigger if exists "page_update_notification_trigger" on "public"."pages";

drop trigger if exists "handle_times_page_items" on "public"."reaction_items";

drop trigger if exists "handle_times_page_items" on "public"."reaction_text_items";

drop trigger if exists "handle_times_page_items" on "public"."text_items";

revoke delete on table "public"."reaction_items"
from
    "anon";

revoke insert on table "public"."reaction_items"
from
    "anon";

revoke references on table "public"."reaction_items"
from
    "anon";

revoke
select
    on table "public"."reaction_items"
from
    "anon";

revoke trigger on table "public"."reaction_items"
from
    "anon";

revoke truncate on table "public"."reaction_items"
from
    "anon";

revoke
update on table "public"."reaction_items"
from
    "anon";

revoke delete on table "public"."reaction_items"
from
    "authenticated";

revoke insert on table "public"."reaction_items"
from
    "authenticated";

revoke references on table "public"."reaction_items"
from
    "authenticated";

revoke
select
    on table "public"."reaction_items"
from
    "authenticated";

revoke trigger on table "public"."reaction_items"
from
    "authenticated";

revoke truncate on table "public"."reaction_items"
from
    "authenticated";

revoke
update on table "public"."reaction_items"
from
    "authenticated";

revoke delete on table "public"."reaction_items"
from
    "service_role";

revoke insert on table "public"."reaction_items"
from
    "service_role";

revoke references on table "public"."reaction_items"
from
    "service_role";

revoke
select
    on table "public"."reaction_items"
from
    "service_role";

revoke trigger on table "public"."reaction_items"
from
    "service_role";

revoke truncate on table "public"."reaction_items"
from
    "service_role";

revoke
update on table "public"."reaction_items"
from
    "service_role";

revoke delete on table "public"."reaction_text_items"
from
    "anon";

revoke insert on table "public"."reaction_text_items"
from
    "anon";

revoke references on table "public"."reaction_text_items"
from
    "anon";

revoke
select
    on table "public"."reaction_text_items"
from
    "anon";

revoke trigger on table "public"."reaction_text_items"
from
    "anon";

revoke truncate on table "public"."reaction_text_items"
from
    "anon";

revoke
update on table "public"."reaction_text_items"
from
    "anon";

revoke delete on table "public"."reaction_text_items"
from
    "authenticated";

revoke insert on table "public"."reaction_text_items"
from
    "authenticated";

revoke references on table "public"."reaction_text_items"
from
    "authenticated";

revoke
select
    on table "public"."reaction_text_items"
from
    "authenticated";

revoke trigger on table "public"."reaction_text_items"
from
    "authenticated";

revoke truncate on table "public"."reaction_text_items"
from
    "authenticated";

revoke
update on table "public"."reaction_text_items"
from
    "authenticated";

revoke delete on table "public"."reaction_text_items"
from
    "service_role";

revoke insert on table "public"."reaction_text_items"
from
    "service_role";

revoke references on table "public"."reaction_text_items"
from
    "service_role";

revoke
select
    on table "public"."reaction_text_items"
from
    "service_role";

revoke trigger on table "public"."reaction_text_items"
from
    "service_role";

revoke truncate on table "public"."reaction_text_items"
from
    "service_role";

revoke
update on table "public"."reaction_text_items"
from
    "service_role";

revoke delete on table "public"."text_items"
from
    "anon";

revoke insert on table "public"."text_items"
from
    "anon";

revoke references on table "public"."text_items"
from
    "anon";

revoke
select
    on table "public"."text_items"
from
    "anon";

revoke trigger on table "public"."text_items"
from
    "anon";

revoke truncate on table "public"."text_items"
from
    "anon";

revoke
update on table "public"."text_items"
from
    "anon";

revoke delete on table "public"."text_items"
from
    "authenticated";

revoke insert on table "public"."text_items"
from
    "authenticated";

revoke references on table "public"."text_items"
from
    "authenticated";

revoke
select
    on table "public"."text_items"
from
    "authenticated";

revoke trigger on table "public"."text_items"
from
    "authenticated";

revoke truncate on table "public"."text_items"
from
    "authenticated";

revoke
update on table "public"."text_items"
from
    "authenticated";

revoke delete on table "public"."text_items"
from
    "service_role";

revoke insert on table "public"."text_items"
from
    "service_role";

revoke references on table "public"."text_items"
from
    "service_role";

revoke
select
    on table "public"."text_items"
from
    "service_role";

revoke trigger on table "public"."text_items"
from
    "service_role";

revoke truncate on table "public"."text_items"
from
    "service_role";

revoke
update on table "public"."text_items"
from
    "service_role";

alter table "public"."pages"
drop constraint "pages_created_by_fkey";

alter table "public"."pages"
drop constraint "pages_group_id_fkey";

alter table "public"."reaction_items"
drop constraint "reaction_items_page_reaction_id_fkey";

alter table "public"."reaction_text_items"
drop constraint "reaction_text_items_id_fkey1";

alter table "public"."text_items"
drop constraint "text_items_id_fkey";

alter table "public"."page_items"
drop constraint "page_items_page_id_fkey";

alter table "public"."page_reactions"
drop constraint "page_reactions_page_id_fkey";

alter table "public"."pages"
drop constraint "pages_pkey";

alter table "public"."reaction_items"
drop constraint "reaction_items_pkey";

alter table "public"."reaction_text_items"
drop constraint "reaction_text_items_pkey";

alter table "public"."text_items"
drop constraint "text_items_pkey";

drop index if exists "public"."reaction_items_pkey";

drop index if exists "public"."reaction_text_items_pkey";

drop index if exists "public"."text_items_pkey";

drop index if exists "public"."pages_pkey";

drop table "public"."reaction_items";

drop table "public"."reaction_text_items";

drop table "public"."text_items";

create table
    "public"."reactions" (
        "id" uuid not null default gen_random_uuid (),
        "created_at" timestamp
        with
            time zone not null,
            "updated_at" timestamp
        with
            time zone not null,
            "deleted" boolean not null default false,
            "page_id" uuid not null,
            "reaction" jsonb not null,
            "created_by" uuid not null
    );

alter table "public"."notifications"
alter column "sender_id"
drop not null;

alter table "public"."pages"
drop column "background_image";

alter table "public"."pages"
drop column "draft";

alter table "public"."pages"
drop column "screen_height";

alter table "public"."pages"
drop column "screen_width";

alter table "public"."pages"
add column "canvas" jsonb;

alter table "public"."pages"
alter column "created_at"
set default now ();

alter table "public"."pages"
alter column "created_by"
set default auth.uid ();

alter table "public"."pages"
alter column "id"
drop default;

alter table "public"."pages_old"
drop column "canvas";

alter table "public"."pages_old"
add column "background_image" text;

alter table "public"."pages_old"
add column "draft" boolean not null default false;

alter table "public"."pages_old"
add column "screen_height" double precision;

alter table "public"."pages_old"
add column "screen_width" double precision;

alter table "public"."pages_old"
alter column "created_at"
drop default;

alter table "public"."pages_old"
alter column "created_by"
drop default;

alter table "public"."pages_old"
alter column "id"
set default gen_random_uuid ();

CREATE UNIQUE INDEX pages_old2_pkey ON public.pages USING btree (id);

CREATE UNIQUE INDEX reactions_pkey ON public.reactions USING btree (id);

CREATE UNIQUE INDEX pages_pkey ON public.pages_old USING btree (id);

alter table "public"."pages" add constraint "pages_old2_pkey" PRIMARY KEY using index "pages_old2_pkey";

alter table "public"."pages_old" add constraint "pages_pkey" PRIMARY KEY using index "pages_pkey";

alter table "public"."reactions" add constraint "reactions_pkey" PRIMARY KEY using index "reactions_pkey";

alter table "public"."pages" add constraint "pages_created_by_fkey1" FOREIGN KEY (created_by) REFERENCES profiles (id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."pages" validate constraint "pages_created_by_fkey1";

alter table "public"."pages_old" add constraint "pages_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles (id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."pages_old" validate constraint "pages_created_by_fkey";

alter table "public"."pages_old" add constraint "pages_group_id_fkey" FOREIGN KEY (group_id) REFERENCES groups (id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."pages_old" validate constraint "pages_group_id_fkey";

alter table "public"."reactions" add constraint "reactions_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles (id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."reactions" validate constraint "reactions_created_by_fkey";

alter table "public"."reactions" add constraint "reactions_page_id_fkey" FOREIGN KEY (page_id) REFERENCES pages (id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."reactions" validate constraint "reactions_page_id_fkey";

-- alter table "public"."page_items" add constraint "page_items_page_id_fkey" FOREIGN KEY (page_id) REFERENCES pages_old (id) ON UPDATE CASCADE ON DELETE CASCADE not valid;
-- alter table "public"."page_items" validate constraint "page_items_page_id_fkey";
-- alter table "public"."page_reactions" add constraint "page_reactions_page_id_fkey" FOREIGN KEY (page_id) REFERENCES pages_old (id) ON UPDATE CASCADE ON DELETE CASCADE not valid;
-- alter table "public"."page_reactions" validate constraint "page_reactions_page_id_fkey";
grant delete on table "public"."reactions" to "anon";

grant insert on table "public"."reactions" to "anon";

grant references on table "public"."reactions" to "anon";

grant
select
    on table "public"."reactions" to "anon";

grant trigger on table "public"."reactions" to "anon";

grant truncate on table "public"."reactions" to "anon";

grant
update on table "public"."reactions" to "anon";

grant delete on table "public"."reactions" to "authenticated";

grant insert on table "public"."reactions" to "authenticated";

grant references on table "public"."reactions" to "authenticated";

grant
select
    on table "public"."reactions" to "authenticated";

grant trigger on table "public"."reactions" to "authenticated";

grant truncate on table "public"."reactions" to "authenticated";

grant
update on table "public"."reactions" to "authenticated";

grant delete on table "public"."reactions" to "service_role";

grant insert on table "public"."reactions" to "service_role";

grant references on table "public"."reactions" to "service_role";

grant
select
    on table "public"."reactions" to "service_role";

grant trigger on table "public"."reactions" to "service_role";

grant truncate on table "public"."reactions" to "service_role";

grant
update on table "public"."reactions" to "service_role";

CREATE TRIGGER handle_times_pages_invites BEFORE INSERT
OR
UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION handle_times ();

CREATE TRIGGER handle_times_pages BEFORE INSERT
OR
UPDATE ON public.pages_old FOR EACH ROW EXECUTE FUNCTION handle_times ();

CREATE TRIGGER page_update_notification_trigger AFTER
UPDATE ON public.pages_old FOR EACH ROW EXECUTE FUNCTION notify_user_pages ();

CREATE TRIGGER handle_times_reactions BEFORE INSERT
OR
UPDATE ON public.reactions FOR EACH ROW EXECUTE FUNCTION handle_times ();