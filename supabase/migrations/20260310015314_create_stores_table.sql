create table if not exists public.stores (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text,
    relevant_data text,
    main_image_url text,
    images text[] default '{}',
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS
alter table public.stores enable row level security;

create policy "Stores are viewable by everyone."
on public.stores for select
using ( true );

create policy "Users can insert stores."
on public.stores for insert
with check ( auth.role() = 'authenticated' );

create policy "Users can update stores."
on public.stores for update
using ( auth.role() = 'authenticated' );

create policy "Users can delete stores."
on public.stores for delete
using ( auth.role() = 'authenticated' );

-- Create trigger for updated_at
create trigger handle_updated_at_stores
    before update on public.stores
    for each row
    execute function extensions.moddatetime('updated_at');

-- Set up Storage bucket for stores
insert into storage.buckets (id, name, public)
values ('stores', 'stores', true)
on conflict (id) do nothing;

create policy "Stores images are publicly accessible."
on storage.objects for select
using ( bucket_id = 'stores' );

create policy "Users can upload stores images."
on storage.objects for insert
with check ( bucket_id = 'stores' and auth.role() = 'authenticated' );

create policy "Users can update stores images."
on storage.objects for update
using ( bucket_id = 'stores' and auth.role() = 'authenticated' );

create policy "Users can delete stores images."
on storage.objects for delete
using ( bucket_id = 'stores' and auth.role() = 'authenticated' );
