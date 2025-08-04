import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/middleware';

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

    const { username, email, currentPassword, newPassword } = await request.json();

    // Find the user
    const user = await User.findById(authResult.user._id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if username or email already exists (excluding current user)
    if (username !== user.username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: user._id } 
      });
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Username already exists' },
          { status: 400 }
        );
      }
    }

    if (email !== user.email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: user._id } 
      });
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    // Update basic information
    user.username = username;
    user.email = email;

    // Handle password change if provided
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, message: 'Current password is required to change password' },
          { status: 400 }
        );
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, message: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      // Hash new password
      const saltRounds = 12;
      user.password = await bcrypt.hash(newPassword, saltRounds);
    }

    await user.save();

    // Return updated user (excluding password)
    const updatedUser = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
