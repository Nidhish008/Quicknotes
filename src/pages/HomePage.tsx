
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import NoteList from '@/components/notes/NoteList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <Layout onSearch={handleSearch}>
      {isAuthenticated ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Your Notes</h1>
            <Button asChild>
              <Link to="/create" className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                New Note
              </Link>
            </Button>
          </div>
          <NoteList searchQuery={searchQuery} />
        </div>
      ) : (
        <div className="max-w-3xl mx-auto text-center py-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to QuickNotes</h1>
          <p className="text-xl mb-8">
            Take notes quickly, organize effortlessly, and access them anywhere.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              {
                title: "Speech-to-Text",
                description: "Dictate your notes using our built-in voice recognition technology."
              },
              {
                title: "Spell Check",
                description: "Automatic spell checking to keep your notes error-free."
              },
              {
                title: "Secure Notes",
                description: "Password-protect your sensitive information."
              }
            ].map((feature, index) => (
              <div key={index} className="p-6 border rounded-lg bg-white shadow-sm">
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link to="/register">Get Started</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default HomePage;
