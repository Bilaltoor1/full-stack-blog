import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import SubCategory from '@/models/SubCategory';
import User from '@/models/User';

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const { id } = await params;
    const { name, slug, description, category } = await request.json();

    if (!name || !category) {
      return NextResponse.json({ 
        success: false, 
        message: 'Name and category are required' 
      }, { status: 400 });
    }

    // Generate slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      id,
      {
        name,
        slug: finalSlug,
        description,
        category,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('category', 'name slug');

    if (!updatedSubCategory) {
      return NextResponse.json({ 
        success: false, 
        message: 'Subcategory not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      subCategory: updatedSubCategory,
      message: 'Subcategory updated successfully'
    });

  } catch (error) {
    console.error('Error updating subcategory:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error' 
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const { id } = await params;

    const deletedSubCategory = await SubCategory.findByIdAndDelete(id);

    if (!deletedSubCategory) {
      return NextResponse.json({ 
        success: false, 
        message: 'Subcategory not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Subcategory deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting subcategory:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error' 
    }, { status: 500 });
  }
}
