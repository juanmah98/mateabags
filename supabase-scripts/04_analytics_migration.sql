-- TABLA PARA ANALYTICAS DE USUARIO
create table if not exists user_analytics (
  id uuid default uuid_generate_v4() primary key,
  session_id text, -- ID de sesión del usuario (cookie/localstorage)
  user_email text, -- Email del usuario (si está logueado o lo ingresó)
  event_type text not null, -- 'view_page', 'click_cta', 'start_checkout', 'payment_success', 'payment_cancel'
  page text not null, -- '/home/product-sale', '/checkout', '/checkout/success'
  metadata jsonb default '{}'::jsonb, -- Datos extra: { product_id: '...', error: '...' }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Políticas RLS (Row Level Security)
alter table user_analytics enable row level security;

-- Permitir insertar a cualquier usuario (anon)
create policy "Cualquiera puede insertar analytics"
  on user_analytics for insert
  with check (true);

-- Permitir leer solo a admins (authenticated) - Ajustar según política de roles real
create policy "Solo admins pueden ver analytics"
  on user_analytics for select
  using (auth.role() = 'authenticated'); -- O filtrar por email de admin si hay lógica específica

-- FUNCIÓN RPC PARA OBTENER ESTADÍSTICAS DEL DASHBOARD
-- Devuelve conteo de eventos agrupados por tipo para un rango de fechas
create or replace function get_analytics_stats(days int)
returns table (
  event_type text,
  count bigint
)
language plpgsql
as $$
declare
  start_date timestamp;
begin
  start_date := current_date - (days || ' days')::interval;

  return query
  select 
    ua.event_type,
    count(*) as count
  from user_analytics ua
  where ua.created_at >= start_date
  group by ua.event_type;
end;
$$;
