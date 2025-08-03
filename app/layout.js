import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import LayoutContent from '@/components/layout/LayoutContent';

export const metadata = {
  title: "FreeBlog - Free Software, Games, Apps & Courses",
  description: "Download free software, games, mobile apps, and courses. Your ultimate destination for free digital resources.",
  keywords: "free software, games, mobile apps, courses, downloads, mods",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        <AuthProvider>
          <LayoutContent>
            {children}
          </LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}
