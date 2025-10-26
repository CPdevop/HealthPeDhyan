import tesseract from 'node-tesseract-ocr';

/**
 * Extract text from an image using Tesseract CLI
 * No worker threads - direct CLI execution for maximum compatibility
 */
export async function extractTextFromImage(
  imageSource: string | File | Blob
): Promise<{ text: string; confidence: number }> {
  console.log('🔍 Starting Tesseract OCR (CLI mode - no workers)...');

  try {
    // Convert File/Blob to file path if needed
    let imagePath: string;

    if (typeof imageSource === 'string') {
      imagePath = imageSource;
    } else {
      throw new Error('File/Blob input not supported yet - please pass file path');
    }

    console.log('📂 Processing image:', imagePath);

    // Configure tesseract options
    const config = {
      lang: 'eng',
      oem: 1, // LSTM OCR Engine Mode
      psm: 3, // Automatic page segmentation
    };

    // Run OCR using tesseract CLI
    const text = await tesseract.recognize(imagePath, config);

    console.log(`✅ Text recognition complete!`);
    console.log(`📝 Extracted ${text.length} characters`);

    // node-tesseract-ocr doesn't provide confidence, so we'll estimate based on text length
    const confidence = text.length > 50 ? 85 : text.length > 20 ? 70 : 60;

    return {
      text: text.trim(),
      confidence,
    };
  } catch (error: any) {
    console.error('❌ Tesseract OCR error:', error);

    // Provide helpful error message if tesseract is not installed
    if (error.message?.includes('tesseract') || error.code === 'ENOENT') {
      throw new Error(
        'Tesseract is not installed. Please install it:\n' +
        'Windows: choco install tesseract OR download from https://github.com/UB-Mannheim/tesseract/wiki\n' +
        'Mac: brew install tesseract\n' +
        'Linux: sudo apt-get install tesseract-ocr'
      );
    }

    throw new Error(`OCR failed: ${error.message}`);
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
