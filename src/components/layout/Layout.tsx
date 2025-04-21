
import React from 'react';
import Header from './Header';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  onSearch?: (query: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onSearch }) => {
  const location = useLocation();
  
  // Don't show the header on login and register pages
  const hideHeaderRoutes = ['/login', '/register'];
  const shouldShowHeader = !hideHeaderRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      {shouldShowHeader && <Header onSearch={onSearch} />}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} QuickNotes. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
