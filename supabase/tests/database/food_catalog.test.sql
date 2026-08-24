begin;

select plan(13);

select has_table(
  'public',
  'foods',
  'The food catalog stores canonical food records'
);

select is(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.foods'::regclass
  ),
  true,
  'The food catalog has row level security enabled'
);

select has_table(
  'public',
  'food_search_terms',
  'The food catalog stores canonical and alias search terms'
);

select has_table(
  'public',
  'food_nutrients',
  'The food catalog stores nutrient values separately from food identity'
);

select ok(
  (
    select bool_and(relrowsecurity)
    from pg_class
    where oid in (
      'public.foods'::regclass,
      'public.food_search_terms'::regclass,
      'public.food_nutrients'::regclass
    )
  ),
  'Every food catalog table has row level security enabled'
);

select ok(
  has_table_privilege('anon', 'public.foods', 'select')
    and has_table_privilege('anon', 'public.food_search_terms', 'select')
    and has_table_privilege('anon', 'public.food_nutrients', 'select')
    and has_table_privilege('authenticated', 'public.foods', 'select')
    and has_table_privilege('authenticated', 'public.food_search_terms', 'select')
    and has_table_privilege('authenticated', 'public.food_nutrients', 'select'),
  'Application roles can read the food catalog'
);

select ok(
  not has_table_privilege('anon', 'public.foods', 'insert, update, delete')
    and not has_table_privilege('anon', 'public.food_search_terms', 'insert, update, delete')
    and not has_table_privilege('anon', 'public.food_nutrients', 'insert, update, delete')
    and not has_table_privilege('authenticated', 'public.foods', 'insert, update, delete')
    and not has_table_privilege('authenticated', 'public.food_search_terms', 'insert, update, delete')
    and not has_table_privilege('authenticated', 'public.food_nutrients', 'insert, update, delete'),
  'Application roles cannot mutate the food catalog'
);

select is(
  (
    select count(*)::integer
    from pg_policies
    where schemaname = 'public'
      and tablename in ('foods', 'food_search_terms', 'food_nutrients')
      and cmd = 'SELECT'
  ),
  3,
  'Each food catalog table has an explicit read policy'
);

select has_function(
  'public',
  'search_foods',
  array['text', 'integer'],
  'The catalog exposes a bounded food search function'
);

set local role anon;

select is(
  (select name from public.search_foods('さんま', 20) limit 1),
  'さんま',
  'Canonical terms find their food record'
);

select results_eq(
  $$ select name from public.search_foods('秋刀魚', 20) $$,
  $$ values ('さんま'::text) $$,
  'Alias terms find their canonical food record'
);

reset role;

select results_eq(
  $$
    select nutrient_code
    from public.food_nutrients
    where food_id = (
      select id
      from public.foods
      where source_release = 'mext-2023-correction-20260327'
        and source_code = '10173'
    )
      and nutrient_code in ('CHOCDF-', 'ENERC_KCAL', 'FAT-', 'NACL_EQ', 'PROT-')
    order by nutrient_code
  $$,
  $$
    values
      ('CHOCDF-'::text),
      ('ENERC_KCAL'::text),
      ('FAT-'::text),
      ('NACL_EQ'::text),
      ('PROT-'::text)
  $$,
  'Seed nutrients use the source MEXT component identifiers'
);

select ok(
  has_table_privilege('service_role', 'public.foods', 'select, insert, update')
    and has_table_privilege('service_role', 'public.food_search_terms', 'select, insert, update')
    and has_table_privilege('service_role', 'public.food_nutrients', 'select, insert, update')
    and has_sequence_privilege('service_role', 'public.foods_id_seq', 'usage'),
  'The import role can upsert versioned food catalog records'
);

select * from finish();

rollback;
