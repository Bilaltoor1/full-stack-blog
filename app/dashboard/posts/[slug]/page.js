'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Edit, Trash2, Eye, Calendar, User, Tag, MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { SafeImage } from '@/components/SafeImage';

export default function PostDetailPage({ params }) {
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        setLoading(true);
        
        // Fetch post details
        const postResponse = await fetch(`/api/posts/${params.slug}`, {
          credentials: 'include'
        });
        
        if (postResponse.ok) {
          const postData = await postResponse.json();
          setPost(postData.post);
          
          // Fetch comments for this post
          const commentsResponse = await fetch(`/api/comments?post=${postData.post._id}&admin=true`, {
            credentials: 'include'
          });
          
          if (commentsResponse.ok) {
            const commentsData = await commentsResponse.json();
            setComments(commentsData.comments || []);
          }
        } else {
          toast.error('Failed to fetch post details');
          router.push('/dashboard/posts');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        toast.error('Error fetching post details');
        router.push('/dashboard/posts');
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchPostAndComments();
    }
  }, [params.slug, router]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/posts/${params.slug}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Post deleted successfully');
        router.push('/dashboard/posts');
      } else {
        toast.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Error deleting post');
    } finally {
      setDeleting(false);
    }
  };

  const updateCommentStatus = async (commentId, status) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success(`Comment ${status} successfully`);
        // Update the comment in the local state
        setComments(comments.map(comment =>
          comment._id === commentId ? { ...comment, status } : comment
        ));
      } else {
        toast.error(`Failed to ${status} comment`);
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Error updating comment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'draft': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'archived': return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getCommentStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'rejected': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Post not found
          </h3>
          <Link
            href="/dashboard/posts"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to posts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/dashboard/posts"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
<ArrowLeft className="w-4 h-4" />
            Back to Posts
          </Link>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                {post.status}
              </span>
              <span className="flex items-center gap-1">
<Eye className="w-4 h-4" />
                {post.views || 0} views
              </span>
              <span className="flex items-center gap-1">
<MessageSquare className="w-4 h-4" />
                {comments.length} comments
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link
              href={`/posts/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
<Eye className="w-4 h-4" />
              View Live
            </Link>
            <Link
              href={`/dashboard/posts/edit/${post.slug}`}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
<Edit className="w-4 h-4" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
<Trash2 className="w-4 h-4" />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Featured Image */}
          {post.featuredImage && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Featured Image
              </h3>
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <SafeImage
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Content
            </h3>
            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Excerpt */}
          {post.excerpt && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Excerpt
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {post.excerpt}
              </p>
            </div>
          )}

          {/* Comments */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Comments ({comments.length})
            </h3>
            
            {comments.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No comments yet
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map(comment => (
                  <div
                    key={comment._id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {comment.author?.username || 'Anonymous'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCommentStatusColor(comment.status)}`}>
                          {comment.status}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {comment.content}
                    </p>
                    
                    {comment.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateCommentStatus(comment._id, 'approved')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateCommentStatus(comment._id, 'rejected')}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Post Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Post Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Author
                </label>
                <div className="flex items-center gap-2 mt-1">
<User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900 dark:text-white">
                    {post.author?.username || 'Unknown'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Category
                </label>
                <div className="flex items-center gap-2 mt-1">
<Tag className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900 dark:text-white">
                    {post.category?.name || 'Uncategorized'}
                  </span>
                </div>
              </div>

              {post.subCategory && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Subcategory
                  </label>
                  <div className="flex items-center gap-2 mt-1">
<Tag className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900 dark:text-white">
                      {post.subCategory.name}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Created
                </label>
                <div className="flex items-center gap-2 mt-1">
<Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900 dark:text-white text-sm">
                    {formatDate(post.createdAt)}
                  </span>
                </div>
              </div>

              {post.publishedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Published
                  </label>
                  <div className="flex items-center gap-2 mt-1">
<Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900 dark:text-white text-sm">
                      {formatDate(post.publishedAt)}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Last Updated
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <FiCalendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900 dark:text-white text-sm">
                    {formatDate(post.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Information */}
          {(post.metaTitle || post.metaDescription || post.tags?.length > 0) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                SEO Information
              </h3>
              
              <div className="space-y-4">
                {post.metaTitle && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Meta Title
                    </label>
                    <p className="text-gray-900 dark:text-white text-sm mt-1">
                      {post.metaTitle}
                    </p>
                  </div>
                )}

                {post.metaDescription && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Meta Description
                    </label>
                    <p className="text-gray-900 dark:text-white text-sm mt-1">
                      {post.metaDescription}
                    </p>
                  </div>
                )}

                {post.tags?.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
