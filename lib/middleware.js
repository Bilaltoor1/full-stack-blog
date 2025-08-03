import { verifyToken, getTokenFromRequest } from './auth';
import User from '@/models/User';
import dbConnect from './mongodb';

export async function authenticateUser(request) {
  try {
    await dbConnect();
    
    const token = getTokenFromRequest(request);
    if (!token) {
      return { authenticated: false, error: 'No token provided' };
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return { authenticated: false, error: 'Invalid token' };
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      return { authenticated: false, error: 'User not found or inactive' };
    }

    return { authenticated: true, user };
  } catch (error) {
    return { authenticated: false, error: 'Authentication failed' };
  }
}

export async function requireAuth(request, requiredRole = null) {
  const authResult = await authenticateUser(request);
  
  if (!authResult.authenticated) {
    return authResult;
  }

  if (requiredRole && authResult.user.role !== requiredRole) {
    return { authenticated: false, error: 'Insufficient permissions' };
  }

  return authResult;
}

export async function requireAdmin(request) {
  return requireAuth(request, 'admin');
}
