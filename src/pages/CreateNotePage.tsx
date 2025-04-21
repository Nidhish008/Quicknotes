
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import NoteForm from '@/components/notes/NoteForm';

const CreateNotePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <NoteForm mode="create" />
      </div>
    </Layout>
  );
};

export default CreateNotePage;
