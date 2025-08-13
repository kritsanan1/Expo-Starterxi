
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { GeminiService } from '../../lib/services/gemini';
import { StorageService } from '../../lib/services/storage';
import { useAuth } from '../../hooks/useAuth';

export default function CreateScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { draft: draftId } = useLocalSearchParams();
  
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter']);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const platforms = [
    { id: 'twitter', name: 'Twitter', color: 'bg-blue-400' },
    { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-600' },
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-700' },
    { id: 'instagram', name: 'Instagram', color: 'bg-pink-600' },
  ];

  useEffect(() => {
    if (draftId) {
      loadDraft();
    }
  }, [draftId]);

  const loadDraft = async () => {
    try {
      const drafts = await StorageService.getDrafts();
      const draft = drafts.find(d => d.id === draftId);
      if (draft) {
        setContent(draft.content);
        setSelectedPlatforms(draft.platforms);
      }
    } catch (error) {
      console.error('Load draft error:', error);
    }
  };

  const generateSuggestions = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content first');
      return;
    }

    setLoadingSuggestions(true);
    try {
      const suggestion = await GeminiService.improveContent(content);
      setSuggestions([suggestion]);
    } catch (error) {
      console.error('Generate suggestions error:', error);
      Alert.alert('Error', 'Failed to generate suggestions. Please try again.');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const generateFromPrompt = async () => {
    Alert.prompt(
      'Content Idea',
      'What would you like to post about?',
      async (prompt) => {
        if (prompt) {
          setLoadingSuggestions(true);
          try {
            const suggestion = await GeminiService.generateContentSuggestions(prompt);
            setSuggestions([suggestion]);
          } catch (error) {
            console.error('Generate from prompt error:', error);
            Alert.alert('Error', 'Failed to generate content. Please try again.');
          } finally {
            setLoadingSuggestions(false);
          }
        }
      }
    );
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const saveDraft = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content first');
      return;
    }

    try {
      if (draftId) {
        await StorageService.updateDraft(draftId as string, {
          content,
          platforms: selectedPlatforms,
        });
      } else {
        await StorageService.saveDraft({
          content,
          platforms: selectedPlatforms,
        });
      }
      Alert.alert('Success', 'Draft saved successfully!');
    } catch (error) {
      console.error('Save draft error:', error);
      Alert.alert('Error', 'Failed to save draft');
    }
  };

  const continueToPublish = () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content first');
      return;
    }

    if (selectedPlatforms.length === 0) {
      Alert.alert('Error', 'Please select at least one platform');
      return;
    }

    router.push({
      pathname: '/publish',
      params: {
        content,
        platforms: selectedPlatforms.join(','),
        draftId: draftId || '',
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1 p-6">
          {/* Content Editor */}
          <View className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Create Your Post</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 min-h-32"
              multiline
              placeholder="What's on your mind?"
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
            />
            <Text className="text-gray-500 text-sm mt-2">{content.length}/280 characters</Text>
          </View>

          {/* AI Suggestions */}
          <View className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">AI Suggestions</Text>
            <View className="flex-row mb-3">
              <TouchableOpacity 
                className="bg-primary-600 px-4 py-2 rounded-lg mr-3"
                onPress={generateSuggestions}
                disabled={loadingSuggestions}
              >
                <Text className="text-white font-medium">
                  {loadingSuggestions ? 'Improving...' : 'Improve Content'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-gray-600 px-4 py-2 rounded-lg"
                onPress={generateFromPrompt}
                disabled={loadingSuggestions}
              >
                <Text className="text-white font-medium">Generate Ideas</Text>
              </TouchableOpacity>
            </View>
            
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity 
                key={index}
                className="bg-gray-50 p-3 rounded-lg mb-2"
                onPress={() => setContent(suggestion)}
              >
                <Text className="text-gray-900">{suggestion}</Text>
                <Text className="text-primary-600 text-sm mt-1">Tap to use</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Platform Selection */}
          <View className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Select Platforms</Text>
            <View className="flex-row flex-wrap">
              {platforms.map(platform => (
                <TouchableOpacity
                  key={platform.id}
                  className={`px-4 py-2 rounded-lg mr-3 mb-3 ${
                    selectedPlatforms.includes(platform.id) 
                      ? platform.color 
                      : 'bg-gray-200'
                  }`}
                  onPress={() => togglePlatform(platform.id)}
                >
                  <Text className={
                    selectedPlatforms.includes(platform.id) 
                      ? 'text-white font-medium' 
                      : 'text-gray-600'
                  }>
                    {platform.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View className="p-6 bg-white border-t border-gray-200">
          <View className="flex-row">
            <TouchableOpacity 
              className="bg-gray-200 px-6 py-3 rounded-lg flex-1 mr-3"
              onPress={saveDraft}
            >
              <Text className="text-gray-800 font-semibold text-center">Save Draft</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-primary-600 px-6 py-3 rounded-lg flex-1"
              onPress={continueToPublish}
            >
              <Text className="text-white font-semibold text-center">Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
