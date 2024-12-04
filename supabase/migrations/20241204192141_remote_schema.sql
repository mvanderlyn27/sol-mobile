

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."book_type" AS ENUM (
    'journal',
    'defaultJournal'
);


ALTER TYPE "public"."book_type" OWNER TO "postgres";


COMMENT ON TYPE "public"."book_type" IS 'type of book';



CREATE OR REPLACE FUNCTION "public"."create_profile_on_signup"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
    INSERT INTO public.profiles (id, created_at, name, new)
    VALUES (NEW.id, NEW.created_at, COALESCE(NEW.raw_user_meta_data->>'name', ''), TRUE);
    RETURN NEW;
END;$$;


ALTER FUNCTION "public"."create_profile_on_signup"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_times"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
    BEGIN
    IF (TG_OP = 'INSERT') THEN
        NEW.created_at := now();
        NEW.updated_at := now();
    ELSEIF (TG_OP = 'UPDATE') THEN
        NEW.created_at = OLD.created_at;
        NEW.updated_at = now();
    END IF;
    RETURN NEW;
    END;
    $$;


ALTER FUNCTION "public"."handle_times"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_group_admin"("p_user_id" "uuid", "p_group_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."is_group_admin"("p_user_id" "uuid", "p_group_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_group_member"("p_user_id" "uuid", "p_group_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."is_group_member"("p_user_id" "uuid", "p_group_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_user_group_invite"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    user_name text;
    group_name text;
BEGIN
    -- Check if the status of the new row is 'pending'
    IF NEW.status = 'pending' THEN
        -- Retrieve the user's name
        SELECT username INTO user_name FROM public.profiles WHERE id = NEW.user_id;

        -- Retrieve the group name (assuming you have a group_id in the new row)
        SELECT name INTO group_name FROM public.groups WHERE id = NEW.group_id;

        -- Insert notification for the user about the new group invite
        INSERT INTO public.notifications (recipient_id, sender_id, notification_data)
        VALUES (
            NEW.user_id,  -- The user who is invited
            NULL,  -- The user who created the entry as the sender
            jsonb_build_object(
                'body', user_name || ', you have a new group invite to ' || group_name || '.',
                'title', 'New Group Invite',
                'data', jsonb_build_object(
                    'url', 'home'
                )
            )
        );
    END IF;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error in notify_user_group_invite: %', SQLERRM;
END; $$;


ALTER FUNCTION "public"."notify_user_group_invite"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_user_pages"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Check if the draft status is false on creation
    IF NEW.draft = false THEN
        -- Insert notification for all users in the group except the user who created the page
        INSERT INTO public.notifications (recipient_id, sender_id, notification_data)
        SELECT 
            gm.user_id, 
            NEW.created_by, 
            jsonb_build_object(
                'body', p.username || ' sent you an update.',
                'page_id', NEW.id,
                'title', g.name || ' Updated!',
                'data', jsonb_build_object('url', 'journal/' || NEW.group_id || '?user=' || NEW.created_by || '&date=' || NEW.date)
            )
        FROM 
            public.group_members gm
        JOIN 
            public.profiles p ON NEW.created_by = p.id
        JOIN 
            public.groups g ON gm.group_id = g.id
        WHERE 
            gm.group_id = NEW.group_id
            AND gm.user_id <> NEW.created_by 
            AND gm.status = 'completed';
    END IF;
    RETURN NEW;
END; $$;


ALTER FUNCTION "public"."notify_user_pages"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_user_reactions"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    page_date date; -- Changed to timestamp with time zone for better accuracy
    page_user uuid;
BEGIN
    IF NEW.draft = false AND OLD.draft != true THEN
    -- Retrieve the date from the pages table using the NEW.page_id
        SELECT date, created_by INTO page_date, page_user FROM public.pages WHERE id = NEW.page_id;
        IF FOUND THEN
            -- Insert notification for all users in the group except the user who created the reaction
            INSERT INTO public.notifications (recipient_id, sender_id, notification_data)
            SELECT 
                gm.user_id, 
                NEW.created_by, 
                jsonb_build_object(
                    'body', p.username || ' reacted to your journal entry.',
                    'page_id', NEW.page_id,
                    'title', 'New Reaction in ' || g.name || '!',
                    'data', jsonb_build_object('url', 'journal/' || (SELECT group_id FROM public.pages WHERE id = NEW.page_id)::text || '?user=' || page_user::text || '&date=' || page_date::text)
                )
            FROM 
                public.group_members gm
            JOIN 
                public.profiles p ON NEW.created_by = p.id
            JOIN 
                public.groups g ON gm.group_id = g.id
            WHERE 
                gm.group_id = (SELECT group_id FROM public.pages WHERE id = NEW.page_id)
                AND gm.user_id <> NEW.created_by AND gm.status = 'completed';
        END IF;
    END IF;
    RETURN NEW;
END; $$;


ALTER FUNCTION "public"."notify_user_reactions"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_notifications"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    notification_record RECORD;
BEGIN
    FOR notification_record IN
        SELECT id, recipient_id, sender_id, notification_data
        FROM public.notifications
        WHERE processed = false
        LIMIT 100
    LOOP
        -- Call the send_push_notification function
        PERFORM send_push_notification(
            (SELECT push_token FROM public.profiles WHERE id = notification_record.recipient_id),
                notification_record.notification_data
        );

        -- Update the processed field to true
        UPDATE public.notifications
        SET processed = true
        WHERE id = notification_record.id;
    END LOOP;
END; $$;


ALTER FUNCTION "public"."process_notifications"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."protect_group_members"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
IF NEW.deleted = TRUE THEN RETURN NEW;

ELSIF NEW.role = 'member' THEN
IF NEW.user_id <> auth.uid ()::UUID THEN RAISE EXCEPTION 'You can only update your own group membership.';

END IF;

IF NEW.role <> OLD.role THEN RAISE EXCEPTION 'You cannot change the role field.';

END IF;

END IF;

RETURN NEW;

END;$$;


ALTER FUNCTION "public"."protect_group_members"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."send_push_notification"("push_token" "text", "notification_data" "jsonb") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    response TEXT;
    title TEXT;
    body TEXT;
    data jsonb;
BEGIN
    -- Construct the push notification payload as JSON
    title := notification_data->>'title';
    body := notification_data->>'body';
    data := notification_data->>'data';
    response := (
        SELECT content
        FROM http_post(
            'https://exp.host/--/api/v2/push/send',
            json_build_object(
                'to', push_token,
                'title', title,
                'body', body,
                'data', data -- You can add more data here if needed
            )::text,
            'application/json'
        )
    );

    -- Return the response from the push notification request
    RETURN response;
EXCEPTION
    WHEN OTHERS THEN
        -- Handle any errors gracefully
        RETURN 'Error sending push notification: ' || SQLERRM;
END;
$$;


ALTER FUNCTION "public"."send_push_notification"("push_token" "text", "notification_data" "jsonb") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."fonts" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "type" "text" NOT NULL,
    "fontImage" "text",
    "name" "text" NOT NULL
);


ALTER TABLE "public"."fonts" OWNER TO "postgres";


ALTER TABLE "public"."fonts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."fonts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."frames" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "path" "text" NOT NULL,
    "name" "text" NOT NULL,
    "width" double precision NOT NULL,
    "height" double precision NOT NULL,
    "maskPath" "text" NOT NULL
);


ALTER TABLE "public"."frames" OWNER TO "postgres";


COMMENT ON COLUMN "public"."frames"."width" IS 'original pixel width';



COMMENT ON COLUMN "public"."frames"."height" IS 'original height pixels';



ALTER TABLE "public"."frames" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."frames_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."group_members" (
    "group_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone,
    "user_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'member'::"text" NOT NULL,
    "updated_at" timestamp with time zone,
    "deleted" boolean DEFAULT false,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."group_members" OWNER TO "postgres";


COMMENT ON COLUMN "public"."group_members"."status" IS 'field to determine if user joined or not, set to pending on invite';



COMMENT ON COLUMN "public"."group_members"."id" IS 'used to help with legend state for selecting users';



CREATE TABLE IF NOT EXISTS "public"."groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted" boolean DEFAULT false NOT NULL,
    "cover_url" "text",
    "cover_placeholder" "text",
    "name" "text" NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"()
);


ALTER TABLE "public"."groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."image_items" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted" boolean DEFAULT false NOT NULL,
    "id" "uuid" NOT NULL,
    "image_id" "uuid" NOT NULL
);


ALTER TABLE "public"."image_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."images" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "type" "text" NOT NULL,
    "path" "text" NOT NULL,
    "placeholder" "text",
    "width" double precision NOT NULL,
    "height" double precision NOT NULL,
    "hash" "text",
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted" boolean DEFAULT false NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"(),
    "uploaded" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "recipient_id" "uuid" NOT NULL,
    "sender_id" "uuid",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted" boolean DEFAULT false NOT NULL,
    "is_read" boolean DEFAULT false NOT NULL,
    "notification_data" "jsonb" NOT NULL,
    "processed" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."page_items" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "page_id" "uuid" NOT NULL,
    "x" double precision NOT NULL,
    "y" double precision NOT NULL,
    "z" bigint NOT NULL,
    "rotation" double precision NOT NULL,
    "height" double precision NOT NULL,
    "width" double precision NOT NULL,
    "type" "text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted" boolean DEFAULT false NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."page_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."page_reactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "page_id" "uuid" NOT NULL,
    "draft" boolean DEFAULT true NOT NULL,
    "updated_at" timestamp with time zone NOT NULL,
    "deleted" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."page_reactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pages" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "date" "date" NOT NULL,
    "updated_at" timestamp with time zone NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "deleted" boolean DEFAULT false NOT NULL,
    "group_id" "uuid" NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "background_image" "text",
    "draft" boolean DEFAULT false NOT NULL,
    "screen_height" double precision NOT NULL,
    "screen_width" double precision NOT NULL
);


ALTER TABLE "public"."pages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pages_old" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "date" "date" NOT NULL,
    "canvas" "jsonb",
    "updated_at" timestamp with time zone NOT NULL,
    "id" "uuid" NOT NULL,
    "deleted" boolean DEFAULT false NOT NULL,
    "group_id" "uuid" NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL
);


ALTER TABLE "public"."pages_old" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text",
    "avatar_url" "text",
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "deleted" boolean DEFAULT false NOT NULL,
    "push_token" "text",
    "avatar_placeholder" "text",
    "username" "text",
    "new" boolean DEFAULT true NOT NULL,
    "should_reset_storage" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reaction_items" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "page_reaction_id" "uuid" NOT NULL,
    "x" double precision NOT NULL,
    "y" double precision NOT NULL,
    "z" bigint NOT NULL,
    "rotation" double precision NOT NULL,
    "height" double precision NOT NULL,
    "width" double precision NOT NULL,
    "type" "text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted" boolean DEFAULT false NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."reaction_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reaction_text_items" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted" boolean DEFAULT false NOT NULL,
    "color" "text" NOT NULL,
    "font" "text" NOT NULL,
    "font_size" double precision NOT NULL,
    "text" "text" NOT NULL
);


ALTER TABLE "public"."reaction_text_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reactions_old" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "page_id" "uuid" NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "reaction" "jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."reactions_old" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stickers" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text",
    "path" "text"
);


ALTER TABLE "public"."stickers" OWNER TO "postgres";


ALTER TABLE "public"."stickers" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."stickers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."templates" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text",
    "data" "jsonb",
    "path" "text"
);


ALTER TABLE "public"."templates" OWNER TO "postgres";


ALTER TABLE "public"."templates" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."templates_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."text_items" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted" boolean DEFAULT false NOT NULL,
    "color" "text" NOT NULL,
    "font" "text" NOT NULL,
    "font_size" double precision,
    "text" "text" NOT NULL
);


ALTER TABLE "public"."text_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."waitlist" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "email" "text" NOT NULL
);


ALTER TABLE "public"."waitlist" OWNER TO "postgres";


ALTER TABLE "public"."waitlist" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."waitlist_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."fonts"
    ADD CONSTRAINT "fonts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."frames"
    ADD CONSTRAINT "frames_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."frames"
    ADD CONSTRAINT "frames_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."image_items"
    ADD CONSTRAINT "image_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."images"
    ADD CONSTRAINT "images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."page_items"
    ADD CONSTRAINT "page_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pages_old"
    ADD CONSTRAINT "pages_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."pages_old"
    ADD CONSTRAINT "pages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pages"
    ADD CONSTRAINT "pages_test_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."pages"
    ADD CONSTRAINT "pages_test_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reaction_items"
    ADD CONSTRAINT "reaction_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reaction_text_items"
    ADD CONSTRAINT "reaction_text_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reactions_old"
    ADD CONSTRAINT "reactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."page_reactions"
    ADD CONSTRAINT "reactions_pkey1" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stickers"
    ADD CONSTRAINT "stickers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."templates"
    ADD CONSTRAINT "templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."text_items"
    ADD CONSTRAINT "text_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "unique_group_members" UNIQUE ("group_id", "user_id");



ALTER TABLE ONLY "public"."waitlist"
    ADD CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "group_member_invite_insert_trigger" AFTER INSERT ON "public"."group_members" FOR EACH ROW EXECUTE FUNCTION "public"."notify_user_group_invite"();



CREATE OR REPLACE TRIGGER "handle_times_group_members" BEFORE INSERT OR UPDATE ON "public"."group_members" FOR EACH ROW EXECUTE FUNCTION "public"."handle_times"();



CREATE OR REPLACE TRIGGER "handle_times_groups" BEFORE INSERT OR UPDATE ON "public"."groups" FOR EACH ROW EXECUTE FUNCTION "public"."handle_times"();



CREATE OR REPLACE TRIGGER "handle_times_image_items" BEFORE INSERT OR UPDATE ON "public"."image_items" FOR EACH ROW EXECUTE FUNCTION "public"."handle_times"();



CREATE OR REPLACE TRIGGER "handle_times_images" BEFORE INSERT OR UPDATE ON "public"."images" FOR EACH ROW EXECUTE FUNCTION "public"."handle_times"();



CREATE OR REPLACE TRIGGER "handle_times_page_items" BEFORE INSERT OR UPDATE ON "public"."page_items" FOR EACH ROW EXECUTE FUNCTION "public"."handle_times"();



CREATE OR REPLACE TRIGGER "handle_times_page_items" BEFORE INSERT OR UPDATE ON "public"."page_reactions" FOR EACH ROW EXECUTE FUNCTION "public"."handle_times"();



CREATE OR REPLACE TRIGGER "handle_times_page_items" BEFORE INSERT OR UPDATE ON "public"."reaction_items" FOR EACH ROW EXECUTE FUNCTION "public"."handle_times"();



CREATE OR REPLACE TRIGGER "handle_times_page_items" BEFORE INSERT OR UPDATE ON "public"."reaction_text_items" FOR EACH ROW EXECUTE FUNCTION "public"."handle_times"();



CREATE OR REPLACE TRIGGER "handle_times_page_items" BEFORE INSERT OR UPDATE ON "public"."text_items" FOR EACH ROW EXECUTE FUNCTION "public"."handle_times"();



CREATE OR REPLACE TRIGGER "handle_times_pages" BEFORE INSERT OR UPDATE ON "public"."pages_old" FOR EACH ROW EXECUTE FUNCTION "public"."handle_times"();



CREATE OR REPLACE TRIGGER "handle_times_pages_test" BEFORE INSERT OR UPDATE ON "public"."pages" FOR EACH ROW EXECUTE FUNCTION "public"."handle_times"();



CREATE OR REPLACE TRIGGER "handle_times_profiles" BEFORE INSERT OR UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_times"();



CREATE OR REPLACE TRIGGER "handle_times_reactions" BEFORE INSERT OR UPDATE ON "public"."reactions_old" FOR EACH ROW EXECUTE FUNCTION "public"."handle_times"();



CREATE OR REPLACE TRIGGER "page_update_notification_trigger" AFTER UPDATE ON "public"."pages" FOR EACH ROW EXECUTE FUNCTION "public"."notify_user_pages"();



CREATE OR REPLACE TRIGGER "protect_group_members_trigger" BEFORE UPDATE ON "public"."group_members" FOR EACH ROW EXECUTE FUNCTION "public"."protect_group_members"();



CREATE OR REPLACE TRIGGER "reaction_notification_trigger" AFTER UPDATE ON "public"."page_reactions" FOR EACH ROW EXECUTE FUNCTION "public"."notify_user_reactions"();



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."image_items"
    ADD CONSTRAINT "image_items_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."page_items"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."image_items"
    ADD CONSTRAINT "image_items_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."image_items"
    ADD CONSTRAINT "image_items_item_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."page_items"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."page_items"
    ADD CONSTRAINT "page_items_page_id_fkey1" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."page_reactions"
    ADD CONSTRAINT "page_reactions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."page_reactions"
    ADD CONSTRAINT "page_reactions_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pages_old"
    ADD CONSTRAINT "pages_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pages_old"
    ADD CONSTRAINT "pages_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pages"
    ADD CONSTRAINT "pages_test_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pages"
    ADD CONSTRAINT "pages_test_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reaction_items"
    ADD CONSTRAINT "reaction_items_page_reaction_id_fkey" FOREIGN KEY ("page_reaction_id") REFERENCES "public"."page_reactions"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reaction_text_items"
    ADD CONSTRAINT "reaction_text_items_id_fkey1" FOREIGN KEY ("id") REFERENCES "public"."reaction_items"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reactions_old"
    ADD CONSTRAINT "reactions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reactions_old"
    ADD CONSTRAINT "reactions_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "public"."pages_old"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."text_items"
    ADD CONSTRAINT "text_items_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."page_items"("id") ON UPDATE CASCADE ON DELETE CASCADE;



CREATE POLICY "All profile public" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Anyone can see stickers" ON "public"."stickers" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."fonts" FOR SELECT USING (true);



CREATE POLICY "Enable write for anyone" ON "public"."waitlist" FOR INSERT WITH CHECK (true);



CREATE POLICY "admin/ creator can insert" ON "public"."group_members" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."groups" "g"
  WHERE (("g"."id" = "group_members"."group_id") AND ("g"."created_by" = "auth"."uid"())))) OR "public"."is_group_admin"("auth"."uid"(), "group_id")));



CREATE POLICY "admin/owner can do all" ON "public"."groups" USING ((("auth"."uid"() = "created_by") OR (EXISTS ( SELECT 1
   FROM "public"."group_members"
  WHERE (("group_members"."group_id" = "groups"."id") AND ("group_members"."user_id" = "auth"."uid"()) AND ("group_members"."role" = 'admin'::"text")))))) WITH CHECK ((("auth"."uid"() = "created_by") OR (EXISTS ( SELECT 1
   FROM "public"."group_members"
  WHERE (("group_members"."group_id" = "groups"."id") AND ("group_members"."user_id" = "auth"."uid"()) AND ("group_members"."role" = 'admin'::"text"))))));



CREATE POLICY "anyone can see templates" ON "public"."templates" FOR SELECT USING (true);



CREATE POLICY "anyone can select a fraem" ON "public"."frames" FOR SELECT USING (true);



CREATE POLICY "anyone can view group members" ON "public"."group_members" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "auth can insert" ON "public"."notifications" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "creator can do all" ON "public"."pages_old" USING (("created_by" = "auth"."uid"()));



CREATE POLICY "creator can do all" ON "public"."reactions_old" USING (("created_by" = "auth"."uid"()));



CREATE POLICY "delete" ON "public"."group_members" FOR DELETE USING (((EXISTS ( SELECT 1
   FROM "public"."groups" "g"
  WHERE (("g"."id" = "group_members"."group_id") AND ("g"."created_by" = "auth"."uid"())))) OR "public"."is_group_admin"("auth"."uid"(), "group_id") OR ("user_id" = "auth"."uid"())));



ALTER TABLE "public"."fonts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."frames" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "members can view all reactions" ON "public"."reactions_old" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."pages_old" "p"
     JOIN "public"."group_members" "gm" ON (("gm"."group_id" = ( SELECT "group_members"."group_id"
           FROM "public"."group_members"
          WHERE ("group_members"."user_id" = "p"."created_by")))))
  WHERE (("p"."id" = "reactions_old"."page_id") AND ("gm"."user_id" = "auth"."uid"())))));



CREATE POLICY "members can view pages" ON "public"."pages_old" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."group_members"
  WHERE (("group_members"."group_id" = "pages_old"."group_id") AND ("group_members"."user_id" = "auth"."uid"())))) OR ("created_by" = "auth"."uid"())));



CREATE POLICY "reaction insert policy" ON "public"."reactions_old" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."pages_old" "p"
     JOIN "public"."group_members" "gm" ON (("gm"."group_id" = ( SELECT "group_members"."group_id"
           FROM "public"."group_members"
          WHERE ("group_members"."user_id" = "p"."created_by")))))
  WHERE (("p"."id" = "reactions_old"."page_id") AND ("gm"."user_id" = "auth"."uid"())))));



CREATE POLICY "reciever can mark as seen" ON "public"."notifications" FOR UPDATE USING (("recipient_id" = "auth"."uid"()));



CREATE POLICY "sender/reciever can view" ON "public"."notifications" FOR SELECT USING ((("sender_id" = "auth"."uid"()) OR ("recipient_id" = "auth"."uid"())));



ALTER TABLE "public"."stickers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."templates" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "update" ON "public"."group_members" FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM "public"."groups" "g"
  WHERE (("g"."id" = "group_members"."group_id") AND ("g"."created_by" = "auth"."uid"())))) OR "public"."is_group_admin"("auth"."uid"(), "group_id") OR ("user_id" = "auth"."uid"()))) WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."groups" "g"
  WHERE (("g"."id" = "group_members"."group_id") AND ("g"."created_by" = "auth"."uid"())))) OR "public"."is_group_admin"("auth"."uid"(), "group_id") OR ("user_id" = "auth"."uid"())));



CREATE POLICY "user and members can view group" ON "public"."groups" FOR SELECT USING ((("auth"."uid"() = "created_by") OR (EXISTS ( SELECT 1
   FROM "public"."group_members"
  WHERE (("group_members"."group_id" = "groups"."id") AND ("group_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "user owns their account" ON "public"."profiles" USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."waitlist" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."group_members";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."groups";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."pages";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."profiles";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";












































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































GRANT ALL ON FUNCTION "public"."create_profile_on_signup"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_profile_on_signup"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_profile_on_signup"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_times"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_times"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_times"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_group_admin"("p_user_id" "uuid", "p_group_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_group_admin"("p_user_id" "uuid", "p_group_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_group_admin"("p_user_id" "uuid", "p_group_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_group_member"("p_user_id" "uuid", "p_group_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_group_member"("p_user_id" "uuid", "p_group_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_group_member"("p_user_id" "uuid", "p_group_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_user_group_invite"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_user_group_invite"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_user_group_invite"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_user_pages"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_user_pages"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_user_pages"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_user_reactions"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_user_reactions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_user_reactions"() TO "service_role";



GRANT ALL ON FUNCTION "public"."process_notifications"() TO "anon";
GRANT ALL ON FUNCTION "public"."process_notifications"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_notifications"() TO "service_role";



GRANT ALL ON FUNCTION "public"."protect_group_members"() TO "anon";
GRANT ALL ON FUNCTION "public"."protect_group_members"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."protect_group_members"() TO "service_role";



GRANT ALL ON FUNCTION "public"."send_push_notification"("push_token" "text", "notification_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."send_push_notification"("push_token" "text", "notification_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."send_push_notification"("push_token" "text", "notification_data" "jsonb") TO "service_role";

















































































GRANT ALL ON TABLE "public"."fonts" TO "anon";
GRANT ALL ON TABLE "public"."fonts" TO "authenticated";
GRANT ALL ON TABLE "public"."fonts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."fonts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."fonts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."fonts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."frames" TO "anon";
GRANT ALL ON TABLE "public"."frames" TO "authenticated";
GRANT ALL ON TABLE "public"."frames" TO "service_role";



GRANT ALL ON SEQUENCE "public"."frames_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."frames_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."frames_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."group_members" TO "anon";
GRANT ALL ON TABLE "public"."group_members" TO "authenticated";
GRANT ALL ON TABLE "public"."group_members" TO "service_role";



GRANT ALL ON TABLE "public"."groups" TO "anon";
GRANT ALL ON TABLE "public"."groups" TO "authenticated";
GRANT ALL ON TABLE "public"."groups" TO "service_role";



GRANT ALL ON TABLE "public"."image_items" TO "anon";
GRANT ALL ON TABLE "public"."image_items" TO "authenticated";
GRANT ALL ON TABLE "public"."image_items" TO "service_role";



GRANT ALL ON TABLE "public"."images" TO "anon";
GRANT ALL ON TABLE "public"."images" TO "authenticated";
GRANT ALL ON TABLE "public"."images" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."page_items" TO "anon";
GRANT ALL ON TABLE "public"."page_items" TO "authenticated";
GRANT ALL ON TABLE "public"."page_items" TO "service_role";



GRANT ALL ON TABLE "public"."page_reactions" TO "anon";
GRANT ALL ON TABLE "public"."page_reactions" TO "authenticated";
GRANT ALL ON TABLE "public"."page_reactions" TO "service_role";



GRANT ALL ON TABLE "public"."pages" TO "anon";
GRANT ALL ON TABLE "public"."pages" TO "authenticated";
GRANT ALL ON TABLE "public"."pages" TO "service_role";



GRANT ALL ON TABLE "public"."pages_old" TO "anon";
GRANT ALL ON TABLE "public"."pages_old" TO "authenticated";
GRANT ALL ON TABLE "public"."pages_old" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."reaction_items" TO "anon";
GRANT ALL ON TABLE "public"."reaction_items" TO "authenticated";
GRANT ALL ON TABLE "public"."reaction_items" TO "service_role";



GRANT ALL ON TABLE "public"."reaction_text_items" TO "anon";
GRANT ALL ON TABLE "public"."reaction_text_items" TO "authenticated";
GRANT ALL ON TABLE "public"."reaction_text_items" TO "service_role";



GRANT ALL ON TABLE "public"."reactions_old" TO "anon";
GRANT ALL ON TABLE "public"."reactions_old" TO "authenticated";
GRANT ALL ON TABLE "public"."reactions_old" TO "service_role";



GRANT ALL ON TABLE "public"."stickers" TO "anon";
GRANT ALL ON TABLE "public"."stickers" TO "authenticated";
GRANT ALL ON TABLE "public"."stickers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."stickers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."stickers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."stickers_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."templates" TO "anon";
GRANT ALL ON TABLE "public"."templates" TO "authenticated";
GRANT ALL ON TABLE "public"."templates" TO "service_role";



GRANT ALL ON SEQUENCE "public"."templates_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."templates_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."templates_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."text_items" TO "anon";
GRANT ALL ON TABLE "public"."text_items" TO "authenticated";
GRANT ALL ON TABLE "public"."text_items" TO "service_role";



GRANT ALL ON TABLE "public"."waitlist" TO "anon";
GRANT ALL ON TABLE "public"."waitlist" TO "authenticated";
GRANT ALL ON TABLE "public"."waitlist" TO "service_role";



GRANT ALL ON SEQUENCE "public"."waitlist_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."waitlist_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."waitlist_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;

--
-- Dumped schema changes for auth and storage
--

CREATE OR REPLACE TRIGGER "after_user_signup" AFTER INSERT ON "auth"."users" FOR EACH ROW EXECUTE FUNCTION "public"."create_profile_on_signup"();



CREATE POLICY "Give users access to own folder 1ffg0oo_0" ON "storage"."objects" FOR INSERT WITH CHECK ((("bucket_id" = 'images'::"text") AND (( SELECT ("auth"."uid"())::"text" AS "uid") = ("storage"."foldername"("name"))[1])));



CREATE POLICY "Give users access to own folder 1ffg0oo_1" ON "storage"."objects" FOR SELECT USING ((("bucket_id" = 'images'::"text") AND (( SELECT ("auth"."uid"())::"text" AS "uid") = ("storage"."foldername"("name"))[1])));



CREATE POLICY "Give users access to own folder 1ffg0oo_2" ON "storage"."objects" FOR UPDATE USING ((("bucket_id" = 'images'::"text") AND (( SELECT ("auth"."uid"())::"text" AS "uid") = ("storage"."foldername"("name"))[1])));



CREATE POLICY "Give users access to own folder 1ffg0oo_3" ON "storage"."objects" FOR DELETE USING ((("bucket_id" = 'images'::"text") AND (( SELECT ("auth"."uid"())::"text" AS "uid") = ("storage"."foldername"("name"))[1])));



CREATE POLICY "Give users access to their own folder 1oj01fe_0" ON "storage"."objects" FOR INSERT WITH CHECK ((("bucket_id" = 'avatars'::"text") AND (( SELECT ("auth"."uid"())::"text" AS "uid") = ("storage"."foldername"("name"))[1])));



CREATE POLICY "Give users access to their own folder 1oj01fe_1" ON "storage"."objects" FOR DELETE USING ((("bucket_id" = 'avatars'::"text") AND (( SELECT ("auth"."uid"())::"text" AS "uid") = ("storage"."foldername"("name"))[1])));



CREATE POLICY "Give users access to their own folder 1oj01fe_2" ON "storage"."objects" FOR UPDATE USING ((("bucket_id" = 'avatars'::"text") AND (( SELECT ("auth"."uid"())::"text" AS "uid") = ("storage"."foldername"("name"))[1])));



CREATE POLICY "Give users access to their own folder 1oj01fe_3" ON "storage"."objects" FOR SELECT USING ((("bucket_id" = 'avatars'::"text") AND (( SELECT ("auth"."uid"())::"text" AS "uid") = ("storage"."foldername"("name"))[1])));



CREATE POLICY "Give users access to their own folders 1ulllj_0" ON "storage"."objects" FOR SELECT USING ((("bucket_id" = 'book_photos'::"text") AND (( SELECT ("auth"."uid"())::"text" AS "uid") = ("storage"."foldername"("name"))[1])));



CREATE POLICY "Give users access to their own folders 1ulllj_1" ON "storage"."objects" FOR INSERT WITH CHECK ((("bucket_id" = 'book_photos'::"text") AND (( SELECT ("auth"."uid"())::"text" AS "uid") = ("storage"."foldername"("name"))[1])));



CREATE POLICY "Give users access to their own folders 1ulllj_2" ON "storage"."objects" FOR UPDATE USING ((("bucket_id" = 'book_photos'::"text") AND (( SELECT ("auth"."uid"())::"text" AS "uid") = ("storage"."foldername"("name"))[1])));



CREATE POLICY "Give users access to their own folders 1ulllj_3" ON "storage"."objects" FOR DELETE USING ((("bucket_id" = 'book_photos'::"text") AND (( SELECT ("auth"."uid"())::"text" AS "uid") = ("storage"."foldername"("name"))[1])));



CREATE POLICY "Temp Blanket Role 1gna2wh_0" ON "storage"."objects" FOR INSERT WITH CHECK ((("bucket_id" = 'page_photos'::"text") AND ("auth"."role"() = 'authenticated'::"text")));



CREATE POLICY "Temp Blanket Role 1gna2wh_1" ON "storage"."objects" FOR SELECT USING ((("bucket_id" = 'page_photos'::"text") AND ("auth"."role"() = 'authenticated'::"text")));



CREATE POLICY "Temp Blanket Role 1gna2wh_2" ON "storage"."objects" FOR UPDATE USING ((("bucket_id" = 'page_photos'::"text") AND ("auth"."role"() = 'authenticated'::"text")));



CREATE POLICY "admin perms 1o42f6k_1" ON "storage"."objects" FOR UPDATE USING ((("bucket_id" = 'group_covers'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."group_members"
  WHERE (("group_members"."user_id" = "auth"."uid"()) AND (("group_members"."group_id")::"text" = ("storage"."foldername"("objects"."name"))[1]) AND ("group_members"."role" = 'admin'::"text"))))));



CREATE POLICY "admin perms 1o42f6k_2" ON "storage"."objects" FOR DELETE USING ((("bucket_id" = 'group_covers'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."group_members"
  WHERE (("group_members"."user_id" = "auth"."uid"()) AND (("group_members"."group_id")::"text" = ("storage"."foldername"("objects"."name"))[1]) AND ("group_members"."role" = 'admin'::"text"))))));



CREATE POLICY "admin perms and creator 1o42f6k_0" ON "storage"."objects" FOR INSERT WITH CHECK ((("bucket_id" = 'group_covers'::"text") AND ((EXISTS ( SELECT 1
   FROM "public"."group_members"
  WHERE (("group_members"."user_id" = "auth"."uid"()) AND (("group_members"."group_id")::"text" = ("storage"."foldername"("objects"."name"))[1]) AND ("group_members"."role" = 'admin'::"text")))) OR (EXISTS ( SELECT 1
   FROM "public"."groups" "g"
  WHERE (("g"."created_by" = "auth"."uid"()) AND (("g"."id")::"text" = ("storage"."foldername"("objects"."name"))[1])))))));



CREATE POLICY "anyone can load group cover 1o42f6k_0" ON "storage"."objects" FOR SELECT USING (("bucket_id" = 'group_covers'::"text"));



CREATE POLICY "give users access to all profile pics 1oj01fe_0" ON "storage"."objects" FOR INSERT WITH CHECK (("bucket_id" = 'avatars'::"text"));



