
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { AyrshareService } from '../../lib/services/ayrshare';
import { Post } from '../../lib/types';
import { StorageService } from '../../lib/services/storage';

export default function DashboardScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [drafts, setDrafts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userStats, setUserStats] = useState({
    postsThisMonth: 0,
    totalEngagement: 0,
    topPerformingPost: null,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    } else if (user) {
      loadDashboardData();
    }
  }, [user, loading]);

  const loadDashboardData = async () => {
    try {
      // Load recent posts
      const recentPosts = await AyrshareService.getRecentPosts();
      setPosts(recentPosts.data || []);

      // Load drafts
      const savedDrafts = await StorageService.getDrafts();
      setDrafts(savedDrafts);

      // Calculate stats
      const postsThisMonth = recentPosts.data?.filter((post: any) => {
        const postDate = new Date(post.created_at);
        const now = new Date();
        return postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear();
      }).length || 0;

      setUserStats({
        postsThisMonth,
        totalEngagement: 0, // Calculate from analytics
        topPerformingPost: null,
      });
    } catch (error) {
      console.error('Load dashboard error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-600">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900">Dashboard</Text>
          <Text className="text-gray-600">Welcome back, {user?.email}</Text>
        </View>

        {/* Stats Cards */}
        <View className="p-6">
          <View className="flex-row justify-between mb-6">
            <View className="bg-white p-4 rounded-lg shadow-sm flex-1 mr-3">
              <Text className="text-2xl font-bold text-primary-600">{userStats.postsThisMonth}</Text>
              <Text className="text-gray-600">Posts This Month</Text>
            </View>
            <View className="bg-white p-4 rounded-lg shadow-sm flex-1 ml-3">
              <Text className="text-2xl font-bold text-primary-600">{drafts.length}</Text>
              <Text className="text-gray-600">Saved Drafts</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</Text>
            <View className="flex-row justify-between">
              <TouchableOpacity 
                className="bg-primary-600 px-6 py-3 rounded-lg flex-1 mr-2"
                onPress={() => router.push('/create')}
              >
                <Text className="text-white font-semibold text-center">Create Post</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-white border border-primary-600 px-6 py-3 rounded-lg flex-1 ml-2"
                onPress={() => router.push('/(tabs)/analytics')}
              >
                <Text className="text-primary-600 font-semibold text-center">View Analytics</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Posts */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Recent Posts</Text>
            {posts.length === 0 ? (
              <View className="bg-white p-6 rounded-lg shadow-sm">
                <Text className="text-gray-600 text-center">No posts yet. Create your first post!</Text>
              </View>
            ) : (
              posts.slice(0, 3).map((post, index) => (
                <View key={index} className="bg-white p-4 rounded-lg shadow-sm mb-3">
                  <Text className="text-gray-900 font-medium" numberOfLines={2}>
                    {post.content || 'Post content'}
                  </Text>
                  <View className="flex-row justify-between items-center mt-2">
                    <Text className="text-gray-500 text-sm">
                      {post.platforms?.join(', ') || 'Multiple platforms'}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {new Date(post.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Drafts */}
          {drafts.length > 0 && (
            <View>
              <Text className="text-lg font-semibold text-gray-900 mb-3">Recent Drafts</Text>
              {drafts.slice(0, 2).map((draft: any) => (
                <TouchableOpacity 
                  key={draft.id} 
                  className="bg-white p-4 rounded-lg shadow-sm mb-3"
                  onPress={() => router.push(`/create?draft=${draft.id}`)}
                >
                  <Text className="text-gray-900 font-medium" numberOfLines={2}>
                    {draft.content}
                  </Text>
                  <Text className="text-gray-500 text-sm mt-2">
                    Draft • {new Date(draft.created_at).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
