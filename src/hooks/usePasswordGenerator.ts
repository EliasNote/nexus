export function generateCustomPassword(options: {
  length?: number;
  lowercase?: boolean;
  minCharLowercase?: number;
  uppercase?: boolean;
  minCharUppercase?: number;
  numbers?: boolean;
  minCharNumbers?: number;
  symbols?: boolean;
  minCharSymbols?: number;
  customSymbols?: string;
  standardSymbols?: boolean;
  excludeAmbiguous?: boolean;
  excludeCharacters?: string;
}): string {
  const {
    length = 4,
    lowercase = true,
    minCharLowercase = 0,
    uppercase = true,
    minCharUppercase = 0,
    numbers = true,
    minCharNumbers = 0,
    symbols = true,
    minCharSymbols = 0,
    customSymbols = "!@#$%^&*()_+-=[]{}|;:,.<>?",
    standardSymbols = true,
    excludeAmbiguous = false,
    excludeCharacters = "",
  } = options;

  const standardSymbolsChars = "!@#$%*()_+-=";
  let lowerChars = "abcdefghijklmnopqrstuvwxyz";
  let upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let numberChars = "0123456789";
  let symbolChars = standardSymbols ? standardSymbolsChars : customSymbols;

  if (excludeAmbiguous) {
    const ambiguousSet = new Set("il1Lo0IO".split(""));
    ambiguousSet.forEach((c) => {
      lowerChars = lowerChars.replaceAll(c, "");
      upperChars = upperChars.replaceAll(c, "");
      numberChars = numberChars.replaceAll(c, "");
    });
  }

  if (excludeCharacters) {
    const excludeSet = new Set(excludeCharacters.split(""));
    excludeSet.forEach((c) => {
      lowerChars = lowerChars.replaceAll(c, "");
      upperChars = upperChars.replaceAll(c, "");
      numberChars = numberChars.replaceAll(c, "");
      symbolChars = symbolChars.replaceAll(c, "");
    });
  }

  let pool = "";
  const guaranteed: string[] = [];

  const getRandomChar = (str: string) => {
    if (!str.length) return "";
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return str[array[0] % str.length];
  };

  const addGuaranteedChars = (enabled: boolean, chars: string, minCount: number) => {
    if (!enabled || !chars) return;
    pool += chars;
    const count = Math.max(minCount > 0 ? minCount : 1, 0);
    for (let i = 0; i < count; i++) {
      guaranteed.push(getRandomChar(chars));
    }
  };

  addGuaranteedChars(lowercase, lowerChars, minCharLowercase);
  addGuaranteedChars(uppercase, upperChars, minCharUppercase);
  addGuaranteedChars(numbers, numberChars, minCharNumbers);
  addGuaranteedChars(symbols, symbolChars, minCharSymbols);

  if (!pool) return "";

  const targetLength = Math.max(length, guaranteed.length);

  const result = [...guaranteed];

  while (result.length < targetLength) {
    const char = getRandomChar(pool);
    if (!char) break;
    result.push(char);
  }

  for (let i = result.length - 1; i > 0; i--) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const j = array[0] % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result.join("");
}
