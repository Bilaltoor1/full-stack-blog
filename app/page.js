'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Download, 
  Eye, 
  Calendar, 
  Tag, 
  ArrowRight,
  Star,
  TrendingUp,
  Clock
} from 'lucide-react';
import Card, { CardContent } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function HomePage() {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // Fetch featured posts
      const featuredResponse = await fetch('/api/posts?featured=true&limit=4');
      const featuredData = await featuredResponse.json();
      
      // Fetch recent posts
      const recentResponse = await fetch('/api/posts?limit=8');
      const recentData = await recentResponse.json();
      
      // Fetch categories
      const categoriesResponse = await fetch('/api/categories');
      const categoriesData = await categoriesResponse.json();
      
      if (featuredData.success) setFeaturedPosts(featuredData.posts);
      if (recentData.success) setRecentPosts(recentData.posts);
      if (categoriesData.success) setCategories(categoriesData.categories);
      
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Free Digital Resources
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Download free software, games, mobile apps, and courses
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/category/pc-software"
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Browse Software
              </Link>
              <Link 
                href="/category/games-mods"
                className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Explore Games
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Browse Categories
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Discover resources in your favorite categories
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/category/${category.slug}`}
                className="group"
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {/* Category Header with Gradient */}
                  <div 
                    className="h-24 relative"
                    style={{ 
                      background: `linear-gradient(135deg, ${category.color}20, ${category.color}40)` 
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10 dark:to-white/10"></div>
                    <div 
                      className="absolute top-4 left-4 w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-lg"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.name.charAt(0)}
                    </div>
                  </div>
                  
                  {/* Category Content */}
                  <div className="p-6">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    
                    {/* Posts Count */}
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-xs font-medium px-2 py-1 rounded-full"
                        style={{ 
                          backgroundColor: `${category.color}20`,
                          color: category.color 
                        }}
                      >
                        {category.postCount || 0} posts
                      </span>
                      <div className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* View All Categories Link */}
          {categories.length > 8 && (
            <div className="text-center mt-8">
              <Link
                href="/categories"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View All Categories
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Star className="w-8 h-8 mr-3 text-yellow-500" />
                  Featured Resources
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Hand-picked premium content for you
                </p>
              </div>
              <Link 
                href="/featured"
                className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredPosts.map((post) => (
                <PostCard key={post._id} post={post} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Posts */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Clock className="w-8 h-8 mr-3 text-green-500" />
                Latest Releases
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Fresh content updated daily
              </p>
            </div>
            <Link 
              href="/latest"
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentPosts.slice(0, 8).map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join Our Community
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Get early access to new releases and exclusive content
          </p>
          <Link 
            href="/register"
            className="inline-flex items-center px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function PostCard({ post, featured = false }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isValidImageUrl = (url) => {
    if (!url || typeof url !== 'string' || url.trim() === '') return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Link href={`/post/${post.slug}`} className="group">
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:scale-105">
        <div className="relative">
          <div className="aspect-video relative bg-gray-200 dark:bg-gray-700">
            {isValidImageUrl(post.thumbnail) ? (
              <Image
                src={post.thumbnail}
                alt={post.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Download className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>
          
          {featured && (
            <div className="absolute top-2 left-2">
              <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </span>
            </div>
          )}
          
          <div 
            className="absolute top-2 right-2 px-2 py-1 rounded-full text-white text-xs font-medium"
            style={{ backgroundColor: post.category?.color || '#3B82F6' }}
          >
            {post.category?.name}
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h3>
          
          {post.excerpt && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {post.excerpt}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDate(post.publishedAt || post.createdAt)}
            </div>
            <div className="flex items-center">
              <Eye className="w-3 h-3 mr-1" />
              {post.views || 0}
            </div>
          </div>
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.tags.slice(0, 2).map((tag) => (
                <span 
                  key={tag}
                  className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                >
                  <Tag className="w-2 h-2 mr-1" />
                  {tag}
                </span>
              ))}
              {post.tags.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{post.tags.length - 2} more
                </span>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {post.downloadLinks?.length || 0} Downloads
            </span>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              Free
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
