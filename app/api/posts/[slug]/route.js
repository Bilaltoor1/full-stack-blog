import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';
import Comment from '@/models/Comment';
import { requireAuth } from '@/lib/middleware';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    
    const post = await Post.findOne({ slug, status: 'published' })
      .populate('category', 'name slug color')
      .populate('subCategory', 'name slug')
      .populate('author', 'username avatar');
    
    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      );
    }

    // Increment views
    await Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } });

    // Get approved comments
    const comments = await Comment.find({ 
      post: post._id, 
      status: 'approved',
      parentComment: null 
    })
      .populate('author', 'username avatar')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'username avatar'
        }
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      post: {
        ...post.toObject(),
        views: post.views + 1
      },
      comments
    });

  } catch (error) {
    console.error('Post fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    const updateData = await request.json();
    
    const post = await Post.findOne({ slug });
    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user owns the post or is admin
    if (post.author.toString() !== authResult.user._id.toString() && authResult.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this post' },
        { status: 403 }
      );
    }

    // Update publishedAt if status changes to published
    if (updateData.status === 'published' && post.status !== 'published') {
      updateData.publishedAt = new Date();
    }

    const updatedPost = await Post.findByIdAndUpdate(
      post._id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'category', select: 'name slug color' },
      { path: 'subCategory', select: 'name slug' },
      { path: 'author', select: 'username avatar' }
    ]);

    return NextResponse.json({
      success: true,
      message: 'Post updated successfully',
      post: updatedPost
    });

  } catch (error) {
    console.error('Post update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    
    const post = await Post.findOne({ slug });
    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user owns the post or is admin
    if (post.author.toString() !== authResult.user._id.toString() && authResult.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this post' },
        { status: 403 }
      );
    }

    // Delete associated comments
    await Comment.deleteMany({ post: post._id });

    // Delete the post
    await Post.findByIdAndDelete(post._id);

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Post deletion error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
