create table if not exists public.downloads (
  id bigint primary key,
  name text not null,
  description text not null default '',
  type text not null default 'pdf',
  size text not null default 'Varia',
  url text not null,
  downloads integer not null default 0,
  date date not null default current_date,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_requests (
  id bigint primary key,
  name text not null,
  phone text not null,
  email text not null,
  service text not null,
  message text not null,
  status text not null default 'new',
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
