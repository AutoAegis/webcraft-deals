-- Image on announcements
alter table public.announcements add column image_url text;

-- Storage bucket for uploads
insert into storage.buckets (id, name, public) values ('uploads', 'uploads', true)
on conflict (id) do nothing;

create policy "Public can view uploads"
  on storage.objects for select
  using (bucket_id = 'uploads');

create policy "Admins can upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'uploads' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can update uploads"
  on storage.objects for update to authenticated
  using (bucket_id = 'uploads' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete uploads"
  on storage.objects for delete to authenticated
  using (bucket_id = 'uploads' and public.has_role(auth.uid(), 'admin'));

-- Promo codes
create table public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_percent integer not null check (discount_percent between 1 and 90),
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.promo_codes enable row level security;
create policy "Promo codes public read" on public.promo_codes for select using (true);
create policy "Admins manage promo codes" on public.promo_codes for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
