export type UserRole = 'guest' | 'subscriber' | 'creator' | 'admin';
export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'vip';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due';
export type PostStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type OrderStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';
export type SubscriberStatus = 'active' | 'unsubscribed' | 'bounced';

export interface Profile {
  id: string;
  username: string;
  email: string | null;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: UserRole;
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
  stripe_customer_id: string | null;
  social_links: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  cover_image: string | null;
  status: PostStatus;
  published_at: string | null;
  scheduled_for: string | null;
  reading_time: number;
  view_count: number;
  is_premium: boolean;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  items: OrderItem[];
  total_amount: number;
  currency: string;
  status: OrderStatus;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string | null;
  status: SubscriberStatus;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export interface PostAnalytics {
  id: string;
  post_id: string;
  author_id: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  bookmark_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
}

export interface PostWithAuthor extends Post {
  author: Profile;
  categories?: Category[];
  tags?: Tag[];
  like_count?: number;
  comment_count?: number;
  is_liked?: boolean;
  is_bookmarked?: boolean;
}

export interface CommentWithAuthor extends Comment {
  author: Profile;
  replies?: CommentWithAuthor[];
}

export interface ProfileWithStats extends Profile {
  post_count?: number;
  follower_count?: number;
  following_count?: number;
  is_following?: boolean;
}
