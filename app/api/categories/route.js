import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

export async function GET() {
  try {
    await connectDB();
    
    const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
    
    return NextResponse.json({
      success: true,
      categories
    });

  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const authResult = await requireAdmin(request);
    
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      );
    }    const { name, description, icon, color, slug } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Name is required' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      $or: [{ name }, { slug: finalSlug }] 
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    const category = new Category({
      name,
      slug: finalSlug,
      description,
      icon,
      color
    });

    await category.save();

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      category
    });

  } catch (error) {
    console.error('Category creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
