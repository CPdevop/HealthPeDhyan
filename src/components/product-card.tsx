'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Product {
  id: string;
  slug: string;
  title: string;
  brand?: { name: string };
  category?: { name: string };
  heroImage?: string | null;
  shortSummary?: string | null;
  healthScore: number;
  isPalmOilFree: boolean;
  isLowSugar: boolean;
  isArtificialColorFree: boolean;
  isWholeGrain: boolean;
  isMeetsStandard: boolean;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getHealthScoreText = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Fair';
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-2 hover:border-primary-500">
      <Link href={`/product/${product.slug}`}>
        {/* Product Image */}
        <div className="relative aspect-square bg-gradient-to-br from-neutral-50 to-neutral-100">
          {product.heroImage ? (
            <Image
              src={product.heroImage}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl">📦</span>
            </div>
          )}

          {/* Health Score Badge */}
          {product.healthScore > 0 && (
            <div className={`absolute top-3 right-3 ${getHealthScoreColor(product.healthScore)} text-white rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-lg`}>
              <span className="text-2xl font-bold leading-none">{product.healthScore}</span>
              <span className="text-[10px] font-semibold">{getHealthScoreText(product.healthScore)}</span>
            </div>
          )}

          {/* Top Choice Badge */}
          {product.healthScore >= 85 && (
            <div className="absolute top-3 left-3 bg-amber-400 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <span>⭐</span>
              <span>Top Choice</span>
            </div>
          )}

          {/* Quick View Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>

        <CardContent className="p-4">
          {/* Brand */}
          {product.brand && (
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-1">
              {product.brand.name}
            </p>
          )}

          {/* Title */}
          <h3 className="font-semibold text-base text-neutral-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors min-h-[3rem]">
            {product.title}
          </h3>

          {/* Health Benefits Icons */}
          <div className="flex gap-2 mb-3">
            {product.isPalmOilFree && (
              <div className="w-8 h-8 rounded-full bg-green-50 border border-green-200 flex items-center justify-center" title="No Palm Oil">
                <span className="text-sm">🌴</span>
              </div>
            )}
            {product.isLowSugar && (
              <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center" title="Low Sugar">
                <span className="text-sm">🍯</span>
              </div>
            )}
            {product.isArtificialColorFree && (
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center" title="No Artificial Colors">
                <span className="text-sm">🎨</span>
              </div>
            )}
            {product.isWholeGrain && (
              <div className="w-8 h-8 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center" title="Whole Grain">
                <span className="text-sm">🌾</span>
              </div>
            )}
          </div>

          {/* Summary */}
          {product.shortSummary && (
            <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
              {product.shortSummary}
            </p>
          )}

          {/* CTA Button */}
          <Button className="w-full group-hover:bg-primary-700 transition-colors" asChild>
            <span>View Details & Buy</span>
          </Button>
        </CardContent>
      </Link>
    </Card>
  );
}
