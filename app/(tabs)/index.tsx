import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { supabase, BlogPost } from '../../lib/supabase';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Load posts error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-white text-xl text-center mb-4">
            Please sign in to view your blog posts
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/auth')}
            className="bg-blue-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="px-6 py-4 border-b border-gray-800">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-2xl font-bold">My Blog Posts</Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/create')}
            className="bg-blue-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">New Post</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadPosts} />
        }
      >
        {posts.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6 py-20">
            <Text className="text-gray-400 text-lg text-center mb-4">
              No blog posts yet
            </Text>
            <Text className="text-gray-500 text-center mb-6">
              Start writing your first blog post with AI assistance
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/create')}
              className="bg-blue-600 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold">Create First Post</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-6 py-4">
            {posts.map((post) => (
              <TouchableOpacity
                key={post.id}
                onPress={() => router.push(`/(tabs)/create?id=${post.id}`)}
                className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-white text-lg font-semibold flex-1 mr-2">
                    {post.title || 'Untitled Post'}
                  </Text>
                  <View className={`px-2 py-1 rounded ${post.published ? 'bg-green-600' : 'bg-yellow-600'}`}>
                    <Text className="text-white text-xs">
                      {post.published ? 'Published' : 'Draft'}
                    </Text>
                  </View>
                </View>

                {post.excerpt && (
                  <Text className="text-gray-300 text-sm mb-3" numberOfLines={2}>
                    {post.excerpt}
                  </Text>
                )}

                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-500 text-sm">
                    {formatDate(post.created_at)}
                  </Text>
                  <View className="flex-row space-x-4">
                    <Text className="text-gray-500 text-sm">
                      👁 {post.views}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      ❤️ {post.likes}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}