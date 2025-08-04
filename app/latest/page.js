'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Eye, User, Tag, Clock } from 'lucide-react';
import { SafeImage } from '@/components/SafeImage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function LatestPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    fetchLatestPosts();
  }, []);

  const fetchLatestPosts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts?page=${pageNum}&limit=12&sort=createdAt`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (pageNum === 1) {
          setPosts(data.posts);
        } else {
          setPosts(prev => [...prev, ...data.posts]);
        }
        
        setTotalPosts(data.pagination.total);
        setHasMore(data.pagination.page < data.pagination.pages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching latest posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchLatestPosts(page + 1);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Latest Posts
            </h1>
            <p className="text-xl opacity-90 mb-6">
              Stay updated with our newest content and resources
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
<Clock className="w-5 h-5" />
                <span>Updated Daily</span>
              </div>
              <div className="flex items-center gap-2">
<Eye className="w-5 h-5" />
                <span>{totalPosts} Total Posts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && page === 1 ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="xl" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {posts.map((post) => (
                  <article
                    key={post._id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group overflow-hidden"
                  >
                    {/* Featured Image */}
                    <div className="aspect-video relative overflow-hidden">
                      <SafeImage
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Category Badge */}
                      {post.category && (
                        <div 
                          className="absolute top-3 left-3 px-2 py-1 rounded-full text-white text-xs font-medium"
                          style={{ backgroundColor: post.category.color }}
                        >
                          {post.category.name}
                        </div>
                      )}
                      
                      {/* Time Badge */}
                      <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                        {formatTimeAgo(post.createdAt)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="mb-2">
                        <Link 
                          href={`/posts/${post.slug}`}
                          className="block"
                        >
                          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                            {post.title}
                          </h3>
                        </Link>
                        
                        {post.excerpt && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                            {post.excerpt}
                          </p>
                        )}
                      </div>

                      {/* Meta Information */}
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
<User className="w-3 h-3" />
                          <span>{post.author?.username}</span>
                        </div>
                        <div className="flex items-center gap-1">
<Eye className="w-3 h-3" />
                          <span>{post.views || 0}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {post.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{post.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Read More */}
                      <Link 
                        href={`/posts/${post.slug}`}
                        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        Read More
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-12">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        Loading...
                      </div>
                    ) : (
                      'Load More Posts'
                    )}
                  </button>
                </div>
              )}

              {/* No More Posts */}
              {!hasMore && posts.length > 0 && (
                <div className="text-center mt-12">
                  <p className="text-gray-600 dark:text-gray-400">
                    You've reached the end of our latest posts!
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    ← Back to Home
                  </Link>
                </div>
              )}

              {/* Empty State */}
              {!loading && posts.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
<Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No posts found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    There are no posts available at the moment.
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Explore Homepage
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
