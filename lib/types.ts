
export interface Post {
  id: string;
  content: string;
  platforms: string[];
  published_at?: string;
  status: 'draft' | 'published' | 'scheduled';
  engagement?: {
    likes: number;
    shares: number;
    comments: number;
  };
  created_at: string;
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
  content: string;
  platforms: string[];
  created_at: string;
}
