import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Product, RootStackParamList } from '../types';
import { getProducts } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { Loading } from '../components/Loading';
import { ErrorView } from '../components/ErrorView';
import { theme } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: any) {
      console.error('Error loading products:', err);
      setError(err.message || 'Failed to load products');
      setProducts([]); // Set empty array on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Don't fetch on mount - let user trigger it
    // This prevents crash on startup if backend is unreachable
    // fetchProducts();
  }, []);

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { slug: product.slug });
  };

  const handleRefresh = () => {
    fetchProducts(true);
  };

  const handleLoadProducts = () => {
    fetchProducts(false);
  };

  if (loading) {
    return <Loading message="Loading products..." />;
  }

  if (error && products.length === 0) {
    return <ErrorView message={error} onRetry={handleLoadProducts} />;
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

      {products.length === 0 ? (
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeEmoji}>🏠</Text>
          <Text style={styles.welcomeTitle}>Welcome!</Text>
          <Text style={styles.welcomeText}>
            Pull down to refresh and load products from the server
          </Text>
        </View>
      ) : (
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
        />
      )}
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
    backgroundColor: theme.colors.primary,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.background,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.background,
    opacity: 0.9,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  welcomeEmoji: {
    fontSize: 80,
    marginBottom: theme.spacing.md,
  },
  welcomeTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  welcomeText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  listContent: {
    padding: theme.spacing.md,
  },
  row: {
    justifyContent: 'space-between',
  },
});
