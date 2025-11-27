import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { getPosts, getCategories } from '@/db/api';
import type { PostWithAuthor, Category } from '@/types/types';
import { Clock, Eye, TrendingUp, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Home() {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [postsData, categoriesData] = await Promise.all([getPosts(20), getCategories()]);
    setPosts(postsData);
    setCategories(categoriesData);
    setLoading(false);
  };

  const filteredPosts = selectedCategory
    ? posts.filter((post) => post.categories?.some((cat) => cat.slug === selectedCategory))
    : posts;

  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 xl:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Premium Blogging Platform
            </div>
            <h1 className="text-4xl xl:text-6xl font-bold tracking-tight">
              Discover Stories That
              <span className="block text-primary mt-2">Inspire and Inform</span>
            </h1>
            <p className="text-lg xl:text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of creators sharing their knowledge, experiences, and insights with a
              global audience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" onClick={() => navigate('/login')} className="text-base">
                Start Writing
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/explore')}
                className="text-base"
              >
                Explore Content
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-2 mb-8">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Trending Topics</h2>
        </div>

        <div className="flex flex-wrap gap-2 mb-12">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.slug ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.slug)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full bg-muted" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 bg-muted" />
                  <Skeleton className="h-4 w-full bg-muted" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/2 bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">No posts found. Be the first to write!</p>
            <Button className="mt-4" onClick={() => navigate('/login')}>
              Create Post
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                className="group overflow-hidden hover:shadow-elegant transition-smooth cursor-pointer"
                onClick={() => navigate(`/post/${post.slug}`)}
              >
                {post.cover_image && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                    />
                    {post.is_premium && (
                      <Badge className="absolute top-3 right-3 bg-secondary">Premium</Badge>
                    )}
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={post.author.avatar_url || undefined}
                        alt={post.author.username}
                      />
                      <AvatarFallback className="text-xs">
                        {post.author.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {post.author.full_name || post.author.username}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-smooth">
                    {post.title}
                  </CardTitle>
                  {post.excerpt && (
                    <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.reading_time} min read
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {post.view_count}
                    </div>
                    {post.published_at && (
                      <span>{formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="bg-muted/30 border-y py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl xl:text-4xl font-bold">Ready to Share Your Story?</h2>
            <p className="text-lg text-muted-foreground">
              Join our community of creators and start publishing your content today. Monetize your
              work and grow your audience.
            </p>
            <Button size="lg" onClick={() => navigate('/login')} className="text-base">
              Get Started for Free
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
