'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Download, 
  Eye, 
  Calendar, 
  Tag, 
  Share2,
  Heart,
  MessageCircle,
  Star,
  ExternalLink,
  Copy,
  Check,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function PostDetailPage() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/${slug}`);
      const data = await response.json();
      
      if (data.success) {
        setPost(data.post);
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Please login to comment');
      return;
    }
    
    if (!commentText.trim()) return;
    
    setSubmittingComment(true);
    
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: commentText,
          postId: post._id
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCommentText('');
        alert('Comment submitted for approval');
      } else {
        alert(data.message || 'Failed to submit comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'gdrive':
        return '🗂️';
      case 'mega':
        return '☁️';
      case 'mediafire':
        return '🔥';
      case 'dropbox':
        return '📦';
      case 'onedrive':
        return '💾';
      default:
        return '🔗';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Post Not Found
          </h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardContent className="p-0">
                {/* Post Header */}
                <div className="relative">
                  <div className="aspect-video relative bg-gray-200 dark:bg-gray-700">
                    {post.thumbnail && post.thumbnail.trim() && post.thumbnail !== '' ? (
                      <Image
                        src={post.thumbnail}
                        alt={post.title}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Download className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div 
                    className="absolute top-4 left-4 px-3 py-1 rounded-full text-white text-sm font-medium"
                    style={{ backgroundColor: post.category?.color || '#3B82F6' }}
                  >
                    {post.category?.name}
                  </div>
                  
                  {post.subCategory && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-black bg-opacity-50 text-white text-sm rounded-full">
                      {post.subCategory.name}
                    </div>
                  )}
                </div>

                {/* Post Meta */}
                <div className="p-6">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {post.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {post.author?.username}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(post.publishedAt || post.createdAt)}
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-2" />
                      {post.views} views
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {comments.length} comments
                    </div>
                  </div>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {post.tags.map((tag) => (
                        <span 
                          key={tag}
                          className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Content */}
                  <div 
                    className="prose prose-lg dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />

                  {/* Image Gallery */}
                  {post.imageGallery && post.imageGallery.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Screenshots
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {post.imageGallery.map((image, index) => (
                          <div key={index} className="aspect-video relative bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                            {image.url && image.url.trim() && image.url !== '' ? (
                              <Image
                                src={image.url}
                                alt={image.caption || `Screenshot ${index + 1}`}
                                fill
                                className="object-cover hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Download className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">Comments ({comments.length})</h3>
              </CardHeader>
              <CardContent>
                {/* Comment Form */}
                {isAuthenticated ? (
                  <form onSubmit={handleCommentSubmit} className="mb-6">
                    <div className="mb-4">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write your comment..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <Button
                      type="submit"
                      loading={submittingComment}
                      disabled={!commentText.trim() || submittingComment}
                    >
                      Post Comment
                    </Button>
                  </form>
                ) : (
                  <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Please login to leave a comment
                    </p>
                    <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                      Login Here
                    </Link>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment._id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-medium">
                            {comment.author?.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {comment.author?.username}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(comment.createdAt)}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 ml-11">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                  
                  {comments.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Download Links */}
            {post.downloadLinks && post.downloadLinks.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center">
                    <Download className="w-5 h-5 mr-2" />
                    Download Links
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {post.downloadLinks.map((link, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {link.title}
                          </h4>
                          <span className="text-lg">
                            {getPlatformIcon(link.platform)}
                          </span>
                        </div>
                        {link.size && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Size: {link.size}
                          </p>
                        )}
                        {link.version && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Version: {link.version}
                          </p>
                        )}
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Post Actions */}
            <Card className="mb-6">
              <CardContent>
                <div className="flex flex-col space-y-3">
                  <Button variant="outline" className="w-full">
                    <Heart className="w-4 h-4 mr-2" />
                    Like Post
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Post
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Post Info */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Post Information</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Category:</span>
                    <Link 
                      href={`/category/${post.category?.slug}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {post.category?.name}
                    </Link>
                  </div>
                  {post.subCategory && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Subcategory:</span>
                      <span className="text-gray-900 dark:text-white">
                        {post.subCategory.name}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Published:</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDate(post.publishedAt || post.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Views:</span>
                    <span className="text-gray-900 dark:text-white">{post.views}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Downloads:</span>
                    <span className="text-gray-900 dark:text-white">
                      {post.downloadLinks?.length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
