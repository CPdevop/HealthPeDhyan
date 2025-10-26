import { createWorker } from 'tesseract.js';

/**
 * Extract text from an image using Tesseract OCR
 */
export async function extractTextFromImage(
  imageSource: string | File | Blob
): Promise<{ text: string; confidence: number }> {
  const worker = await createWorker('eng');

  try {
    const result = await worker.recognize(imageSource);

    return {
      text: result.data.text,
      confidence: result.data.confidence,
    };
  } finally {
    await worker.terminate();
  }
}

/**
 * Extract specific sections from label text
 */
export function parseLabelText(text: string): {
  ingredients: string[];
  nutritionFacts: Record<string, string>;
  productName: string | null;
  warnings: string[];
} {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

  let ingredients: string[] = [];
  let nutritionFacts: Record<string, string> = {};
  let productName: string | null = null;
  let warnings: string[] = [];

  // Extract product name (usually first meaningful line)
  if (lines.length > 0) {
    productName = lines[0];
  }

  // Find ingredients section
  const ingredientsIndex = lines.findIndex(line =>
    /ingredients?:/i.test(line)
  );

  if (ingredientsIndex !== -1) {
    // Get text after "Ingredients:"
    let ingredientsText = lines[ingredientsIndex].replace(/ingredients?:/i, '').trim();

    // Check next few lines for continuation
    for (let i = ingredientsIndex + 1; i < Math.min(ingredientsIndex + 5, lines.length); i++) {
      const line = lines[i];
      // Stop if we hit a new section
      if (/^(nutrition|allergen|warning|serving|storage):/i.test(line)) break;
      ingredientsText += ' ' + line;
    }

    // Split by common separators
    ingredients = ingredientsText
      .split(/,|;|\(|\)/)
      .map(ing => ing.trim())
      .filter(ing => ing.length > 2 && !(/^\d+$/.test(ing)));
  }

  // Extract nutrition facts
  lines.forEach(line => {
    // Match patterns like "Calories: 150" or "Total Fat 5g"
    const nutritionMatch = line.match(/^([a-z\s]+)[\s:]+(\d+\.?\d*\s*[a-z%]*)/i);
    if (nutritionMatch) {
      const [, key, value] = nutritionMatch;
      nutritionFacts[key.trim()] = value.trim();
    }
  });

  // Extract warnings/allergens
  lines.forEach(line => {
    if (/contains?:|allergen|warning/i.test(line)) {
      warnings.push(line);
    }
  });

  return {
    ingredients,
    nutritionFacts,
    productName,
    warnings,
  };
}

/**
 * Normalize ingredient names for database matching
 */
export function normalizeIngredientName(ingredient: string): string {
  return ingredient
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}
