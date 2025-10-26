import { prisma } from './prisma';
import { normalizeIngredientName } from './ocr';

export interface IngredientAnalysis {
  name: string;
  status: 'good' | 'moderate' | 'bad' | 'unknown';
  riskLevel?: 'LOW' | 'MODERATE' | 'HIGH';
  description?: string;
  impact: string;
}

export interface LabelAnalysisResult {
  overallScore: number; // 0-100
  rating: 'excellent' | 'good' | 'fair' | 'poor' | 'very_poor';
  ingredients: IngredientAnalysis[];
  positives: string[];
  concerns: string[];
  recommendations: string[];
  nutritionAnalysis?: {
    calories?: string;
    sugar?: string;
    sodium?: string;
    fat?: string;
    warnings: string[];
  };
}

/**
 * Analyze extracted label data and generate health insights
 */
export async function analyzeLabelData(data: {
  ingredients: string[];
  nutritionFacts: Record<string, string>;
  warnings: string[];
}): Promise<LabelAnalysisResult> {
  const ingredientAnalyses: IngredientAnalysis[] = [];
  const positives: string[] = [];
  const concerns: string[] = [];
  const recommendations: string[] = [];

  // Analyze each ingredient
  for (const ingredient of data.ingredients) {
    const normalized = normalizeIngredientName(ingredient);

    // Try to match with our ingredient database
    const dbIngredient = await prisma.ingredient.findFirst({
      where: {
        OR: [
          { name: { contains: normalized, mode: 'insensitive' } },
          { slug: { contains: normalized, mode: 'insensitive' } },
        ],
      },
    });

    if (dbIngredient) {
      const status =
        dbIngredient.riskLevel === 'LOW'
          ? 'good'
          : dbIngredient.riskLevel === 'MODERATE'
          ? 'moderate'
          : 'bad';

      ingredientAnalyses.push({
        name: ingredient,
        status,
        riskLevel: dbIngredient.riskLevel,
        description: dbIngredient.description || undefined,
        impact: getImpactMessage(dbIngredient.riskLevel, dbIngredient.name),
      });

      if (status === 'bad') {
        concerns.push(`Contains ${dbIngredient.name} (${dbIngredient.riskLevel} risk)`);
      } else if (status === 'good') {
        positives.push(`Contains ${dbIngredient.name}`);
      }
    } else {
      // Check against common harmful ingredients
      const analysis = analyzeCommonIngredient(ingredient);
      ingredientAnalyses.push(analysis);

      if (analysis.status === 'bad') {
        concerns.push(analysis.impact);
      } else if (analysis.status === 'good') {
        positives.push(analysis.impact);
      }
    }
  }

  // Analyze nutrition facts
  const nutritionWarnings: string[] = [];

  if (data.nutritionFacts['Sugar'] || data.nutritionFacts['Total Sugars']) {
    const sugarValue = parseFloat(
      data.nutritionFacts['Sugar'] || data.nutritionFacts['Total Sugars']
    );
    if (sugarValue > 10) {
      nutritionWarnings.push('High sugar content');
      concerns.push(`High sugar content (${sugarValue}g per serving)`);
    }
  }

  if (data.nutritionFacts['Sodium']) {
    const sodiumValue = parseFloat(data.nutritionFacts['Sodium']);
    if (sodiumValue > 500) {
      nutritionWarnings.push('High sodium content');
      concerns.push(`High sodium content (${sodiumValue}mg per serving)`);
    }
  }

  // Calculate overall score
  const goodCount = ingredientAnalyses.filter(i => i.status === 'good').length;
  const badCount = ingredientAnalyses.filter(i => i.status === 'bad').length;
  const moderateCount = ingredientAnalyses.filter(i => i.status === 'moderate').length;

  let score = 50; // Start at neutral
  score += goodCount * 10;
  score -= badCount * 15;
  score -= moderateCount * 5;
  score = Math.max(0, Math.min(100, score)); // Clamp between 0-100

  // Generate recommendations
  if (badCount > 0) {
    recommendations.push('Look for alternatives without harmful additives');
  }
  if (nutritionWarnings.length > 0) {
    recommendations.push('Consider products with lower sugar and sodium');
  }
  if (score < 50) {
    recommendations.push('This product may not be the healthiest choice');
  } else if (score >= 70) {
    recommendations.push('This product appears to be a healthier option');
  }

  return {
    overallScore: score,
    rating: getRating(score),
    ingredients: ingredientAnalyses,
    positives,
    concerns,
    recommendations,
    nutritionAnalysis: {
      calories: data.nutritionFacts['Calories'],
      sugar: data.nutritionFacts['Sugar'] || data.nutritionFacts['Total Sugars'],
      sodium: data.nutritionFacts['Sodium'],
      fat: data.nutritionFacts['Total Fat'],
      warnings: nutritionWarnings,
    },
  };
}

function getRating(score: number): 'excellent' | 'good' | 'fair' | 'poor' | 'very_poor' {
  if (score >= 80) return 'excellent';
  if (score >= 65) return 'good';
  if (score >= 50) return 'fair';
  if (score >= 35) return 'poor';
  return 'very_poor';
}

function getImpactMessage(riskLevel: string, name: string): string {
  switch (riskLevel) {
    case 'LOW':
      return `${name} is generally safe for consumption`;
    case 'MODERATE':
      return `${name} should be consumed in moderation`;
    case 'HIGH':
      return `${name} may have negative health impacts`;
    default:
      return `More research needed on ${name}`;
  }
}

/**
 * Analyze common ingredients not in database
 */
function analyzeCommonIngredient(ingredient: string): IngredientAnalysis {
  const lower = ingredient.toLowerCase();

  // Harmful ingredients
  const harmful = [
    'high fructose corn syrup',
    'partially hydrogenated',
    'trans fat',
    'artificial color',
    'artificial flavor',
    'msg',
    'monosodium glutamate',
    'sodium nitrite',
    'sodium benzoate',
    'potassium benzoate',
    'bha',
    'bht',
    'tbhq',
    'aspartame',
    'acesulfame',
  ];

  for (const bad of harmful) {
    if (lower.includes(bad)) {
      return {
        name: ingredient,
        status: 'bad',
        riskLevel: 'HIGH',
        impact: `${ingredient} is linked to potential health concerns`,
      };
    }
  }

  // Beneficial ingredients
  const beneficial = [
    'whole grain',
    'whole wheat',
    'oats',
    'quinoa',
    'brown rice',
    'flaxseed',
    'chia',
    'vitamin',
    'mineral',
    'fiber',
    'protein',
    'omega',
  ];

  for (const good of beneficial) {
    if (lower.includes(good)) {
      return {
        name: ingredient,
        status: 'good',
        riskLevel: 'LOW',
        impact: `${ingredient} is a nutritious ingredient`,
      };
    }
  }

  // Moderate concern
  const moderate = ['sugar', 'salt', 'sodium', 'oil', 'syrup'];

  for (const mod of moderate) {
    if (lower.includes(mod)) {
      return {
        name: ingredient,
        status: 'moderate',
        riskLevel: 'MODERATE',
        impact: `${ingredient} should be consumed in moderation`,
      };
    }
  }

  return {
    name: ingredient,
    status: 'unknown',
    impact: `${ingredient} - no specific health concerns identified`,
  };
}
