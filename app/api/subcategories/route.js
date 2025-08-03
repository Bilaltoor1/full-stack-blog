import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import SubCategory from '@/models/SubCategory';
import User from '@/models/User';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category');
    
    const filter = { isActive: true };
    if (categoryId) {
      filter.category = categoryId;
    }
    
    const subCategories = await SubCategory.find(filter)
      .populate('category', 'name slug')
      .sort({ order: 1, name: 1 });
    
    return NextResponse.json({
      success: true,
      subCategories
    });

  } catch (error) {
    console.error('SubCategories fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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
    
    const { name, description, category, slug } = await request.json();

    if (!name || !category) {
      return NextResponse.json(
        { success: false, message: 'Name and category are required' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if subcategory already exists in this category
    const existingSubCategory = await SubCategory.findOne({ 
      category,
      slug: finalSlug
    });

    if (existingSubCategory) {
      return NextResponse.json(
        { success: false, message: 'SubCategory with this name already exists in this category' },
        { status: 400 }
      );
    }

    const subCategory = new SubCategory({
      name,
      slug: finalSlug,
      description,
      category
    });

    await subCategory.save();
    await subCategory.populate('category', 'name slug');

    return NextResponse.json({
      success: true,
      message: 'SubCategory created successfully',
      subCategory
    });

  } catch (error) {
    console.error('SubCategory creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
