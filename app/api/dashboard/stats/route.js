import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';
import User from '@/models/User';
import Comment from '@/models/Comment';
import Category from '@/models/Category';
import { requireAdmin } from '@/lib/middleware';

export async function GET(request) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get statistics
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalUsers,
      activeUsers,
      totalComments,
      pendingComments,
      approvedComments,
      totalCategories,
      totalViews
    ] = await Promise.all([
      Post.countDocuments(),
      Post.countDocuments({ status: 'published' }),
      Post.countDocuments({ status: 'draft' }),
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Comment.countDocuments(),
      Comment.countDocuments({ status: 'pending' }),
      Comment.countDocuments({ status: 'approved' }),
      Category.countDocuments({ isActive: true }),
      Post.aggregate([
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ]).then(result => result[0]?.totalViews || 0)
    ]);

    // Get recent posts
    const recentPosts = await Post.find()
      .populate('category', 'name color')
      .populate('author', 'username')
      .select('title slug status views createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent comments
    const recentComments = await Comment.find()
      .populate('author', 'username')
      .populate('post', 'title slug')
      .select('content status createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get popular posts
    const popularPosts = await Post.find({ status: 'published' })
      .populate('category', 'name color')
      .select('title slug views')
      .sort({ views: -1 })
      .limit(5);

    // Get posts by category
    const postsByCategory = await Post.aggregate([
      { $match: { status: 'published' } },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$category',
          name: { $first: '$categoryInfo.name' },
          color: { $first: '$categoryInfo.color' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        posts: {
          total: totalPosts,
          published: publishedPosts,
          draft: draftPosts
        },
        users: {
          total: totalUsers,
          active: activeUsers
        },
        comments: {
          total: totalComments,
          pending: pendingComments,
          approved: approvedComments
        },
        categories: totalCategories,
        totalViews
      },
      recentPosts,
      recentComments,
      popularPosts,
      postsByCategory
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
