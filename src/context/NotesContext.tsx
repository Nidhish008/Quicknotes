
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isSecured: boolean;
  password?: string;
  reminderDate?: Date | string;
  reminderShown?: boolean;
}

interface NotesContextType {
  notes: Note[];
  addNote: (title: string, content: string, isSecured?: boolean, password?: string, reminderDate?: Date) => void;
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => void;
  deleteNote: (id: string) => void;
  searchNotes: (query: string) => Note[];
  unlockNote: (id: string, password: string) => boolean;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const storedNotes = localStorage.getItem(`quicknotes_${user.id}`);
      if (storedNotes) {
        const parsedNotes = JSON.parse(storedNotes).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
          reminderDate: note.reminderDate ? new Date(note.reminderDate) : undefined
        }));
        setNotes(parsedNotes);
      } else {
        setNotes([]);
      }
    } else {
      setNotes([]);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user && notes.length > 0) {
      localStorage.setItem(`quicknotes_${user.id}`, JSON.stringify(notes));
    }
  }, [notes, isAuthenticated, user]);

  const addNote = (title: string, content: string, isSecured = false, password = '', reminderDate?: Date) => {
    const newNote: Note = {
      id: `note_${Date.now()}`,
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
      isSecured,
      ...(isSecured && { password }),
      ...(reminderDate && { 
        reminderDate,
        reminderShown: false
      })
    };

    setNotes(prevNotes => [...prevNotes, newNote]);
  };

  const updateNote = (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === id
          ? {
              ...note,
              ...updates,
              updatedAt: new Date()
            }
          : note
      )
    );
  };

  const deleteNote = (id: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
  };

  const searchNotes = (query: string): Note[] => {
    if (!query.trim()) return notes;
    
    const lowercaseQuery = query.toLowerCase();
    return notes.filter(
      note =>
        note.title.toLowerCase().includes(lowercaseQuery) ||
        note.content.toLowerCase().includes(lowercaseQuery)
    );
  };

  const unlockNote = (id: string, password: string): boolean => {
    const note = notes.find(note => note.id === id);
    if (!note || !note.isSecured) return false;
    return note.password === password;
  };

  return (
    <NotesContext.Provider value={{ notes, addNote, updateNote, deleteNote, searchNotes, unlockNote }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = (): NotesContextType => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
