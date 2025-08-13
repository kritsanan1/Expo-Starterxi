
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  published: boolean;
  views: number;
  likes: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface User {
  id: string;
  email: string;
  subscription_tier: 'free' | 'premium';
  posts_count: number;
  posts_limit: number;
}

export interface Draft {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface PostAnalytics {
  post_id: string;
  views: number;
  likes: number;
  date: string;
}
