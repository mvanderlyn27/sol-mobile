CREATE TRIGGER after_user_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION create_profile_on_signup();


create policy "Give users access to their own folder 1oj01fe_0"
on "storage"."objects"
as permissive
for insert
to public
with check (((bucket_id = 'avatars'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));


create policy "Give users access to their own folder 1oj01fe_1"
on "storage"."objects"
as permissive
for delete
to public
using (((bucket_id = 'avatars'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));


create policy "Give users access to their own folder 1oj01fe_2"
on "storage"."objects"
as permissive
for update
to public
using (((bucket_id = 'avatars'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));


create policy "Give users access to their own folder 1oj01fe_3"
on "storage"."objects"
as permissive
for select
to public
using (((bucket_id = 'avatars'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));


create policy "Give users access to their own folders 1ulllj_0"
on "storage"."objects"
as permissive
for select
to public
using (((bucket_id = 'book_photos'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));


create policy "Give users access to their own folders 1ulllj_1"
on "storage"."objects"
as permissive
for insert
to public
with check (((bucket_id = 'book_photos'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));


create policy "Give users access to their own folders 1ulllj_2"
on "storage"."objects"
as permissive
for update
to public
using (((bucket_id = 'book_photos'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));


create policy "Give users access to their own folders 1ulllj_3"
on "storage"."objects"
as permissive
for delete
to public
using (((bucket_id = 'book_photos'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));


create policy "Temp Blanket Role 1gna2wh_0"
on "storage"."objects"
as permissive
for insert
to public
with check (((bucket_id = 'page_photos'::text) AND (auth.role() = 'authenticated'::text)));


create policy "Temp Blanket Role 1gna2wh_1"
on "storage"."objects"
as permissive
for select
to public
using (((bucket_id = 'page_photos'::text) AND (auth.role() = 'authenticated'::text)));


create policy "Temp Blanket Role 1gna2wh_2"
on "storage"."objects"
as permissive
for update
to public
using (((bucket_id = 'page_photos'::text) AND (auth.role() = 'authenticated'::text)));


create policy "admin perms 1o42f6k_1"
on "storage"."objects"
as permissive
for update
to public
using (((bucket_id = 'group_covers'::text) AND (EXISTS ( SELECT 1
   FROM group_members
  WHERE ((group_members.user_id = auth.uid()) AND ((group_members.group_id)::text = (storage.foldername(objects.name))[1]) AND (group_members.role = 'admin'::text))))));


create policy "admin perms 1o42f6k_2"
on "storage"."objects"
as permissive
for delete
to public
using (((bucket_id = 'group_covers'::text) AND (EXISTS ( SELECT 1
   FROM group_members
  WHERE ((group_members.user_id = auth.uid()) AND ((group_members.group_id)::text = (storage.foldername(objects.name))[1]) AND (group_members.role = 'admin'::text))))));


create policy "admin perms and creator 1o42f6k_0"
on "storage"."objects"
as permissive
for insert
to public
with check (((bucket_id = 'group_covers'::text) AND ((EXISTS ( SELECT 1
   FROM group_members
  WHERE ((group_members.user_id = auth.uid()) AND ((group_members.group_id)::text = (storage.foldername(objects.name))[1]) AND (group_members.role = 'admin'::text)))) OR (EXISTS ( SELECT 1
   FROM groups g
  WHERE ((g.created_by = auth.uid()) AND ((g.id)::text = (storage.foldername(objects.name))[1])))))));


create policy "anyone can load group cover 1o42f6k_0"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'group_covers'::text));


create policy "give users access to all profile pics 1oj01fe_0"
on "storage"."objects"
as permissive
for insert
to public
with check ((bucket_id = 'avatars'::text));



