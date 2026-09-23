create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  role text not null check (role in ('student', 'teacher')),
  avatar_url text,
  selected_subjects text[] not null default '{}',
  student_level text,
  student_goal text,
  teacher_audience text,
  teacher_goal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  profile_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.learning_profiles enable row level security;

create or replace function public.current_user_is_teacher()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'teacher'
  );
$$;

create policy "users read own profile or teachers read profiles"
on public.profiles for select to authenticated
using (id = auth.uid() or public.current_user_is_teacher());

create policy "users update own profile"
on public.profiles for update to authenticated
using (id = auth.uid()) with check (id = auth.uid());

create policy "users read own learning profile or teachers read learning profiles"
on public.learning_profiles for select to authenticated
using (user_id = auth.uid() or public.current_user_is_teacher());

create policy "students insert own learning profile"
on public.learning_profiles for insert to authenticated
with check (user_id = auth.uid());

create policy "students update own learning profile"
on public.learning_profiles for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (
    id, email, name, role, avatar_url, selected_subjects,
    student_level, student_goal, teacher_audience, teacher_goal
  ) values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, 'User'), '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'student'),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    coalesce(array(select jsonb_array_elements_text(new.raw_user_meta_data -> 'selected_subjects')), '{}'),
    new.raw_user_meta_data ->> 'student_level',
    new.raw_user_meta_data ->> 'student_goal',
    new.raw_user_meta_data ->> 'teacher_audience',
    new.raw_user_meta_data ->> 'teacher_goal'
  );

  if coalesce(new.raw_user_meta_data ->> 'role', 'student') = 'student' then
    insert into public.learning_profiles (user_id, profile_data)
    values (new.id, '{}'::jsonb);
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

grant select, update on public.profiles to authenticated;
grant select, insert, update on public.learning_profiles to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "avatar images are publicly readable"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "users upload avatars to own folder"
on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users update avatars in own folder"
on storage.objects for update to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
