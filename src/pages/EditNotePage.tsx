
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNotes } from '@/context/NotesContext';
import Layout from '@/components/layout/Layout';
import NoteForm from '@/components/notes/NoteForm';

const EditNotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { notes } = useNotes();
  
  // Find the note
  const note = id ? notes.find(note => note.id === id) : undefined;

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Redirect to home if note doesn't exist
  if (!note) {
    return <Navigate to="/" />;
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <NoteForm mode="edit" existingNote={note} />
      </div>
    </Layout>
  );
};

export default EditNotePage;
