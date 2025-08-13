
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function AuthScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = isSignUp 
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        if (isSignUp) {
          Alert.alert('Success', 'Check your email for verification link');
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      
      if (error) {
        Alert.alert('Error', error.message);
      }
    } catch (error) {
      console.error('Google auth error:', error);
      Alert.alert('Error', 'Failed to sign in with Google');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-1 justify-center px-6">
          {/* Logo/Title */}
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-primary-600 mb-2">
              Social Media Pro
            </Text>
            <Text className="text-gray-600 text-center">
              Create, schedule, and analyze your social media content
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4 mb-6">
            <TextInput
              className="border border-gray-300 rounded-lg p-4"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              className="border border-gray-300 rounded-lg p-4"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Auth Button */}
          <TouchableOpacity 
            className="bg-primary-600 p-4 rounded-lg mb-4"
            onPress={handleAuth}
            disabled={loading}
          >
            <Text className="text-white font-semibold text-center text-lg">
              {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Text>
          </TouchableOpacity>

          {/* Google Auth */}
          <TouchableOpacity 
            className="border border-gray-300 p-4 rounded-lg mb-6"
            onPress={handleGoogleAuth}
          >
            <Text className="text-gray-700 font-semibold text-center text-lg">
              Continue with Google
            </Text>
          </TouchableOpacity>

          {/* Toggle Auth Mode */}
          <TouchableOpacity 
            className="items-center"
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text className="text-primary-600">
              {isSignUp 
                ? 'Already have an account? Sign In' 
                : "Don't have an account? Sign Up"
              }
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
