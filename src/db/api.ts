import { supabase } from './supabase';
import type {
  Profile,
  Post,
  PostWithAuthor,
  Category,
  Tag,
  Comment,
  CommentWithAuthor,
  Order,
  OrderItem,
  ProfileWithStats,
} from '@/types/types';

// ============================================================================
// PROFILES
// ============================================================================

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}

export async function getProfileByUsername(username: string): Promise<ProfileWithStats | null> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (error || !profile) {
    console.error('Error fetching profile:', error);
    return null;
  }

  const [postCount, followerCount, followingCount] = await Promise.all([
    getPostCountByAuthor(profile.id),
    getFollowerCount(profile.id),
    getFollowingCount(profile.id),
  ]);

  return {
    ...profile,
    post_count: postCount,
    follower_count: followerCount,
    following_count: followingCount,
  };
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }
  return data;
}

export async function getAllProfiles(limit = 50): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

// ============================================================================
// POSTS
// ============================================================================

export async function getPosts(
  limit = 20,
  offset = 0,
  status: 'published' | 'all' = 'published'
): Promise<PostWithAuthor[]> {
  let query = supabase
    .from('posts')
    .select(`
      *,
      author:profiles(*)
    `)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status === 'published') {
    query = query.eq('status', 'published');
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function getPostBySlug(slug: string): Promise<PostWithAuthor | null> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles(*)
    `)
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Error fetching post:', error);
    return null;
  }
  return data;
}

export async function getPostById(id: string): Promise<PostWithAuthor | null> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles(*)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching post:', error);
    return null;
  }
  return data;
}

export async function getPostsByAuthor(authorId: string, limit = 20): Promise<PostWithAuthor[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles(*)
    `)
    .eq('author_id', authorId)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching posts by author:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function getPostsByCategory(categorySlug: string, limit = 20): Promise<PostWithAuthor[]> {
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .maybeSingle();

  if (!category) return [];

  const { data: postCategories } = await supabase
    .from('post_categories')
    .select('post_id')
    .eq('category_id', category.id);

  if (!postCategories || postCategories.length === 0) return [];

  const postIds = postCategories.map((pc) => pc.post_id);

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles(*)
    `)
    .in('id', postIds)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching posts by category:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function searchPosts(query: string, limit = 20): Promise<PostWithAuthor[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles(*)
    `)
    .eq('status', 'published')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error searching posts:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function createPost(post: Partial<Post>): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .insert(post)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating post:', error);
    return null;
  }
  return data;
}

export async function updatePost(postId: string, updates: Partial<Post>): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', postId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating post:', error);
    return null;
  }
  return data;
}

export async function deletePost(postId: string): Promise<boolean> {
  const { error } = await supabase.from('posts').delete().eq('id', postId);

  if (error) {
    console.error('Error deleting post:', error);
    return false;
  }
  return true;
}

export async function incrementPostViews(postId: string): Promise<void> {
  await supabase.rpc('increment_post_views', { post_uuid: postId });
}

export async function getPostCountByAuthor(authorId: string): Promise<number> {
  const { count, error } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', authorId)
    .eq('status', 'published');

  if (error) {
    console.error('Error counting posts:', error);
    return 0;
  }
  return count || 0;
}

// ============================================================================
// CATEGORIES & TAGS
// ============================================================================

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function getTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function createCategory(category: Partial<Category>): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating category:', error);
    return null;
  }
  return data;
}

export async function createTag(tag: Partial<Tag>): Promise<Tag | null> {
  const { data, error } = await supabase
    .from('tags')
    .insert(tag)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating tag:', error);
    return null;
  }
  return data;
}

// ============================================================================
// COMMENTS
// ============================================================================

export async function getCommentsByPost(postId: string): Promise<CommentWithAuthor[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles(*)
    `)
    .eq('post_id', postId)
    .eq('is_approved', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function createComment(comment: Partial<Comment>): Promise<Comment | null> {
  const { data, error } = await supabase
    .from('comments')
    .insert(comment)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating comment:', error);
    return null;
  }
  return data;
}

export async function deleteComment(commentId: string): Promise<boolean> {
  const { error } = await supabase.from('comments').delete().eq('id', commentId);

  if (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
  return true;
}

// ============================================================================
// LIKES & BOOKMARKS
// ============================================================================

export async function toggleLike(userId: string, postId: string): Promise<boolean> {
  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('likes').delete().eq('id', existing.id);
    return !error;
  }

  const { error } = await supabase.from('likes').insert({ user_id: userId, post_id: postId });
  return !error;
}

export async function toggleBookmark(userId: string, postId: string): Promise<boolean> {
  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('bookmarks').delete().eq('id', existing.id);
    return !error;
  }

  const { error } = await supabase.from('bookmarks').insert({ user_id: userId, post_id: postId });
  return !error;
}

export async function getBookmarkedPosts(userId: string, limit = 20): Promise<PostWithAuthor[]> {
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('post_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!bookmarks || bookmarks.length === 0) return [];

  const postIds = bookmarks.map((b) => b.post_id);

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles(*)
    `)
    .in('id', postIds)
    .eq('status', 'published');

  if (error) {
    console.error('Error fetching bookmarked posts:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function getLikeCount(postId: string): Promise<number> {
  const { count, error } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  if (error) {
    console.error('Error counting likes:', error);
    return 0;
  }
  return count || 0;
}

export async function isPostLiked(userId: string, postId: string): Promise<boolean> {
  const { data } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .maybeSingle();

  return !!data;
}

export async function isPostBookmarked(userId: string, postId: string): Promise<boolean> {
  const { data } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .maybeSingle();

  return !!data;
}

// ============================================================================
// FOLLOWS
// ============================================================================

export async function toggleFollow(followerId: string, followingId: string): Promise<boolean> {
  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('follows').delete().eq('id', existing.id);
    return !error;
  }

  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: followerId, following_id: followingId });
  return !error;
}

export async function getFollowerCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId);

  if (error) {
    console.error('Error counting followers:', error);
    return 0;
  }
  return count || 0;
}

export async function getFollowingCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId);

  if (error) {
    console.error('Error counting following:', error);
    return 0;
  }
  return count || 0;
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const { data } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();

  return !!data;
}

// ============================================================================
// ORDERS
// ============================================================================

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function getOrderBySessionId(sessionId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_session_id', sessionId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }
  return data;
}
