'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Check, X, Eye, Clock, User, MessageSquare, FileX } from 'lucide-react';

export default function CommentsPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchComments();
  }, [filter]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/comments?status=${filter === 'all' ? '' : filter}&admin=true`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      } else {
        toast.error('Failed to fetch comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Error fetching comments');
    } finally {
      setLoading(false);
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
        fetchComments(); // Refresh the list
      } else {
        toast.error(`Failed to ${status} comment`);
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Error updating comment');
    }
  };

  const deleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Comment deleted successfully');
        fetchComments();
      } else {
        toast.error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Error deleting comment');
    }
  };

  const filteredComments = comments.filter(comment =>
    comment.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.author?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.post?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
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
      month: 'short',
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
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Comment Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review and moderate user comments
        </p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search comments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <div className="text-center py-12">
<MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No comments found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'all' ? 'No comments available.' : `No ${filter} comments found.`}
            </p>
          </div>
        ) : (
          filteredComments.map(comment => (
            <div
              key={comment._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Comment Content */}
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {comment.author?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {comment.author?.username || 'Anonymous'}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(comment.status)}`}>
                          {comment.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        On: <a 
                          href={`/posts/${comment.post?.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {comment.post?.title || 'Unknown Post'}
                        </a>
                      </p>
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-3">
                        <p className="text-gray-900 dark:text-gray-100">
                          {comment.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
<Clock className="w-4 h-4" />
                          {formatDate(comment.createdAt)}
                        </span>
                        {comment.author?.email && (
                          <span className="flex items-center gap-1">
<User className="w-4 h-4" />
                            {comment.author.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2">
                  {comment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateCommentStatus(comment._id, 'approved')}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
<Check className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => updateCommentStatus(comment._id, 'rejected')}
                        className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
<X className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                  
                  {comment.status === 'approved' && (
                    <button
                      onClick={() => updateCommentStatus(comment._id, 'rejected')}
                      className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                      Reject
                    </button>
                  )}

                  {comment.status === 'rejected' && (
                    <button
                      onClick={() => updateCommentStatus(comment._id, 'approved')}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FiCheck className="w-4 h-4" />
                      Approve
                    </button>
                  )}

                  <button
                    onClick={() => deleteComment(comment._id)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <FileX className="w-4 h-4" />
                    Delete
                  </button>

                  <a
                    href={`/posts/${comment.post?.slug}#comment-${comment._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
<Eye className="w-4 h-4" />
                    View
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {comments.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Comments</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {comments.filter(c => c.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Pending</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {comments.filter(c => c.status === 'approved').length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Approved</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {comments.filter(c => c.status === 'rejected').length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Rejected</div>
        </div>
      </div>
    </div>
  );
}
