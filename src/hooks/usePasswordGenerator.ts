export interface GeneratorConfig {
  length: number;
  lowercase: boolean;
  minLowercase: number;
  uppercase: boolean;
  minUppercase: number;
  numbers: boolean;
  minNumbers: number;
  symbols: boolean;
  minSymbols: number;
  standardSymbols: boolean;
  includeChars: string;
  excludeAmbiguous: boolean;
  excludeChars: string;
}

export function generateCustomPassword(options: GeneratorConfig): string {
  const {
    length = 4,
    lowercase = true,
    minLowercase = 0,
    uppercase = true,
    minUppercase = 0,
    numbers = true,
    minNumbers = 0,
    symbols = true,
    minSymbols = 0,
    includeChars = "",
    standardSymbols = true,
    excludeAmbiguous = false,
    excludeChars = "",
  }: GeneratorConfig = options;

  const standardSymbolsChars = "!@#$%*()_+-=";
  const allSymbolsChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  let lowerChars = "abcdefghijklmnopqrstuvwxyz";
  let upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let numberChars = "0123456789";
  let symbolChars = standardSymbols ? standardSymbolsChars : allSymbolsChars;

  if (excludeAmbiguous) {
    const ambiguousSet = new Set("il1Lo0IO".split(""));
    ambiguousSet.forEach((c) => {
      lowerChars = lowerChars.replaceAll(c, "");
      upperChars = upperChars.replaceAll(c, "");
      numberChars = numberChars.replaceAll(c, "");
    });
  }

  if (excludeChars) {
    const excludeSet = new Set(excludeChars.split(""));
    excludeSet.forEach((c) => {
      lowerChars = lowerChars.replaceAll(c, "");
      upperChars = upperChars.replaceAll(c, "");
      numberChars = numberChars.replaceAll(c, "");
      symbolChars = symbolChars.replaceAll(c, "");
    });
  }

  let pool = "";
  const guaranteed: string[] = [];

  // Adiciona os caracteres obrigatórios digitados pelo usuário
  if (includeChars) {
    for (const char of includeChars) {
      // Se não estiver na lista de exclusão, inclui obrigatoriamente
      if (!excludeChars.includes(char)) {
        guaranteed.push(char);
      }
    }
  }

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

  addGuaranteedChars(lowercase, lowerChars, minLowercase);
  addGuaranteedChars(uppercase, upperChars, minUppercase);
  addGuaranteedChars(numbers, numberChars, minNumbers);
  addGuaranteedChars(symbols, symbolChars, minSymbols);

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
