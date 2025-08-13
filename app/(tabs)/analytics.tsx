
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { supabase, BlogPost } from '../../lib/supabase';

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    avgViews: 0,
  });

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('published', true)
        .order('views', { ascending: false });

      if (error) throw error;

      const posts = data || [];
      setPosts(posts);

      const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
      const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
      
      setStats({
        totalPosts: posts.length,
        totalViews,
        totalLikes,
        avgViews: posts.length > 0 ? Math.round(totalViews / posts.length) : 0,
      });
    } catch (error) {
      console.error('Load analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-white text-xl text-center">
            Please sign in to view analytics
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="px-6 py-4 border-b border-gray-800">
        <Text className="text-white text-2xl font-bold">Analytics</Text>
        <Text className="text-gray-400 text-sm">Track your blog post performance</Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadAnalytics} />
        }
      >
        {/* Overview Stats */}
        <View className="px-6 py-4">
          <Text className="text-white text-lg font-semibold mb-4">Overview</Text>
          <View className="flex-row flex-wrap">
            <View className="bg-gray-800 rounded-lg p-4 mr-3 mb-3 flex-1 min-w-[45%]">
              <Text className="text-gray-400 text-sm">Total Posts</Text>
              <Text className="text-white text-2xl font-bold">{stats.totalPosts}</Text>
            </View>
            <View className="bg-gray-800 rounded-lg p-4 mb-3 flex-1 min-w-[45%]">
              <Text className="text-gray-400 text-sm">Total Views</Text>
              <Text className="text-white text-2xl font-bold">{stats.totalViews.toLocaleString()}</Text>
            </View>
            <View className="bg-gray-800 rounded-lg p-4 mr-3 mb-3 flex-1 min-w-[45%]">
              <Text className="text-gray-400 text-sm">Total Likes</Text>
              <Text className="text-white text-2xl font-bold">{stats.totalLikes}</Text>
            </View>
            <View className="bg-gray-800 rounded-lg p-4 mb-3 flex-1 min-w-[45%]">
              <Text className="text-gray-400 text-sm">Avg Views</Text>
              <Text className="text-white text-2xl font-bold">{stats.avgViews}</Text>
            </View>
          </View>
        </View>

        {/* Top Posts */}
        <View className="px-6 py-4 border-t border-gray-800">
          <Text className="text-white text-lg font-semibold mb-4">Top Performing Posts</Text>
          {posts.length === 0 ? (
            <View className="bg-gray-800 rounded-lg p-6 items-center">
              <Text className="text-gray-400 text-center">
                No published posts yet
              </Text>
              <Text className="text-gray-500 text-sm text-center mt-2">
                Publish some posts to see analytics
              </Text>
            </View>
          ) : (
            posts.slice(0, 10).map((post, index) => (
              <View key={post.id} className="bg-gray-800 rounded-lg p-4 mb-3">
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1 mr-3">
                    <Text className="text-white font-semibold text-base">
                      {post.title}
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      Published {formatDate(post.created_at)}
                    </Text>
                  </View>
                  <View className="bg-blue-600 rounded-full w-6 h-6 items-center justify-center">
                    <Text className="text-white text-xs font-bold">
                      {index + 1}
                    </Text>
                  </View>
                </View>
                
                <View className="flex-row justify-between items-center">
                  <View className="flex-row space-x-4">
                    <View className="flex-row items-center">
                      <Text className="text-gray-400 text-sm">👁 </Text>
                      <Text className="text-white text-sm font-medium">
                        {post.views.toLocaleString()}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-gray-400 text-sm">❤️ </Text>
                      <Text className="text-white text-sm font-medium">
                        {post.likes}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center">
                    <Text className="text-gray-400 text-xs">
                      {((post.likes / Math.max(post.views, 1)) * 100).toFixed(1)}% engagement
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
