import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import {
  getPostBySlug,
  incrementPostViews,
  toggleLike,
  toggleBookmark,
  isPostLiked,
  isPostBookmarked,
  getLikeCount,
  getCommentsByPost,
  createComment,
  deleteComment,
} from '@/db/api';
import type { PostWithAuthor, CommentWithAuthor } from '@/types/types';
import { Heart, Bookmark, Share2, Clock, Eye, MessageCircle, Send, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function PostView() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [post, setPost] = useState<PostWithAuthor | null>(null);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (slug) {
      loadPost();
    }
  }, [slug]);

  const loadPost = async () => {
    if (!slug) return;

    setLoading(true);
    const postData = await getPostBySlug(slug);

    if (!postData) {
      toast.error('Post not found');
      navigate('/');
      return;
    }

    setPost(postData);
    await incrementPostViews(postData.id);

    const [commentsData, likesCount, isLiked, isBookmarked] = await Promise.all([
      getCommentsByPost(postData.id),
      getLikeCount(postData.id),
      user ? isPostLiked(user.id, postData.id) : Promise.resolve(false),
      user ? isPostBookmarked(user.id, postData.id) : Promise.resolve(false),
    ]);

    setComments(commentsData);
    setLikeCount(likesCount);
    setLiked(isLiked);
    setBookmarked(isBookmarked);
    setLoading(false);
  };

  const handleLike = async () => {
    if (!user || !post) {
      toast.error('Please sign in to like posts');
      navigate('/login');
      return;
    }

    const success = await toggleLike(user.id, post.id);
    if (success) {
      setLiked(!liked);
      setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    }
  };

  const handleBookmark = async () => {
    if (!user || !post) {
      toast.error('Please sign in to bookmark posts');
      navigate('/login');
      return;
    }

    const success = await toggleBookmark(user.id, post.id);
    if (success) {
      setBookmarked(!bookmarked);
      toast.success(bookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt || '',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !post) {
      toast.error('Please sign in to comment');
      navigate('/login');
      return;
    }

    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setSubmittingComment(true);
    const result = await createComment({
      post_id: post.id,
      author_id: user.id,
      content: commentText,
      parent_id: null,
    });

    if (result) {
      toast.success('Comment posted!');
      setCommentText('');
      loadPost();
    } else {
      toast.error('Failed to post comment');
    }
    setSubmittingComment(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    const success = await deleteComment(commentId);
    if (success) {
      toast.success('Comment deleted');
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } else {
      toast.error('Failed to delete comment');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <Skeleton className="h-12 w-3/4 mb-4 bg-muted" />
        <Skeleton className="h-6 w-1/2 mb-8 bg-muted" />
        <Skeleton className="h-96 w-full bg-muted" />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      <div className="mb-8">
        {post.is_premium && (
          <Badge className="mb-4 bg-secondary">Premium Content</Badge>
        )}
        <h1 className="text-4xl xl:text-5xl font-bold mb-4">{post.title}</h1>
        {post.excerpt && (
          <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>
        )}

        <div className="flex items-center gap-4 mb-6">
          <Link to={`/profile/${post.author.username}`} className="flex items-center gap-3 hover:opacity-80 transition-smooth">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.author.avatar_url || undefined} alt={post.author.username} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {post.author.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.author.full_name || post.author.username}</p>
              <p className="text-sm text-muted-foreground">@{post.author.username}</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {post.reading_time} min read
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {post.view_count} views
          </div>
          {post.published_at && (
            <span>{formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={liked ? 'default' : 'outline'}
            size="sm"
            onClick={handleLike}
            className="gap-2"
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
            {likeCount}
          </Button>
          <Button
            variant={bookmarked ? 'default' : 'outline'}
            size="sm"
            onClick={handleBookmark}
          >
            <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {post.cover_image && (
        <div className="mb-8 rounded-lg overflow-hidden">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      <div className="prose prose-lg max-w-none mb-12">
        <div className="whitespace-pre-wrap">{post.content}</div>
      </div>

      <Separator className="my-12" />

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          Comments ({comments.length})
        </h2>

        {user ? (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.username} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {profile?.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmitComment}
                      disabled={submittingComment || !commentText.trim()}
                      size="sm"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Post Comment
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">Sign in to join the conversation</p>
              <Button onClick={() => navigate('/login')}>Sign In</Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={comment.author.avatar_url || undefined}
                      alt={comment.author.username}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {comment.author.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">
                          {comment.author.full_name || comment.author.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {user && (comment.author_id === user.id || profile?.role === 'admin') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {comments.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </section>
    </article>
  );
}
