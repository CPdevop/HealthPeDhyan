'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Share2,
} from 'lucide-react';

interface AnalysisResultsProps {
  result: any;
  imageUrl: string | null;
  onReset: () => void;
}

export function LabelAnalysisResults({ result, imageUrl, onReset }: AnalysisResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 65) return 'text-lime-600';
    if (score >= 50) return 'text-yellow-600';
    if (score >= 35) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 65) return 'bg-lime-50 border-lime-200';
    if (score >= 50) return 'bg-yellow-50 border-yellow-200';
    if (score >= 35) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getRatingText = (rating: string) => {
    const ratings: Record<string, string> = {
      excellent: 'Excellent Choice!',
      good: 'Good Choice',
      fair: 'Fair Choice',
      poor: 'Poor Choice',
      very_poor: 'Not Recommended',
    };
    return ratings[rating] || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header with Score */}
      <Card className={`border-2 ${getScoreBgColor(result.overallScore)}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-neutral-900">
                  {getRatingText(result.rating)}
                </h2>
              </div>
              <p className="text-neutral-600">Based on ingredient and nutrition analysis</p>
            </div>
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(result.overallScore)}`}>
                {result.overallScore}
              </div>
              <div className="text-sm text-neutral-600 mt-1">Health Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image Preview */}
        {imageUrl && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scanned Label</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={imageUrl}
                  alt="Product label"
                  className="w-full h-auto rounded-lg border border-neutral-200"
                />
                <div className="mt-4 flex gap-2">
                  <Button onClick={onReset} variant="outline" size="sm" className="flex-1">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Scan Another
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analysis Details */}
        <div className={imageUrl ? 'lg:col-span-2 space-y-6' : 'lg:col-span-3 space-y-6'}>
          {/* Positives */}
          {result.positives && result.positives.length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  What's Good ({result.positives.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.positives.map((positive: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-green-900">{positive}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Concerns */}
          {result.concerns && result.concerns.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <XCircle className="h-5 w-5 text-red-600" />
                  Health Concerns ({result.concerns.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.concerns.map((concern: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <TrendingDown className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-red-900">{concern}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 flex-shrink-0">•</span>
                      <span className="text-sm text-blue-900">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Detailed Ingredients */}
          {result.ingredients && result.ingredients.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Ingredient Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.ingredients.map((ingredient: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {ingredient.status === 'good' && (
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        )}
                        {ingredient.status === 'bad' && (
                          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        )}
                        {ingredient.status === 'moderate' && (
                          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                        )}
                        {ingredient.status === 'unknown' && (
                          <div className="h-5 w-5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-neutral-900">{ingredient.name}</div>
                          <div className="text-xs text-neutral-600">{ingredient.impact}</div>
                        </div>
                      </div>
                      <Badge
                        variant={
                          ingredient.status === 'good'
                            ? 'default'
                            : ingredient.status === 'bad'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {ingredient.riskLevel || ingredient.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Nutrition Facts */}
          {result.nutritionAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>Nutrition Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {result.nutritionAnalysis.calories && (
                    <div className="text-center p-3 rounded-lg bg-neutral-50">
                      <div className="text-2xl font-bold text-neutral-900">
                        {result.nutritionAnalysis.calories}
                      </div>
                      <div className="text-xs text-neutral-600 mt-1">Calories</div>
                    </div>
                  )}
                  {result.nutritionAnalysis.sugar && (
                    <div className="text-center p-3 rounded-lg bg-neutral-50">
                      <div className="text-2xl font-bold text-neutral-900">
                        {result.nutritionAnalysis.sugar}
                      </div>
                      <div className="text-xs text-neutral-600 mt-1">Sugar</div>
                    </div>
                  )}
                  {result.nutritionAnalysis.sodium && (
                    <div className="text-center p-3 rounded-lg bg-neutral-50">
                      <div className="text-2xl font-bold text-neutral-900">
                        {result.nutritionAnalysis.sodium}
                      </div>
                      <div className="text-xs text-neutral-600 mt-1">Sodium</div>
                    </div>
                  )}
                  {result.nutritionAnalysis.fat && (
                    <div className="text-center p-3 rounded-lg bg-neutral-50">
                      <div className="text-2xl font-bold text-neutral-900">
                        {result.nutritionAnalysis.fat}
                      </div>
                      <div className="text-xs text-neutral-600 mt-1">Total Fat</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
