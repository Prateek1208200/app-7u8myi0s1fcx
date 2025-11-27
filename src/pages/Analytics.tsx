import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { getPostsByAuthor, getPostAnalytics } from '@/db/api';
import type { PostWithAuthor, PostAnalytics } from '@/types/types';
import { Eye, Heart, MessageCircle, TrendingUp, Users, FileText, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AnalyticsSummary {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalPosts: number;
  avgEngagement: number;
}

export default function Analytics() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [analytics, setAnalytics] = useState<PostAnalytics[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalPosts: 0,
    avgEngagement: 0,
  });

  useEffect(() => {
    if (!user || !profile || (profile.role !== 'creator' && profile.role !== 'admin')) {
      navigate('/');
      return;
    }
    loadAnalytics();
  }, [user, profile, navigate]);

  const loadAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    const [postsData, analyticsData] = await Promise.all([
      getPostsByAuthor(user.id),
      getPostAnalytics(user.id),
    ]);

    setPosts(postsData);
    setAnalytics(analyticsData);

    const totalViews = analyticsData.reduce((sum, a) => sum + a.view_count, 0);
    const totalLikes = analyticsData.reduce((sum, a) => sum + a.like_count, 0);
    const totalComments = analyticsData.reduce((sum, a) => sum + a.comment_count, 0);
    const totalPosts = postsData.length;
    const avgEngagement = totalPosts > 0 ? (totalLikes + totalComments) / totalPosts : 0;

    setSummary({
      totalViews,
      totalLikes,
      totalComments,
      totalPosts,
      avgEngagement,
    });

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-12 w-64 mb-8 bg-muted" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Track your content performance and engagement</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalLikes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Reader appreciation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalComments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Community engagement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              Avg {summary.avgEngagement.toFixed(1)} engagement
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Post Performance</CardTitle>
          <CardDescription>Detailed analytics for each post</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No posts yet. Start creating content to see analytics!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.map((item) => {
                const post = posts.find((p) => p.id === item.post_id);
                if (!post) return null;

                return (
                  <div
                    key={item.post_id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-smooth cursor-pointer"
                    onClick={() => navigate(`/post/${post.slug}`)}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{post.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Published {new Date(post.published_at!).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span>{item.view_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-muted-foreground" />
                        <span>{item.like_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <span>{item.comment_count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
