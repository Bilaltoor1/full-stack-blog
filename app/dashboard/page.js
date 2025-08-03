'use client';

import { useState, useEffect } from 'react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  FileText, 
  Users, 
  MessageSquare, 
  Eye,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome to your Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Here's an overview of your blog's performance and activity.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Posts"
            value={stats?.stats?.posts?.total || 0}
            subtitle={`${stats?.stats?.posts?.published || 0} published`}
            icon={FileText}
            color="blue"
          />
          <StatCard
            title="Total Users"
            value={stats?.stats?.users?.total || 0}
            subtitle={`${stats?.stats?.users?.active || 0} active`}
            icon={Users}
            color="green"
          />
          <StatCard
            title="Comments"
            value={stats?.stats?.comments?.total || 0}
            subtitle={`${stats?.stats?.comments?.pending || 0} pending`}
            icon={MessageSquare}
            color="yellow"
          />
          <StatCard
            title="Total Views"
            value={stats?.stats?.totalViews || 0}
            subtitle="All time"
            icon={Eye}
            color="purple"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Posts */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Recent Posts
              </h3>
            </CardHeader>
            <CardContent>
              {stats?.recentPosts?.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentPosts.map((post) => (
                    <div key={post._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                          {post.title}
                        </h4>
                        <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            post.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'
                          }`} />
                          {post.status} • {post.views} views
                        </div>
                      </div>
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: post.category?.color || '#3B82F6' }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No posts found
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Comments */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
                Recent Comments
              </h3>
            </CardHeader>
            <CardContent>
              {stats?.recentComments?.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentComments.map((comment) => (
                    <div key={comment._id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {comment.author?.username}
                        </span>
                        <div className="flex items-center">
                          {comment.status === 'approved' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                          )}
                          <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                            {comment.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {comment.content}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        on "{comment.post?.title}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No comments found
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Popular Posts and Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Posts */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                Popular Posts
              </h3>
            </CardHeader>
            <CardContent>
              {stats?.popularPosts?.length > 0 ? (
                <div className="space-y-3">
                  {stats.popularPosts.map((post, index) => (
                    <div key={post._id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                            {post.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {post.views} views
                          </p>
                        </div>
                      </div>
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: post.category?.color || '#3B82F6' }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No popular posts yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Posts by Category */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Posts by Category</h3>
            </CardHeader>
            <CardContent>
              {stats?.postsByCategory?.length > 0 ? (
                <div className="space-y-3">
                  {stats.postsByCategory.map((category) => (
                    <div key={category._id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {category.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {category.count} posts
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No categories found
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
