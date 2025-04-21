
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useNotes, Note } from '@/context/NotesContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Edit, Trash2, ArrowLeft, Lock, Bell } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import SpellChecker from '@/utils/spellCheck';
import { format } from 'date-fns';

const NoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { notes, deleteNote, unlockNote } = useNotes();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const { toast } = useToast();
  const spellChecker = SpellChecker.getInstance();

  useEffect(() => {
    if (id) {
      const foundNote = notes.find(n => n.id === id);
      if (foundNote) {
        // Check if the content needs spell checking
        if (foundNote.content && spellChecker.isInitialized()) {
          const correctedContent = spellChecker.correctText(foundNote.content);
          setNote({
            ...foundNote,
            content: correctedContent
          });
        } else {
          setNote(foundNote);
        }
        
        // If not secured, consider it "unlocked"
        if (!foundNote.isSecured) {
          setIsUnlocked(true);
        } else {
          setIsPasswordDialogOpen(true);
        }
      } else {
        navigate('/'); // Note not found, redirect to home
        toast({
          title: "Note not found",
          description: "The requested note could not be found.",
          variant: "destructive"
        });
      }
    }
  }, [id, notes, navigate]);

  const handleDelete = () => {
    if (note) {
      deleteNote(note.id);
      toast({
        title: "Note deleted",
        description: "Your note has been successfully deleted."
      });
      navigate('/');
    }
  };

  const handleUnlock = () => {
    if (!note) return;
    
    if (unlockNote(note.id, password)) {
      setIsUnlocked(true);
      setIsPasswordDialogOpen(false);
      setError('');
      toast({
        title: "Note unlocked",
        description: "You can now view the protected content."
      });
    } else {
      setError('Incorrect password');
      toast({
        title: "Unlock failed",
        description: "The password you entered is incorrect.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!note) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="p-0 h-auto">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Notes
        </Button>
      </div>

      <Card className="w-full overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl flex items-center">
                {note.isSecured && (
                  <Lock className="h-5 w-5 mr-2 text-amber-500" />
                )}
                {note.title}
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Created on {formatDate(note.createdAt)}
                {note.updatedAt > note.createdAt && (
                  <span> • Updated on {formatDate(note.updatedAt)}</span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              {note.isSecured && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  Secured
                </Badge>
              )}
              {note.reminderDate && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                  <Bell className="h-3 w-3" />
                  {format(new Date(note.reminderDate), 'MMM d, yyyy')}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isUnlocked ? (
            <div className="prose max-w-none">
              {note.content.split('\n').map((paragraph, i) => (
                <p key={i} className="mb-4">{paragraph}</p>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Lock className="h-12 w-12 mx-auto mb-4 text-amber-500" />
              <h3 className="text-xl font-semibold mb-2">This note is password protected</h3>
              <p className="text-gray-500 mb-4">Enter the password to view its contents.</p>
              <Button onClick={() => setIsPasswordDialogOpen(true)}>
                Unlock Note
              </Button>
            </div>
          )}
        </CardContent>
        {isUnlocked && (
          <CardFooter className="flex justify-end space-x-2 border-t pt-4">
            <Button variant="outline" asChild>
              <Link to={`/edit/${note.id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </CardFooter>
        )}
      </Card>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter password to unlock note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                id="note-password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUnlock();
                  }
                }}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button onClick={handleUnlock}>
              Unlock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NoteDetail;
