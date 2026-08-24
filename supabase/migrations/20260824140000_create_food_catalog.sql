create table public.foods (
  id bigint primary key generated always as identity,
  source_release text not null,
  source_code text not null,
  name text not null,
  category_path text[] not null default '{}',
  descriptors text[] not null default '{}',
  unique (source_release, source_code)
);

alter table public.foods enable row level security;

create table public.food_search_terms (
  food_id bigint not null references public.foods(id) on delete cascade,
  term text not null,
  normalized_term text not null,
  kind text not null check (kind in ('canonical', 'alias')),
  primary key (food_id, normalized_term)
);

create table public.food_nutrients (
  food_id bigint not null references public.foods(id) on delete cascade,
  nutrient_code text not null,
  amount_per_100g numeric,
  unit text not null,
  source_value text not null,
  value_kind text not null check (
    value_kind in ('measured', 'estimated', 'trace', 'not_detected', 'missing')
  ),
  primary key (food_id, nutrient_code)
);

alter table public.food_search_terms enable row level security;
alter table public.food_nutrients enable row level security;

revoke all on table public.foods from anon, authenticated;
revoke all on table public.food_search_terms from anon, authenticated;
revoke all on table public.food_nutrients from anon, authenticated;

grant select on table public.foods to anon, authenticated;
grant select on table public.food_search_terms to anon, authenticated;
grant select on table public.food_nutrients to anon, authenticated;

grant select, insert, update on table public.foods to service_role;
grant select, insert, update on table public.food_search_terms to service_role;
grant select, insert, update on table public.food_nutrients to service_role;
grant usage on sequence public.foods_id_seq to service_role;

create policy "Food catalog is publicly readable"
  on public.foods
  for select
  to anon, authenticated
  using (true);

create policy "Food search terms are publicly readable"
  on public.food_search_terms
  for select
  to anon, authenticated
  using (true);

create policy "Food nutrients are publicly readable"
  on public.food_nutrients
  for select
  to anon, authenticated
  using (true);

create function public.search_foods(query_text text, result_limit integer default 20)
returns table (
  id bigint,
  name text,
  category_path text[],
  descriptors text[]
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    foods.id,
    foods.name,
    foods.category_path,
    foods.descriptors
  from public.foods as foods
  inner join public.food_search_terms as search_terms
    on search_terms.food_id = foods.id
  where length(trim(query_text)) > 0
    and search_terms.normalized_term like '%' || trim(query_text) || '%'
  group by foods.id, foods.name, foods.category_path, foods.descriptors
  order by
    min(
      case
        when search_terms.normalized_term = trim(query_text) then 0
        when search_terms.normalized_term like trim(query_text) || '%' then 1
        else 2
      end
    ),
    foods.id
  limit least(greatest(coalesce(result_limit, 20), 1), 50);
$$;

revoke all on function public.search_foods(text, integer) from public;
grant execute on function public.search_foods(text, integer) to anon, authenticated;
