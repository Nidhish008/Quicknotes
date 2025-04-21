
import React, { useState } from 'react';
import { useNotes, Note } from '@/context/NotesContext';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Lock, BookOpen } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const NoteList: React.FC<{ searchQuery?: string }> = ({ searchQuery = '' }) => {
  const { notes, deleteNote, unlockNote } = useNotes();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [password, setPassword] = useState('');
  const [unlockError, setUnlockError] = useState('');

  // Filter notes based on search query
  const filteredNotes = searchQuery 
    ? notes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notes;

  const handleDeleteClick = (note: Note) => {
    deleteNote(note.id);
  };

  const handleNoteClick = (note: Note) => {
    if (note.isSecured) {
      setSelectedNote(note);
    }
  };

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedNote && unlockNote(selectedNote.id, password)) {
      // Success - redirect to note details
      window.location.href = `/note/${selectedNote.id}`;
    } else {
      setUnlockError('Incorrect password');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // If no notes found
  if (filteredNotes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
          <BookOpen className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">No notes found</h2>
        <p className="text-gray-600 mb-6">
          {searchQuery 
            ? "We couldn't find any notes matching your search."
            : "You haven't created any notes yet."}
        </p>
        <Button asChild>
          <Link to="/create">Create your first note</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <Card key={note.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="line-clamp-1">
                  {note.isSecured ? (
                    <span className="flex items-center">
                      <Lock className="h-4 w-4 mr-2 text-amber-500" />
                      Secured Note
                    </span>
                  ) : (
                    note.title
                  )}
                </CardTitle>
                <Badge variant="outline" className="ml-2">
                  {formatDate(note.updatedAt)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent 
              className="pb-2 cursor-pointer"
              onClick={() => handleNoteClick(note)}
            >
              {note.isSecured ? (
                <p className="text-gray-500">
                  This note is password protected. Click to unlock.
                </p>
              ) : (
                <p className="text-gray-600 line-clamp-3">
                  {note.content}
                </p>
              )}
            </CardContent>
            <CardFooter className="pt-2 flex justify-end space-x-2">
              <Button variant="outline" size="icon" asChild>
                <Link to={note.isSecured ? "#" : `/edit/${note.id}`} onClick={(e) => {
                  if (note.isSecured) {
                    e.preventDefault();
                    handleNoteClick(note);
                  }
                }}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleDeleteClick(note)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedNote} onOpenChange={(open) => {
        if (!open) {
          setSelectedNote(null);
          setPassword('');
          setUnlockError('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter password to unlock note</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUnlockSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {unlockError && <p className="text-sm text-red-500">{unlockError}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Unlock</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NoteList;
