import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Comment from '@/models/Comment';
import { requireAuth } from '@/lib/middleware';

export async function PUT(request, { params }) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      );
    }

    // Only admin can update comment status
    if (authResult.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { status } = await request.json();

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      );
    }

    const comment = await Comment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('author', 'username email')
     .populate('post', 'title slug');

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

export async function DELETE(request, { params }) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      );
    }

    // Only admin can delete comments
    if (authResult.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const comment = await Comment.findByIdAndDelete(id);

    if (!comment) {
      return NextResponse.json(
        { success: false, message: 'Comment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Comment deletion error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
