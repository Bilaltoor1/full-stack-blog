import { NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/middleware';

export async function GET(request) {
  try {
    const authResult = await authenticateUser(request);
    
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authResult.user._id,
        username: authResult.user.username,
        email: authResult.user.email,
        role: authResult.user.role,
        avatar: authResult.user.avatar
      }
    });

  } catch (error) {
    console.error('Me route error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
