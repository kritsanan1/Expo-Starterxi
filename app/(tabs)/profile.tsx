
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState({
    subscription_tier: 'free',
    posts_count: 0,
    posts_limit: 3,
  });

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      // In a real app, you'd fetch this from your database
      setUserProfile({
        subscription_tier: 'free', // or 'premium'
        posts_count: 2, // current month posts
        posts_limit: 3, // free tier limit
      });
    } catch (error) {
      console.error('Load profile error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleUpgrade = () => {
    Alert.alert(
      'Upgrade to Premium',
      'Get unlimited posts, advanced analytics, and priority support!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upgrade', onPress: () => {
          // In a real app, this would navigate to Stripe checkout
          Alert.alert('Coming Soon', 'Stripe integration coming soon!');
        }},
      ]
    );
  };

  const remainingPosts = Math.max(0, userProfile.posts_limit - userProfile.posts_count);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900">Profile</Text>
          <Text className="text-gray-600">{user?.email}</Text>
        </View>

        <View className="p-6">
          {/* Subscription Status */}
          <View className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-900">Subscription</Text>
              <View className={`px-3 py-1 rounded-full ${
                userProfile.subscription_tier === 'premium' ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <Text className={`text-sm font-medium ${
                  userProfile.subscription_tier === 'premium' ? 'text-green-800' : 'text-gray-800'
                }`}>
                  {userProfile.subscription_tier === 'premium' ? 'Premium' : 'Free'}
                </Text>
              </View>
            </View>

            {userProfile.subscription_tier === 'free' && (
              <>
                <View className="mb-4">
                  <Text className="text-gray-600 mb-2">Posts this month</Text>
                  <View className="bg-gray-200 rounded-full h-2">
                    <View 
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${(userProfile.posts_count / userProfile.posts_limit) * 100}%` }}
                    />
                  </View>
                  <Text className="text-sm text-gray-500 mt-1">
                    {userProfile.posts_count} of {userProfile.posts_limit} posts used
                  </Text>
                </View>

                <TouchableOpacity 
                  className="bg-primary-600 px-6 py-3 rounded-lg"
                  onPress={handleUpgrade}
                >
                  <Text className="text-white font-semibold text-center">
                    Upgrade to Premium
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Usage Stats */}
          <View className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</Text>
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Posts this month</Text>
                <Text className="font-semibold">{userProfile.posts_count}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Remaining posts</Text>
                <Text className="font-semibold text-primary-600">
                  {userProfile.subscription_tier === 'premium' ? 'Unlimited' : remainingPosts}
                </Text>
              </View>
            </View>
          </View>

          {/* Account Actions */}
          <View className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Account</Text>
            <TouchableOpacity className="py-3 border-b border-gray-100">
              <Text className="text-gray-900">Privacy Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity className="py-3 border-b border-gray-100">
              <Text className="text-gray-900">Notification Preferences</Text>
            </TouchableOpacity>
            <TouchableOpacity className="py-3 border-b border-gray-100">
              <Text className="text-gray-900">Connected Accounts</Text>
            </TouchableOpacity>
            <TouchableOpacity className="py-3">
              <Text className="text-gray-900">Help & Support</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Out */}
          <TouchableOpacity 
            className="bg-red-600 px-6 py-3 rounded-lg"
            onPress={handleSignOut}
          >
            <Text className="text-white font-semibold text-center">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
