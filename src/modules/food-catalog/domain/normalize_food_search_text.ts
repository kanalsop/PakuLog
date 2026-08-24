const KATAKANA_TO_HIRAGANA_OFFSET = 0x60;

export function normalizeFoodSearchText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[ァ-ヶ]/g, (character) =>
      String.fromCharCode(character.charCodeAt(0) - KATAKANA_TO_HIRAGANA_OFFSET),
    )
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("ja-JP");
}
