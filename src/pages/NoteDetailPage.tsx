
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import NoteDetail from '@/components/notes/NoteDetail';

const NoteDetailPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <NoteDetail />
      </div>
    </Layout>
  );
};

export default NoteDetailPage;
