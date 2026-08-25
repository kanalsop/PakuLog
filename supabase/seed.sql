insert into public.foods (source_release, source_code, name, category_path, descriptors)
values (
  'mext-2023-correction-20260327',
  '10173',
  'さんま',
  array['魚介類', '魚類'],
  array['皮つき', '生']
)
on conflict (source_release, source_code) do update set
  name = excluded.name,
  category_path = excluded.category_path,
  descriptors = excluded.descriptors;

insert into public.food_search_terms (food_id, term, normalized_term, kind)
select id, search_term.term, search_term.normalized_term, search_term.kind
from public.foods
cross join (
  values
    ('さんま', 'さんま', 'canonical'),
    ('秋刀魚', '秋刀魚', 'alias')
) as search_term(term, normalized_term, kind)
where source_release = 'mext-2023-correction-20260327' and source_code = '10173'
on conflict (food_id, normalized_term) do update set
  term = excluded.term,
  kind = excluded.kind;

insert into public.food_nutrients (
  food_id,
  nutrient_code,
  amount_per_100g,
  unit,
  source_value,
  value_kind
)
select id, nutrient.nutrient_code, nutrient.amount, nutrient.unit, nutrient.source_value, 'measured'
from public.foods
cross join (
  values
    ('ENERC_KCAL', 287::numeric, 'kcal', '287'),
    ('PROT-', 18.1::numeric, 'g', '18.1'),
    ('FAT-', 25.6::numeric, 'g', '25.6'),
    ('CHOCDF-', 0.1::numeric, 'g', '0.1'),
    ('NACL_EQ', 0.4::numeric, 'g', '0.4')
) as nutrient(nutrient_code, amount, unit, source_value)
where source_release = 'mext-2023-correction-20260327' and source_code = '10173'
on conflict (food_id, nutrient_code) do update set
  amount_per_100g = excluded.amount_per_100g,
  unit = excluded.unit,
  source_value = excluded.source_value,
  value_kind = excluded.value_kind;
