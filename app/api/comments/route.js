import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Comment from '@/models/Comment';
import Post from '@/models/Post';
import { requireAuth, requireAdmin } from '@/lib/middleware';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post');
    const status = searchParams.get('status') || 'approved';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    
    const skip = (page - 1) * limit;
    
    const filter = { status };
    if (postId) {
      filter.post = postId;
      filter.parentComment = null; // Only root comments
    }
    
    const comments = await Comment.find(filter)
      .populate('author', 'username avatar')
      .populate('post', 'title slug')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'username avatar'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Comment.countDocuments(filter);
    
    return NextResponse.json({
      success: true,
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Comments fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const { content, postId, parentCommentId } = await request.json();

    if (!content || !postId) {
      return NextResponse.json(
        { success: false, message: 'Content and post ID are required' },
        { status: 400 }
      );
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      );
    }

    // Check parent comment if provided
    let parentComment = null;
    if (parentCommentId) {
      parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return NextResponse.json(
          { success: false, message: 'Parent comment not found' },
          { status: 404 }
        );
      }
    }

    const comment = new Comment({
      content,
      author: authResult.user._id,
      post: postId,
      parentComment: parentCommentId || null
    });

    await comment.save();

    // If it's a reply, add it to parent's replies array
    if (parentComment) {
      parentComment.replies.push(comment._id);
      await parentComment.save();
    }

    await comment.populate([
      { path: 'author', select: 'username avatar' },
      { path: 'post', select: 'title slug' }
    ]);

    return NextResponse.json({
      success: true,
      message: 'Comment submitted for approval',
      comment
    });

  } catch (error) {
    console.error('Comment creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const { commentId, status } = await request.json();

    if (!commentId || !status) {
      return NextResponse.json(
        { success: false, message: 'Comment ID and status are required' },
        { status: 400 }
      );
    }

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { 
        status,
        approvedAt: status === 'approved' ? new Date() : null,
        approvedBy: status === 'approved' ? authResult.user._id : null
      },
      { new: true }
    ).populate('author', 'username avatar');

    if (!comment) {
      return NextResponse.json(
        { success: false, message: 'Comment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Comment ${status} successfully`,
      comment
    });

  } catch (error) {
    console.error('Comment update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
