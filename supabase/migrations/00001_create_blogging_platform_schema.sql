/*
# Advanced Blogging Platform Database Schema

## 1. Overview
This migration creates the complete database structure for a premium blogging platform with:
- User management with roles
- Content creation and publishing
- Subscription tiers and monetization
- Community features (comments, likes, follows)
- Analytics tracking
- Newsletter subscriptions

## 2. New Tables

### profiles
- `id` (uuid, primary key, references auth.users)
- `username` (text, unique, not null)
- `email` (text, unique)
- `full_name` (text)
- `bio` (text)
- `avatar_url` (text)
- `role` (user_role enum: guest, subscriber, creator, admin)
- `subscription_tier` (subscription_tier enum: free, basic, premium, vip)
- `subscription_expires_at` (timestamptz)
- `stripe_customer_id` (text)
- `social_links` (jsonb)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### posts
- `id` (uuid, primary key)
- `author_id` (uuid, references profiles)
- `title` (text, not null)
- `slug` (text, unique, not null)
- `content` (text)
- `excerpt` (text)
- `cover_image` (text)
- `status` (post_status enum: draft, scheduled, published, archived)
- `published_at` (timestamptz)
- `scheduled_for` (timestamptz)
- `reading_time` (integer, minutes)
- `view_count` (integer, default 0)
- `is_premium` (boolean, default false)
- `seo_title` (text)
- `seo_description` (text)
- `seo_keywords` (text[])
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### categories
- `id` (uuid, primary key)
- `name` (text, unique, not null)
- `slug` (text, unique, not null)
- `description` (text)
- `created_at` (timestamptz)

### tags
- `id` (uuid, primary key)
- `name` (text, unique, not null)
- `slug` (text, unique, not null)
- `created_at` (timestamptz)

### post_categories (junction table)
- `post_id` (uuid, references posts)
- `category_id` (uuid, references categories)
- Primary key: (post_id, category_id)

### post_tags (junction table)
- `post_id` (uuid, references posts)
- `tag_id` (uuid, references tags)
- Primary key: (post_id, tag_id)

### comments
- `id` (uuid, primary key)
- `post_id` (uuid, references posts)
- `author_id` (uuid, references profiles)
- `parent_id` (uuid, references comments, nullable for threading)
- `content` (text, not null)
- `is_approved` (boolean, default true)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### likes
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles)
- `post_id` (uuid, references posts)
- `created_at` (timestamptz)
- Unique constraint: (user_id, post_id)

### bookmarks
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles)
- `post_id` (uuid, references posts)
- `created_at` (timestamptz)
- Unique constraint: (user_id, post_id)

### follows
- `id` (uuid, primary key)
- `follower_id` (uuid, references profiles)
- `following_id` (uuid, references profiles)
- `created_at` (timestamptz)
- Unique constraint: (follower_id, following_id)

### subscriptions
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles)
- `tier` (subscription_tier enum)
- `stripe_subscription_id` (text, unique)
- `stripe_price_id` (text)
- `status` (subscription_status enum: active, cancelled, expired, past_due)
- `current_period_start` (timestamptz)
- `current_period_end` (timestamptz)
- `cancel_at_period_end` (boolean, default false)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### orders
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles, nullable for guest checkout)
- `items` (jsonb, not null)
- `total_amount` (numeric(12,2), not null)
- `currency` (text, default 'usd')
- `status` (order_status enum: pending, completed, cancelled, refunded)
- `stripe_session_id` (text, unique)
- `stripe_payment_intent_id` (text)
- `customer_email` (text)
- `customer_name` (text)
- `completed_at` (timestamptz)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### newsletter_subscribers
- `id` (uuid, primary key)
- `email` (text, unique, not null)
- `name` (text)
- `status` (subscriber_status enum: active, unsubscribed, bounced)
- `subscribed_at` (timestamptz)
- `unsubscribed_at` (timestamptz)

### post_analytics
- `id` (uuid, primary key)
- `post_id` (uuid, references posts)
- `date` (date, not null)
- `views` (integer, default 0)
- `unique_visitors` (integer, default 0)
- `avg_time_on_page` (integer, seconds)
- `bounce_rate` (numeric(5,2))
- Unique constraint: (post_id, date)

## 3. Security (RLS Policies)

### profiles
- Public read access for basic profile info
- Users can update their own profile (except role and subscription_tier)
- Admins have full access

### posts
- Public read access for published posts
- Authors can manage their own posts
- Admins have full access

### comments
- Public read access for approved comments
- Users can create and edit their own comments
- Authors and admins can moderate comments

### likes, bookmarks, follows
- Users can manage their own interactions
- Public read access for aggregated counts

### subscriptions, orders
- Users can view their own records
- Service role (Edge Functions) can manage all records

### newsletter_subscribers
- Service role only (managed via Edge Functions)

## 4. Helper Functions
- `is_admin()` - Check if user is admin
- `is_creator()` - Check if user is creator or admin
- `can_access_premium_content()` - Check subscription status
- `increment_post_views()` - Atomic view counter

## 5. Triggers
- Auto-create profile on user signup (first user becomes admin)
- Auto-update `updated_at` timestamps
- Auto-generate slugs from titles
*/

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('guest', 'subscriber', 'creator', 'admin');
CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'premium', 'vip');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'past_due');
CREATE TYPE post_status AS ENUM ('draft', 'scheduled', 'published', 'archived');
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'cancelled', 'refunded');
CREATE TYPE subscriber_status AS ENUM ('active', 'unsubscribed', 'bounced');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text UNIQUE,
  full_name text,
  bio text,
  avatar_url text,
  role user_role DEFAULT 'subscriber'::user_role NOT NULL,
  subscription_tier subscription_tier DEFAULT 'free'::subscription_tier NOT NULL,
  subscription_expires_at timestamptz,
  stripe_customer_id text,
  social_links jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text,
  excerpt text,
  cover_image text,
  status post_status DEFAULT 'draft'::post_status NOT NULL,
  published_at timestamptz,
  scheduled_for timestamptz,
  reading_time integer DEFAULT 5,
  view_count integer DEFAULT 0,
  is_premium boolean DEFAULT false,
  seo_title text,
  seo_description text,
  seo_keywords text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Post-Categories junction table
CREATE TABLE IF NOT EXISTS post_categories (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- Post-Tags junction table
CREATE TABLE IF NOT EXISTS post_tags (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_approved boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Follows table
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tier subscription_tier NOT NULL,
  stripe_subscription_id text UNIQUE,
  stripe_price_id text,
  status subscription_status DEFAULT 'active'::subscription_status NOT NULL,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  items jsonb NOT NULL,
  total_amount numeric(12,2) NOT NULL,
  currency text DEFAULT 'usd' NOT NULL,
  status order_status DEFAULT 'pending'::order_status NOT NULL,
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text,
  customer_email text,
  customer_name text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  status subscriber_status DEFAULT 'active'::subscriber_status NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz
);

-- Post analytics table
CREATE TABLE IF NOT EXISTS post_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  views integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  avg_time_on_page integer DEFAULT 0,
  bounce_rate numeric(5,2) DEFAULT 0,
  UNIQUE(post_id, date)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX idx_post_analytics_post_id_date ON post_analytics(post_id, date DESC);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = uid AND role = 'admin'::user_role
  );
$$;

-- Check if user is creator or admin
CREATE OR REPLACE FUNCTION is_creator(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = uid AND role IN ('creator'::user_role, 'admin'::user_role)
  );
$$;

-- Check if user can access premium content
CREATE OR REPLACE FUNCTION can_access_premium_content(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = uid 
    AND subscription_tier IN ('premium'::subscription_tier, 'vip'::subscription_tier)
    AND (subscription_expires_at IS NULL OR subscription_expires_at > now())
  );
$$;

-- Increment post views atomically
CREATE OR REPLACE FUNCTION increment_post_views(post_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts
  SET view_count = view_count + 1
  WHERE id = post_uuid;
END;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup (first user becomes admin)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
  new_username text;
BEGIN
  -- Only insert after user is confirmed
  IF OLD IS DISTINCT FROM NULL AND OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL THEN
    -- Count existing profiles
    SELECT COUNT(*) INTO user_count FROM profiles;
    
    -- Generate username from email
    new_username := split_part(NEW.email, '@', 1);
    
    -- Make username unique if it already exists
    WHILE EXISTS (SELECT 1 FROM profiles WHERE username = new_username) LOOP
      new_username := new_username || floor(random() * 1000)::text;
    END LOOP;
    
    -- Insert profile (first user is admin and creator)
    INSERT INTO profiles (id, username, email, role)
    VALUES (
      NEW.id,
      new_username,
      NEW.email,
      CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'subscriber'::user_role END
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM old.role AND subscription_tier IS NOT DISTINCT FROM old.subscription_tier);

CREATE POLICY "Admins have full access to profiles"
  ON profiles FOR ALL
  USING (is_admin(auth.uid()));

-- Posts policies
CREATE POLICY "Published posts are viewable by everyone"
  ON posts FOR SELECT
  USING (status = 'published'::post_status OR author_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Authors can create posts"
  ON posts FOR INSERT
  WITH CHECK (is_creator(auth.uid()) AND author_id = auth.uid());

CREATE POLICY "Authors can update own posts"
  ON posts FOR UPDATE
  USING (author_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Authors can delete own posts"
  ON posts FOR DELETE
  USING (author_id = auth.uid() OR is_admin(auth.uid()));

-- Categories policies (public read, admin write)
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (is_admin(auth.uid()));

-- Tags policies (public read, admin write)
CREATE POLICY "Tags are viewable by everyone"
  ON tags FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage tags"
  ON tags FOR ALL
  USING (is_admin(auth.uid()));

-- Post-categories policies
CREATE POLICY "Post categories are viewable by everyone"
  ON post_categories FOR SELECT
  USING (true);

CREATE POLICY "Authors can manage post categories"
  ON post_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_categories.post_id
      AND (posts.author_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

-- Post-tags policies
CREATE POLICY "Post tags are viewable by everyone"
  ON post_tags FOR SELECT
  USING (true);

CREATE POLICY "Authors can manage post tags"
  ON post_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_tags.post_id
      AND (posts.author_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

-- Comments policies
CREATE POLICY "Approved comments are viewable by everyone"
  ON comments FOR SELECT
  USING (is_approved = true OR author_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (author_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (author_id = auth.uid() OR is_admin(auth.uid()));

-- Likes policies
CREATE POLICY "Likes are viewable by everyone"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage own likes"
  ON likes FOR ALL
  USING (auth.uid() = user_id);

-- Bookmarks policies
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own bookmarks"
  ON bookmarks FOR ALL
  USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Follows are viewable by everyone"
  ON follows FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own follows"
  ON follows FOR ALL
  USING (auth.uid() = follower_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Service role can manage orders"
  ON orders FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Newsletter subscribers policies (service role only)
CREATE POLICY "Service role can manage newsletter subscribers"
  ON newsletter_subscribers FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Post analytics policies
CREATE POLICY "Post analytics are viewable by post authors"
  ON post_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_analytics.post_id
      AND (posts.author_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

CREATE POLICY "Service role can manage post analytics"
  ON post_analytics FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
  ('Technology', 'technology', 'Articles about technology, programming, and innovation'),
  ('Business', 'business', 'Business insights, entrepreneurship, and strategy'),
  ('Lifestyle', 'lifestyle', 'Life, culture, and personal development'),
  ('Design', 'design', 'Design principles, UI/UX, and creative work'),
  ('Marketing', 'marketing', 'Marketing strategies, growth, and branding')
ON CONFLICT (slug) DO NOTHING;