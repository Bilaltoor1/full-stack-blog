import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/middleware';

export async function GET(request) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const user = await User.findById(authResult.user._id)
      .select('-password')
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const { username, email, bio, avatar } = await request.json();

    // Check if username is already taken by another user
    if (username && username !== authResult.user.username) {
      const existingUser = await User.findOne({ 
        username: username.toLowerCase(),
        _id: { $ne: authResult.user._id }
      });
      
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Username already taken' },
          { status: 400 }
        );
      }
    }

    // Check if email is already taken by another user
    if (email && email !== authResult.user.email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: authResult.user._id }
      });
      
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Email already taken' },
          { status: 400 }
        );
      }
    }

    const updateData = {};
    if (username) updateData.username = username.toLowerCase();
    if (email) updateData.email = email.toLowerCase();
    if (bio !== undefined) updateData.bio = bio;
    if (avatar) updateData.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(
      authResult.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile update error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, message: errors.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
