import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Linking,
} from 'react-native';
import { Article } from '../types';
import { getArticles } from '../services/api';
import { ArticleCard } from '../components/ArticleCard';
import { Loading } from '../components/Loading';
import { ErrorView } from '../components/ErrorView';
import { theme } from '../constants/theme';

export default function ArticlesScreen() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await getArticles();
      setArticles(data);
    } catch (err: any) {
      console.error('Error loading articles:', err);
      setError(err.message || 'Failed to load articles');
      setArticles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Don't fetch on mount - user can pull to refresh
    // fetchArticles();
  }, []);

  const handleArticlePress = async (article: Article) => {
    // For now, open canonical URL in browser
    // In future, can add ArticleDetail screen
    const url = article.canonicalUrl || `https://healthpedhyan.com/blog/${article.slug}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  };

  const handleRefresh = () => {
    fetchArticles(true);
  };

  if (loading) {
    return <Loading message="Loading articles..." />;
  }

  if (error && !refreshing) {
    return <ErrorView message={error} onRetry={() => fetchArticles()} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ArticleCard
            article={item}
            onPress={() => handleArticlePress(item)}
          />
        )}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    padding: theme.spacing.md,
  },
});
