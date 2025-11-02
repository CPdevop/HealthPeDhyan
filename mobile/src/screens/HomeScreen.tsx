import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Product, RootStackParamList } from '../types';
import { getProducts } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { Loading } from '../components/Loading';
import { ErrorView } from '../components/ErrorView';
import { theme } from '../constants/theme';
import { mockProducts } from '../data/mockData';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [products, setProducts] = useState<Product[]>(mockProducts); // Start with mock data
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(true);

  const fetchProducts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await getProducts();
      setProducts(data);
      setUsingMockData(false);
    } catch (err: any) {
      console.error('Error loading products:', err);
      setError(err.message || 'Failed to load products');
      // Keep mock data on error
      if (products.length === 0) {
        setProducts(mockProducts);
        setUsingMockData(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { slug: product.slug });
  };

  const handleRefresh = () => {
    fetchProducts(true);
  };

  const handleTryLoadReal = () => {
    fetchProducts(false);
  };

  if (loading && products.length === 0) {
    return <Loading message="Loading products..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HealthPeDhyan</Text>
        <Text style={styles.headerSubtitle}>
          Make Informed Food Choices 🌿
        </Text>
      </View>

      {/* Demo Mode Banner */}
      {usingMockData && (
        <TouchableOpacity style={styles.demoBanner} onPress={handleTryLoadReal}>
          <Text style={styles.demoText}>
            📱 Demo Mode - Sample Products Shown
          </Text>
          <Text style={styles.demoSubtext}>
            Tap to connect to server for real products
          </Text>
        </TouchableOpacity>
      )}

      {/* Featured Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Products</Text>
        <Text style={styles.sectionSubtitle}>
          {products.length} healthy options
        </Text>
      </View>

      {/* Products Grid */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => handleProductPress(item)}
          />
        )}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyText}>No products found</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleTryLoadReal}>
              <Text style={styles.retryButtonText}>Load Products</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
  },
  headerTitle: {
    ...theme.typography.h1,
    color: theme.colors.background,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...theme.typography.body,
    color: theme.colors.background,
    opacity: 0.95,
  },
  demoBanner: {
    backgroundColor: '#FFF3CD',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE69C',
  },
  demoText: {
    ...theme.typography.bodySmall,
    color: '#856404',
    fontWeight: '600',
    marginBottom: 2,
  },
  demoSubtext: {
    ...theme.typography.caption,
    color: '#856404',
  },
  sectionHeader: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: 2,
  },
  sectionSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    ...theme.typography.body,
    color: theme.colors.background,
    fontWeight: '600',
  },
});
