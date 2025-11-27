import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { createPost, getCategories } from '@/db/api';
import type { Category } from '@/types/types';
import { toast } from 'sonner';
import { Loader2, Save, Eye } from 'lucide-react';

export default function CreatePost() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    cover_image: '',
    status: 'draft' as 'draft' | 'published',
    is_premium: false,
    seo_title: '',
    seo_description: '',
    reading_time: 5,
  });

  useEffect(() => {
    if (!user || !profile || (profile.role !== 'creator' && profile.role !== 'admin')) {
      toast.error('You need creator access to create posts');
      navigate('/');
      return;
    }
    loadCategories();
  }, [user, profile, navigate]);

  const loadCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
      seo_title: title,
    }));
  };

  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({
      ...prev,
      content,
      reading_time: estimateReadingTime(content),
    }));
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('Please enter content');
      return;
    }

    setLoading(true);
    try {
      const postData = {
        ...formData,
        status,
        author_id: user!.id,
        published_at: status === 'published' ? new Date().toISOString() : null,
      };

      const result = await createPost(postData);
      if (result) {
        toast.success(status === 'published' ? 'Post published successfully!' : 'Draft saved!');
        navigate(`/post/${result.slug}`);
      } else {
        toast.error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('An error occurred while creating the post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Post</h1>
        <p className="text-muted-foreground">Share your story with the world</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
              <CardDescription>Write your article content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter your post title..."
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  placeholder="post-url-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Brief summary of your post..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content * (Markdown supported)</Label>
                <Textarea
                  id="content"
                  placeholder="Write your post content here... You can use Markdown formatting."
                  value={formData.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Estimated reading time: {formData.reading_time} min
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Optimize your post for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo_title">SEO Title</Label>
                <Input
                  id="seo_title"
                  placeholder="SEO optimized title"
                  value={formData.seo_title}
                  onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo_description">SEO Description</Label>
                <Textarea
                  id="seo_description"
                  placeholder="Meta description for search engines"
                  value={formData.seo_description}
                  onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cover_image">Cover Image URL</Label>
                <Input
                  id="cover_image"
                  placeholder="https://example.com/image.jpg"
                  value={formData.cover_image}
                  onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_premium">Premium Content</Label>
                <Switch
                  id="is_premium"
                  checked={formData.is_premium}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_premium: checked })}
                />
              </div>

              <div className="pt-4 space-y-2">
                <Button
                  onClick={() => handleSubmit('published')}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Publish Now
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => handleSubmit('draft')}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save as Draft
                </Button>

                <Button
                  onClick={() => navigate(-1)}
                  variant="ghost"
                  className="w-full"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Writing Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Use clear, engaging headlines</p>
              <p>• Break content into sections</p>
              <p>• Add relevant images</p>
              <p>• Optimize for SEO</p>
              <p>• Proofread before publishing</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
