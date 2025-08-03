import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';
import Category from '@/models/Category';
import SubCategory from '@/models/SubCategory';
import User from '@/models/User';
import { requireAuth } from '@/lib/middleware';

export async function GET(request) {
  try {
    await dbConnect();
    
    // Safely parse URL with fallback
    let searchParams;
    try {
      const url = new URL(request.url, `http://localhost:3000`);
      searchParams = url.searchParams;
    } catch (urlError) {
      // If URL parsing fails, create empty searchParams
      searchParams = new URLSearchParams();
    }
    
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const category = searchParams.get('category');
    const subCategory = searchParams.get('subCategory');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const status = searchParams.get('status') || 'published';
    
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter = { status };
    
    if (category) {
      filter.category = category;
    }
    
    if (subCategory) {
      filter.subCategory = subCategory;
    }
    
    if (featured === 'true') {
      filter.featured = true;
    }
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    // Get posts
    const posts = await Post.find(filter)
      .populate('category', 'name slug color')
      .populate('subCategory', 'name slug')
      .populate('author', 'username avatar')
      .select('-content') // Exclude content for list view
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count
    const total = await Post.countDocuments(filter);
    
    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Posts fetch error:', error);
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
    
    const {
      title,
      content,
      excerpt,
      thumbnail,
      imageGallery,
      category,
      subCategory,
      tags,
      downloadLinks,
      status,
      featured,
      seo
    } = await request.json();

    if (!title || !content || !thumbnail || !category) {
      return NextResponse.json(
        { success: false, message: 'Title, content, thumbnail, and category are required' },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if post with this slug already exists
    const existingPost = await Post.findOne({ slug });
    if (existingPost) {
      return NextResponse.json(
        { success: false, message: 'Post with this title already exists' },
        { status: 400 }
      );
    }

    const post = new Post({
      title,
      slug,
      content,
      excerpt,
      thumbnail,
      imageGallery: imageGallery || [],
      category,
      subCategory,
      tags: tags || [],
      downloadLinks: downloadLinks || [],
      author: authResult.user._id,
      status: status || 'draft',
      featured: featured || false,
      publishedAt: status === 'published' ? new Date() : null,
      seo
    });

    await post.save();
    await post.populate([
      { path: 'category', select: 'name slug color' },
      { path: 'subCategory', select: 'name slug' },
      { path: 'author', select: 'username avatar' }
    ]);

    return NextResponse.json({
      success: true,
      message: 'Post created successfully',
      post
    });

  } catch (error) {
    console.error('Post creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
