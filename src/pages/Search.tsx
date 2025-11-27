import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { searchPosts } from '@/db/api';
import type { PostWithAuthor } from '@/types/types';
import { Search as SearchIcon, Clock, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, []);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    const data = await searchPosts(searchQuery);
    setResults(data);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearchParams({ q: query });
    performSearch(query);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Search</h1>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="search"
              placeholder="Search articles, authors, topics..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              <SearchIcon className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-6 w-3/4 mb-2 bg-muted" />
                  <Skeleton className="h-4 w-full mb-4 bg-muted" />
                  <Skeleton className="h-4 w-1/2 bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && searched && (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground">
                Found {results.length} {results.length === 1 ? 'result' : 'results'} for "{query}"
              </p>
            </div>

            {results.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <SearchIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try different keywords or browse our categories
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {results.map((post) => (
                  <Card key={post.id} className="hover:shadow-md transition-smooth">
                    <CardContent className="pt-6">
                      <Link to={`/post/${post.slug}`} className="block group">
                        <div className="flex gap-4">
                          {post.cover_image && (
                            <div className="w-32 h-32 shrink-0 rounded-lg overflow-hidden">
                              <img
                                src={post.cover_image}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {post.is_premium && (
                                <Badge className="bg-secondary">Premium</Badge>
                              )}
                            </div>
                            <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-smooth">
                              {post.title}
                            </h2>
                            {post.excerpt && (
                              <p className="text-muted-foreground mb-3 line-clamp-2">
                                {post.excerpt}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={post.author.avatar_url || undefined}
                                    alt={post.author.username}
                                  />
                                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                    {post.author.username.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{post.author.full_name || post.author.username}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {post.reading_time} min
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {post.view_count}
                              </div>
                              {post.published_at && (
                                <span>
                                  {formatDistanceToNow(new Date(post.published_at), {
                                    addSuffix: true,
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {!searched && (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <SearchIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Start Searching</h3>
              <p className="text-muted-foreground">
                Enter keywords to find articles, authors, and topics
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
