'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  Sun, 
  Moon,
  Home,
  Download,
  Gamepad2,
  Monitor,
  GraduationCap
} from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const categories = [
    { name: 'PC Software', slug: 'pc-software', icon: Monitor },
    { name: 'Games & Mods', slug: 'games-mods', icon: Gamepad2 },
    { name: 'Mobile Apps', slug: 'mobile-apps', icon: Download },
    { name: 'Courses', slug: 'courses', icon: GraduationCap }
  ];

  return (
    <nav className="bg-background border-b border-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Main Navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary">
                FreeBlog
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              <Link href="/" className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>

              {/* Categories Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Categories
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {categoriesOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-md shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    {categories.map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <Link
                          key={category.slug}
                          href={`/category/${category.slug}`}
                          className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors first:rounded-t-md last:rounded-b-md"
                          onClick={() => setCategoriesOpen(false)}
                        >
                          <IconComponent className="w-4 h-4 mr-3" />
                          {category.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search, Theme Toggle, and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              {searchOpen ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-64 px-4 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    autoFocus
                  />
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="ml-2 p-2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-sm font-medium">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{user?.username}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-md shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 rounded-t-md bg-gray-50 dark:bg-gray-700/50">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.username}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{user?.email}</p>
                    </div>
                    
                    {user?.role === 'admin' && (
                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Dashboard
                      </Link>
                    )}

                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors rounded-b-md"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="space-y-2">
              <Link
                href="/"
                className="flex items-center px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                <Home className="w-5 h-5 mr-3" />
                Home
              </Link>

              <div className="space-y-1">
                <p className="px-3 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Categories
                </p>
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Link
                      key={category.slug}
                      href={`/category/${category.slug}`}
                      className="flex items-center px-6 py-2 text-base text-muted-foreground hover:text-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      <IconComponent className="w-5 h-5 mr-3" />
                      {category.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
