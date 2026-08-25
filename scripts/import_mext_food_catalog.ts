import fs from "node:fs/promises";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import ExcelJS from "exceljs";

import { normalizeFoodSearchText } from "../src/modules/food-catalog/domain/normalize_food_search_text";
import { parseMextFoodRow } from "../src/modules/food-catalog/infrastructure/mext_food_row";

const SOURCE_RELEASE = "mext-2023-correction-20260327";
const SOURCE_URL = "https://www.mext.go.jp/content/20260327-mxt_kagsei-mext-000029402_02.xlsx";
const DATA_SHEET_NAME = "表全体";
const UNIT_ROW = 11;
const NUTRIENT_CODE_ROW = 12;
const FIRST_FOOD_ROW = 13;
const FIRST_NUTRIENT_COLUMN = 5;
const LAST_NUTRIENT_COLUMN = 61;
const REMARK_COLUMN = 62;
const BATCH_SIZE = 500;

const CURATED_ALIASES: Readonly<Record<string, readonly string[]>> = {
  "10173": ["秋刀魚"],
};

type ParsedFood = ReturnType<typeof parseMextFoodRow>;

function normalizeUnit(sourceUnit: string): string {
  for (const unit of ["kcal", "kJ", "μg", "mg", "g", "%"] as const) {
    if (sourceUnit.includes(unit)) {
      return unit;
    }
  }

  return sourceUnit.trim();
}

function batchesOf<T>(values: readonly T[], batchSize = BATCH_SIZE): T[][] {
  const batches: T[][] = [];

  for (let index = 0; index < values.length; index += batchSize) {
    batches.push(values.slice(index, index + batchSize));
  }

  return batches;
}

async function loadSourceWorkbook(): Promise<ExcelJS.Workbook> {
  const localSourcePath = process.env.MEXT_FOOD_DATA_FILE;
  let sourceBytes: Buffer;

  if (localSourcePath) {
    sourceBytes = await fs.readFile(localSourcePath);
  } else {
    const response = await fetch(SOURCE_URL);

    if (!response.ok) {
      throw new Error(`文科省食品データを取得できませんでした: ${response.status}`);
    }

    sourceBytes = Buffer.from(await response.arrayBuffer());
  }

  const workbook = new ExcelJS.Workbook();
  type ExcelJsLoadInput = Parameters<typeof workbook.xlsx.load>[0];
  await workbook.xlsx.load(sourceBytes as unknown as ExcelJsLoadInput);
  return workbook;
}

function parseFoods(workbook: ExcelJS.Workbook): ParsedFood[] {
  const sheet = workbook.getWorksheet(DATA_SHEET_NAME);

  if (!sheet) {
    throw new Error(`食品データシート「${DATA_SHEET_NAME}」がありません`);
  }

  const nutrients = Array.from(
    { length: LAST_NUTRIENT_COLUMN - FIRST_NUTRIENT_COLUMN + 1 },
    (_, offset) => {
      const column = FIRST_NUTRIENT_COLUMN + offset;
      return {
        column,
        code: sheet.getCell(NUTRIENT_CODE_ROW, column).text.trim(),
        unit: normalizeUnit(sheet.getCell(UNIT_ROW, column).text),
      };
    },
  ).filter(({ code }) => code.length > 0);
  const nutrientWithoutUnit = nutrients.find(({ unit }) => unit.length === 0);

  if (nutrientWithoutUnit) {
    throw new Error(`栄養成分の単位がありません: ${nutrientWithoutUnit.code}`);
  }

  const foods: ParsedFood[] = [];

  for (let row = FIRST_FOOD_ROW; row <= sheet.actualRowCount; row += 1) {
    const groupCode = sheet.getCell(row, 1).text.trim();
    const sourceCode = sheet.getCell(row, 2).text.trim();
    const sourceName = sheet.getCell(row, 4).text.trim();

    if (!groupCode || !sourceCode || !sourceName) {
      continue;
    }

    const parsed = parseMextFoodRow({
      groupCode,
      sourceCode,
      sourceName,
      remark: sheet.getCell(row, REMARK_COLUMN).text,
      nutrients: nutrients.map(({ column, code, unit }) => ({
        code,
        unit,
        sourceValue: sheet.getCell(row, column).text.trim(),
      })),
    });
    const curatedAliases = CURATED_ALIASES[sourceCode] ?? [];

    foods.push({
      ...parsed,
      searchTerms: [
        ...new Set([
          ...parsed.searchTerms,
          ...curatedAliases.map((alias) => normalizeFoodSearchText(alias)),
        ]),
      ],
    });
  }

  return foods;
}

async function upsertFoods(client: SupabaseClient, foods: readonly ParsedFood[]) {
  const foodIdBySourceCode = new Map<string, number>();

  for (const batch of batchesOf(foods, 100)) {
    const { data, error } = await client
      .from("foods")
      .upsert(
        batch.map((food) => ({
          source_release: SOURCE_RELEASE,
          source_code: food.sourceCode,
          name: food.name,
          category_path: food.categoryPath,
          descriptors: food.descriptors,
        })),
        { onConflict: "source_release,source_code" },
      )
      .select("id,source_code");

    if (error) {
      throw error;
    }

    for (const food of data) {
      foodIdBySourceCode.set(food.source_code, food.id);
    }
  }

  return foodIdBySourceCode;
}

async function upsertCatalogDetails(
  client: SupabaseClient,
  foods: readonly ParsedFood[],
  foodIdBySourceCode: ReadonlyMap<string, number>,
) {
  const searchTerms = foods.flatMap((food) => {
    const foodId = foodIdBySourceCode.get(food.sourceCode);

    if (!foodId) {
      throw new Error(`食品IDを取得できませんでした: ${food.sourceCode}`);
    }

    return food.searchTerms.map((term, index) => ({
      food_id: foodId,
      term,
      normalized_term: term,
      kind: index === 0 ? "canonical" : "alias",
    }));
  });
  const nutrientValues = foods.flatMap((food) => {
    const foodId = foodIdBySourceCode.get(food.sourceCode);

    if (!foodId) {
      throw new Error(`食品IDを取得できませんでした: ${food.sourceCode}`);
    }

    return food.nutrients.map((nutrient) => ({
      food_id: foodId,
      nutrient_code: nutrient.nutrientCode,
      amount_per_100g: nutrient.amountPer100g,
      unit: nutrient.unit,
      source_value: nutrient.sourceValue,
      value_kind: nutrient.valueKind,
    }));
  });

  for (const batch of batchesOf(searchTerms)) {
    const { error } = await client
      .from("food_search_terms")
      .upsert(batch, { onConflict: "food_id,normalized_term" });

    if (error) {
      throw error;
    }
  }

  for (const batch of batchesOf(nutrientValues)) {
    const { error } = await client
      .from("food_nutrients")
      .upsert(batch, { onConflict: "food_id,nutrient_code" });

    if (error) {
      throw error;
    }
  }

  return { searchTermCount: searchTerms.length, nutrientValueCount: nutrientValues.length };
}

const workbook = await loadSourceWorkbook();
const foods = parseFoods(workbook);
const sanma = foods.find((food) => food.sourceCode === "10173");

if (!sanma) {
  throw new Error("検証用食品10173（さんま）が見つかりませんでした");
}

if (process.argv.includes("--dry-run")) {
  console.log(
    JSON.stringify({
      sourceRelease: SOURCE_RELEASE,
      foodCount: foods.length,
      sanma: {
        name: sanma.name,
        categoryPath: sanma.categoryPath,
        descriptors: sanma.descriptors,
        searchTerms: sanma.searchTerms,
        nutrientCount: sanma.nutrients.length,
      },
    }),
  );
} else {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY が必要です");
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  const foodIds = await upsertFoods(client, foods);
  const details = await upsertCatalogDetails(client, foods, foodIds);

  console.log(
    JSON.stringify({
      sourceRelease: SOURCE_RELEASE,
      foodCount: foods.length,
      ...details,
    }),
  );
}
