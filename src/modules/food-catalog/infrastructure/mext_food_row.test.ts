import { parseMextFoodRow } from "./mext_food_row";

describe("parseMextFoodRow", () => {
  it("preserves MEXT identity, search terms, descriptors, and nutrient value semantics", () => {
    expect(
      parseMextFoodRow({
        groupCode: "10",
        sourceCode: "10173",
        sourceName: "＜魚類＞　さんま　皮つき　生",
        remark: "別名： サンマ、秋刀魚",
        nutrients: [
          { code: "ENERC_KCAL", unit: "kcal", sourceValue: "287" },
          { code: "PROT-", unit: "g", sourceValue: "(18.1)" },
          { code: "VITC", unit: "mg", sourceValue: "Tr" },
          { code: "ALC", unit: "g", sourceValue: "-" },
        ],
      }),
    ).toEqual({
      sourceCode: "10173",
      name: "さんま",
      categoryPath: ["魚介類", "魚類"],
      descriptors: ["皮つき", "生"],
      searchTerms: ["さんま", "<魚類> さんま 皮つき 生", "秋刀魚"],
      nutrients: [
        {
          nutrientCode: "ENERC_KCAL",
          amountPer100g: 287,
          unit: "kcal",
          sourceValue: "287",
          valueKind: "measured",
        },
        {
          nutrientCode: "PROT-",
          amountPer100g: 18.1,
          unit: "g",
          sourceValue: "(18.1)",
          valueKind: "estimated",
        },
        {
          nutrientCode: "VITC",
          amountPer100g: null,
          unit: "mg",
          sourceValue: "Tr",
          valueKind: "trace",
        },
        {
          nutrientCode: "ALC",
          amountPer100g: null,
          unit: "g",
          sourceValue: "-",
          valueKind: "missing",
        },
      ],
    });
  });
});
