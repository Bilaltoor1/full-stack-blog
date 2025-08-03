'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Tag, 
  FolderPlus,
  X,
  Check,
  Palette,
  Hash
} from 'lucide-react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#3B82F6'
  });
  
  const [subCategoryForm, setSubCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    category: ''
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const categoriesResponse = await fetch('/api/categories', {
        credentials: 'include'
      });
      const categoriesData = await categoriesResponse.json();
      
      if (categoriesData.success) {
        setCategories(categoriesData.categories);
      }
      
      // Fetch subcategories
      const subCategoriesResponse = await fetch('/api/subcategories', {
        credentials: 'include'
      });
      const subCategoriesData = await subCategoriesResponse.json();
      
      if (subCategoriesData.success) {
        setSubCategories(subCategoriesData.subCategories);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    if (!categoryForm.name.trim()) {
      alert('Please enter a category name');
      return;
    }
    console.log('Category Form:', categoryForm);
    try {
      setSubmitting(true);
      
      const url = editingCategory 
        ? `/api/categories/${editingCategory._id}`
        : '/api/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(categoryForm)
      });

      const data = await response.json();

      if (data.success) {
        await fetchData();
        setShowCategoryModal(false);
        setCategoryForm({ name: '', slug: '', description: '', color: '#3B82F6' });
        setEditingCategory(null);
        alert(`Category ${editingCategory ? 'updated' : 'created'} successfully!`);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubCategorySubmit = async (e) => {
    e.preventDefault();
    
    if (!subCategoryForm.name.trim() || !subCategoryForm.category) {
      alert('Please enter subcategory name and select a category');
      return;
    }

    try {
      setSubmitting(true);
      
      const url = editingSubCategory 
        ? `/api/subcategories/${editingSubCategory._id}`
        : '/api/subcategories';
      
      const method = editingSubCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(subCategoryForm)
      });

      const data = await response.json();

      if (data.success) {
        await fetchData();
        setShowSubCategoryModal(false);
        setSubCategoryForm({ name: '', slug: '', description: '', category: '' });
        setEditingSubCategory(null);
        alert(`Subcategory ${editingSubCategory ? 'updated' : 'created'} successfully!`);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error saving subcategory:', error);
      alert('Error saving subcategory');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category? This will also delete all subcategories and may affect posts.')) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        await fetchData();
        alert('Category deleted successfully!');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category');
    }
  };

  const handleDeleteSubCategory = async (subCategoryId) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) {
      return;
    }

    try {
      const response = await fetch(`/api/subcategories/${subCategoryId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        await fetchData();
        alert('Subcategory deleted successfully!');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      alert('Error deleting subcategory');
    }
  };

  const openEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      color: category.color || '#3B82F6'
    });
    setShowCategoryModal(true);
  };

  const openEditSubCategory = (subCategory) => {
    setEditingSubCategory(subCategory);
    setSubCategoryForm({
      name: subCategory.name,
      slug: subCategory.slug,
      description: subCategory.description || '',
      category: subCategory.category._id || subCategory.category
    });
    setShowSubCategoryModal(true);
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubCategories = subCategories.filter(subCategory =>
    subCategory.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You need admin access to manage categories.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Categories & Subcategories
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your blog categories and subcategories
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setCategoryForm({ name: '', slug: '', description: '', color: '#3B82F6' });
              setEditingCategory(null);
              setShowCategoryModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              setSubCategoryForm({ name: '', slug: '', description: '', category: '' });
              setEditingSubCategory(null);
              setShowSubCategoryModal(true);
            }}
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Add Subcategory
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="xl" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Categories with their Subcategories */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold flex items-center">
                <Tag className="w-5 h-5 mr-2" />
                Categories & Subcategories ({filteredCategories.length} categories)
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredCategories.map((category) => {
                  const categorySubCategories = subCategories.filter(
                    sub => sub.category && sub.category._id === category._id
                  );
                  
                  return (
                    <div key={category._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      {/* Category Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white text-lg">
                              {category.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              /{category.slug}
                            </div>
                            {category.description && (
                              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {category.description}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSubCategoryForm({ 
                                name: '', 
                                slug: '', 
                                description: '', 
                                category: category._id 
                              });
                              setEditingSubCategory(null);
                              setShowSubCategoryModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Sub
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditCategory(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCategory(category._id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Subcategories */}
                      {categorySubCategories.length > 0 ? (
                        <div className="pl-6 space-y-2">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Subcategories ({categorySubCategories.length})
                          </div>
                          {categorySubCategories.map((subCategory) => (
                            <div
                              key={subCategory._id}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
                            >
                              <div>
                                <div className="font-medium text-gray-800 dark:text-gray-200">
                                  {subCategory.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  /{subCategory.slug}
                                </div>
                                {subCategory.description && (
                                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {subCategory.description}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditSubCategory(subCategory)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteSubCategory(subCategory._id)}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="pl-6 text-sm text-gray-500 dark:text-gray-400 italic">
                          No subcategories yet. Click "Add Sub" to create one.
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {filteredCategories.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No categories found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <Input
                  value={categoryForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setCategoryForm(prev => ({
                      ...prev,
                      name,
                      slug: prev.slug || generateSlug(name)
                    }));
                  }}
                  placeholder="Category name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Slug
                </label>
                <Input
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="category-slug"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Category description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCategoryModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {editingCategory ? 'Update' : 'Create'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {showSubCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingSubCategory ? 'Edit Subcategory' : 'Add Subcategory'}
              </h3>
              <button
                onClick={() => setShowSubCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Parent Category *
                </label>
                <select
                  value={subCategoryForm.category}
                  onChange={(e) => setSubCategoryForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <Input
                  value={subCategoryForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setSubCategoryForm(prev => ({
                      ...prev,
                      name,
                      slug: prev.slug || generateSlug(name)
                    }));
                  }}
                  placeholder="Subcategory name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Slug
                </label>
                <Input
                  value={subCategoryForm.slug}
                  onChange={(e) => setSubCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="subcategory-slug"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={subCategoryForm.description}
                  onChange={(e) => setSubCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Subcategory description"
                />
              </div>
              
              <div className="flex items-center justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSubCategoryModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {editingSubCategory ? 'Update' : 'Create'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
