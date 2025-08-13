
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AyrshareService } from '../lib/services/ayrshare';
import { StorageService } from '../lib/services/storage';
import { supabase } from '../lib/supabase';

export default function PublishScreen() {
  const router = useRouter();
  const { content, platforms, draftId } = useLocalSearchParams();
  const [publishing, setPublishing] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);

  const platformsArray = typeof platforms === 'string' ? platforms.split(',') : [];

  const handlePublishNow = async () => {
    setPublishing(true);
    try {
      // Check subscription limits (simplified)
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('subscription_tier, posts_count, posts_limit')
        .single();

      if (userProfile?.subscription_tier === 'free' && userProfile?.posts_count >= userProfile?.posts_limit) {
        Alert.alert(
          'Post Limit Reached',
          'You have reached your monthly post limit. Upgrade to premium for unlimited posts.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => {
              // Navigate to subscription screen
              Alert.alert('Coming Soon', 'Stripe integration coming soon!');
            }},
          ]
        );
        setPublishing(false);
        return;
      }

      // Publish to social media platforms
      const result = await AyrshareService.publishPost(content as string, platformsArray);
      
      if (result.status === 'success') {
        // Save to database
        await supabase.from('posts').insert({
          content,
          platforms: platformsArray,
          status: 'published',
          published_at: new Date().toISOString(),
          ayrshare_id: result.id,
        });

        // Update user post count
        if (userProfile) {
          await supabase
            .from('user_profiles')
            .update({ posts_count: userProfile.posts_count + 1 })
            .eq('id', userProfile.id);
        }

        // Delete draft if it exists
        if (draftId) {
          await StorageService.deleteDraft(draftId as string);
        }

        Alert.alert('Success', 'Your post has been published!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') }
        ]);
      } else {
        throw new Error(result.message || 'Publishing failed');
      }
    } catch (error) {
      console.error('Publish error:', error);
      Alert.alert('Error', 'Failed to publish post. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  const handleSchedulePost = () => {
    Alert.alert('Coming Soon', 'Post scheduling will be available in the next update!');
  };

  const platformColors: { [key: string]: string } = {
    twitter: 'bg-blue-400',
    linkedin: 'bg-blue-600',
    facebook: 'bg-blue-700',
    instagram: 'bg-pink-600',
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-6">
        {/* Preview */}
        <View className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Post Preview</Text>
          <Text className="text-gray-900 mb-4">{content}</Text>
          
          <Text className="text-sm font-medium text-gray-700 mb-2">Publishing to:</Text>
          <View className="flex-row flex-wrap">
            {platformsArray.map(platform => (
              <View 
                key={platform}
                className={`px-3 py-1 rounded-full mr-2 mb-2 ${platformColors[platform] || 'bg-gray-600'}`}
              >
                <Text className="text-white text-sm font-medium">
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Publishing Options */}
        <View className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Publishing Options</Text>
          
          <TouchableOpacity 
            className="bg-primary-600 p-4 rounded-lg mb-3"
            onPress={handlePublishNow}
            disabled={publishing}
          >
            <Text className="text-white font-semibold text-center text-lg">
              {publishing ? 'Publishing...' : 'Publish Now'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="border border-primary-600 p-4 rounded-lg"
            onPress={handleSchedulePost}
          >
            <Text className="text-primary-600 font-semibold text-center text-lg">
              Schedule for Later
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <View className="bg-blue-50 p-4 rounded-lg">
          <Text className="text-blue-800 font-semibold mb-2">💡 Publishing Tips</Text>
          <Text className="text-blue-700 text-sm">
            • Best posting times: Twitter (9-10 AM), LinkedIn (7-8 AM, 5-6 PM)
          </Text>
          <Text className="text-blue-700 text-sm">
            • Use hashtags to increase reach (2-3 for Twitter, 3-5 for LinkedIn)
          </Text>
          <Text className="text-blue-700 text-sm">
            • Engage with comments within the first hour for better visibility
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
