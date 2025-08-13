
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AyrshareService } from '../../lib/services/ayrshare';
import { useAuth } from '../../hooks/useAuth';

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalShares: 0,
    totalComments: 0,
    avgEngagement: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState('7d');

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, timeFilter]);

  const loadAnalytics = async () => {
    try {
      const recentPosts = await AyrshareService.getRecentPosts();
      setPosts(recentPosts.data || []);

      // Calculate analytics
      const totalPosts = recentPosts.data?.length || 0;
      let totalLikes = 0;
      let totalShares = 0;
      let totalComments = 0;

      // In a real app, you'd fetch actual engagement metrics
      // For demo purposes, we'll simulate some data
      recentPosts.data?.forEach((post: any) => {
        totalLikes += Math.floor(Math.random() * 100);
        totalShares += Math.floor(Math.random() * 50);
        totalComments += Math.floor(Math.random() * 20);
      });

      const avgEngagement = totalPosts > 0 ? Math.floor((totalLikes + totalShares + totalComments) / totalPosts) : 0;

      setAnalytics({
        totalPosts,
        totalLikes,
        totalShares,
        totalComments,
        avgEngagement,
      });
    } catch (error) {
      console.error('Load analytics error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const timeFilters = [
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '90d', label: 'Last 3 Months' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900">Analytics</Text>
          <Text className="text-gray-600">Track your social media performance</Text>
        </View>

        <View className="p-6">
          {/* Time Filter */}
          <View className="flex-row mb-6">
            {timeFilters.map(filter => (
              <TouchableOpacity
                key={filter.id}
                className={`px-4 py-2 rounded-lg mr-3 ${
                  timeFilter === filter.id ? 'bg-primary-600' : 'bg-gray-200'
                }`}
                onPress={() => setTimeFilter(filter.id)}
              >
                <Text className={
                  timeFilter === filter.id ? 'text-white font-medium' : 'text-gray-600'
                }>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Overview Stats */}
          <View className="grid grid-cols-2 gap-4 mb-6">
            <View className="bg-white p-4 rounded-lg shadow-sm">
              <Text className="text-2xl font-bold text-primary-600">{analytics.totalPosts}</Text>
              <Text className="text-gray-600">Total Posts</Text>
            </View>
            <View className="bg-white p-4 rounded-lg shadow-sm">
              <Text className="text-2xl font-bold text-green-600">{analytics.avgEngagement}</Text>
              <Text className="text-gray-600">Avg Engagement</Text>
            </View>
          </View>

          {/* Engagement Breakdown */}
          <View className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Engagement Breakdown</Text>
            <View className="space-y-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">Likes</Text>
                <Text className="text-lg font-semibold text-red-500">{analytics.totalLikes}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">Shares</Text>
                <Text className="text-lg font-semibold text-green-500">{analytics.totalShares}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">Comments</Text>
                <Text className="text-lg font-semibold text-blue-500">{analytics.totalComments}</Text>
              </View>
            </View>
          </View>

          {/* Top Performing Posts */}
          <View className="bg-white p-4 rounded-lg shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Recent Posts Performance</Text>
            {posts.length === 0 ? (
              <Text className="text-gray-600 text-center py-8">
                No posts to analyze yet. Create your first post!
              </Text>
            ) : (
              posts.slice(0, 5).map((post: any, index) => (
                <View key={index} className="border-b border-gray-100 py-3 last:border-b-0">
                  <Text className="text-gray-900 font-medium mb-2" numberOfLines={2}>
                    {post.post || post.content || 'Post content'}
                  </Text>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500 text-sm">
                      {new Date(post.created_at || post.createdAt).toLocaleDateString()}
                    </Text>
                    <View className="flex-row space-x-4">
                      <Text className="text-red-500 text-sm">❤️ {Math.floor(Math.random() * 100)}</Text>
                      <Text className="text-green-500 text-sm">🔄 {Math.floor(Math.random() * 50)}</Text>
                      <Text className="text-blue-500 text-sm">💬 {Math.floor(Math.random() * 20)}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
