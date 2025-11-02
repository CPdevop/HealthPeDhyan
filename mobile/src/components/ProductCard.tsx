import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Product } from '../types';
import { theme } from '../constants/theme';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - theme.spacing.md * 3) / 2;

export function ProductCard({ product, onPress }: ProductCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        {product.heroImage ? (
          <Image
            source={{ uri: product.heroImage }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>📦</Text>
          </View>
        )}

        {/* Health Score Badge */}
        {product.healthScore > 0 && (
          <View style={[styles.scoreBadge, getScoreStyle(product.healthScore)]}>
            <Text style={styles.scoreText}>{product.healthScore}</Text>
            <Text style={styles.scoreLabel}>Health</Text>
          </View>
        )}

        {/* Top Badge - Best Quality */}
        {product.healthScore >= 85 && (
          <View style={styles.topBadge}>
            <Text style={styles.topBadgeText}>⭐ Top Choice</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        {/* Brand */}
        {product.brand && (
          <Text style={styles.brand} numberOfLines={1}>
            {product.brand.name}
          </Text>
        )}

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>

        {/* Health Benefits Row */}
        <View style={styles.benefitsRow}>
          {product.isPalmOilFree && (
            <View style={styles.miniBadge}>
              <Text style={styles.miniBadgeText}>🌴</Text>
            </View>
          )}
          {product.isLowSugar && (
            <View style={styles.miniBadge}>
              <Text style={styles.miniBadgeText}>🍯</Text>
            </View>
          )}
          {product.isArtificialColorFree && (
            <View style={styles.miniBadge}>
              <Text style={styles.miniBadgeText}>🎨</Text>
            </View>
          )}
          {product.isWholeGrain && (
            <View style={styles.miniBadge}>
              <Text style={styles.miniBadgeText}>🌾</Text>
            </View>
          )}
        </View>

        {/* CTA Button */}
        <TouchableOpacity style={styles.ctaButton} onPress={onPress}>
          <Text style={styles.ctaButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function getScoreStyle(score: number) {
  if (score >= 80) {
    return { backgroundColor: theme.colors.success };
  } else if (score >= 60) {
    return { backgroundColor: theme.colors.warning };
  } else {
    return { backgroundColor: theme.colors.error };
  }
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.md,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.1,
    position: 'relative',
    backgroundColor: theme.colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.surfaceDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
  },
  scoreBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  scoreText: {
    ...theme.typography.h3,
    color: theme.colors.background,
    fontWeight: '700',
    lineHeight: 20,
  },
  scoreLabel: {
    fontSize: 9,
    color: theme.colors.background,
    fontWeight: '600',
  },
  topBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    backgroundColor: '#FFD700',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    ...theme.shadows.sm,
  },
  topBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
  infoContainer: {
    padding: theme.spacing.sm,
  },
  brand: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
    minHeight: 36,
    lineHeight: 18,
  },
  benefitsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: theme.spacing.sm,
    minHeight: 24,
  },
  miniBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  miniBadgeText: {
    fontSize: 12,
  },
  ctaButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  ctaButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.background,
    fontWeight: '600',
  },
});
