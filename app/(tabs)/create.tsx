
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { supabase, BlogPost } from '../../lib/supabase';
import { GeminiService } from '../../lib/services/gemini';
import { StorageService } from '../../lib/services/storage';

export default function CreateScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadPost(id);
    } else {
      loadDraft();
    }
  }, [id]);

  useEffect(() => {
    // Auto-save draft every 30 seconds
    const interval = setInterval(() => {
      if (title || content) {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [title, content]);

  const loadPost = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', postId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      setCurrentPost(data);
      setTitle(data.title);
      setContent(data.content);
      setPublished(data.published);
    } catch (error) {
      console.error('Load post error:', error);
      Alert.alert('Error', 'Failed to load post');
    }
  };

  const loadDraft = async () => {
    try {
      const draft = await StorageService.getDraft('current');
      if (draft) {
        setTitle(draft.title);
        setContent(draft.content);
      }
    } catch (error) {
      console.error('Load draft error:', error);
    }
  };

  const saveDraft = async () => {
    try {
      await StorageService.saveDraft('current', {
        id: 'current',
        title,
        content,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Save draft error:', error);
    }
  };

  const generateContent = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title first to generate content ideas');
      return;
    }

    setAiLoading(true);
    try {
      const suggestions = await GeminiService.generateBlogContent(title, content);
      if (suggestions) {
        setContent(prev => prev + (prev ? '\n\n' : '') + suggestions);
      }
    } catch (error) {
      console.error('AI generation error:', error);
      Alert.alert('Error', 'Failed to generate content. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const improveContent = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please write some content first to improve it');
      return;
    }

    setAiLoading(true);
    try {
      const improved = await GeminiService.improveContent(content);
      if (improved) {
        setContent(improved);
      }
    } catch (error) {
      console.error('AI improvement error:', error);
      Alert.alert('Error', 'Failed to improve content. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const savePost = async (shouldPublish = false) => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    setLoading(true);
    try {
      const excerpt = content.slice(0, 150) + (content.length > 150 ? '...' : '');
      
      const postData = {
        title: title.trim(),
        content,
        excerpt,
        published: shouldPublish,
        user_id: user?.id,
        updated_at: new Date().toISOString(),
      };

      if (currentPost) {
        // Update existing post
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', currentPost.id);

        if (error) throw error;
      } else {
        // Create new post
        const { error } = await supabase
          .from('blog_posts')
          .insert([{
            ...postData,
            views: 0,
            likes: 0,
            created_at: new Date().toISOString(),
          }]);

        if (error) throw error;
      }

      // Clear draft
      await StorageService.removeDraft('current');
      
      Alert.alert(
        'Success', 
        shouldPublish ? 'Post published successfully!' : 'Post saved as draft!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Save post error:', error);
      Alert.alert('Error', 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  const extractExcerpt = (text: string) => {
    const plainText = text.replace(/[#*`_\[\]]/g, '').trim();
    return plainText.slice(0, 150) + (plainText.length > 150 ? '...' : '');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View className="px-6 py-4 border-b border-gray-800">
          <View className="flex-row justify-between items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-blue-400 text-lg">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-white text-lg font-semibold">
              {currentPost ? 'Edit Post' : 'New Post'}
            </Text>
            <TouchableOpacity 
              onPress={() => savePost(false)}
              disabled={loading}
            >
              <Text className="text-blue-400 text-lg">
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-6">
          {/* Title Input */}
          <View className="py-4">
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter your blog post title..."
              placeholderTextColor="#6B7280"
              className="text-white text-xl font-semibold bg-transparent border-b border-gray-700 pb-2"
              multiline
            />
          </View>

          {/* AI Assistance */}
          <View className="py-4 border-b border-gray-800">
            <Text className="text-gray-300 text-sm mb-3">AI Assistance</Text>
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={generateContent}
                disabled={aiLoading}
                className="bg-purple-600 px-4 py-2 rounded-lg flex-1"
              >
                <Text className="text-white text-center font-medium">
                  {aiLoading ? 'Generating...' : '✨ Generate Ideas'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={improveContent}
                disabled={aiLoading}
                className="bg-green-600 px-4 py-2 rounded-lg flex-1"
              >
                <Text className="text-white text-center font-medium">
                  {aiLoading ? 'Improving...' : '🚀 Improve'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content Editor */}
          <View className="py-4 flex-1">
            <Text className="text-gray-300 text-sm mb-3">Content (Markdown supported)</Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Start writing your blog post... You can use markdown formatting."
              placeholderTextColor="#6B7280"
              className="text-white bg-gray-800 rounded-lg p-4 text-base leading-6"
              multiline
              style={{ minHeight: 300, textAlignVertical: 'top' }}
            />
          </View>

          {/* Preview */}
          {content && (
            <View className="py-4 border-t border-gray-800">
              <Text className="text-gray-300 text-sm mb-3">Excerpt Preview</Text>
              <View className="bg-gray-800 rounded-lg p-4">
                <Text className="text-gray-300 text-sm">
                  {extractExcerpt(content)}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Publish Button */}
        <View className="px-6 py-4 border-t border-gray-800">
          <TouchableOpacity
            onPress={() => savePost(true)}
            disabled={loading || !title.trim()}
            className={`py-4 rounded-lg ${
              loading || !title.trim() 
                ? 'bg-gray-600' 
                : 'bg-blue-600'
            }`}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {loading ? 'Publishing...' : published ? 'Update Post' : 'Publish Post'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
