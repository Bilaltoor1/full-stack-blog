import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import User from '@/models/User';

// GET single category
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id: categoryId } = await params;
    
    const category = await Category.findById(categoryId);
    
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      category
    });

  } catch (error) {
    console.error('Category fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// UPDATE category
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id: categoryId } = await params;

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

    const { name, description, icon, color, slug, isActive } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Name is required' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if another category exists with the same name or slug (excluding current category)
    const existingCategory = await Category.findOne({ 
      $and: [
        { _id: { $ne: categoryId } },
        { $or: [{ name }, { slug: finalSlug }] }
      ]
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    const category = await Category.findByIdAndUpdate(
      categoryId,
      {
        name,
        slug: finalSlug,
        description,
        icon,
        color,
        isActive: isActive !== undefined ? isActive : true
      },
      { new: true }
    );

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      category
    });

  } catch (error) {
    console.error('Category update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE category
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id: categoryId } = await params;

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

    const category = await Category.findByIdAndDelete(categoryId);

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Category deletion error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
