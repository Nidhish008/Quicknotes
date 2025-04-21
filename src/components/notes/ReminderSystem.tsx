
import React, { useEffect, useState } from 'react';
import { useNotes } from '@/context/NotesContext';
import { useToast } from "@/hooks/use-toast";
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const ReminderSystem: React.FC = () => {
  const { notes, updateNote } = useNotes();
  const [processedNotes, setProcessedNotes] = useState<string[]>([]);
  const { toast } = useToast();

  // Check for notes with reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      
      notes.forEach((note) => {
        // Check if the note has a reminderDate property and is due
        if (note.reminderDate) {
          // Convert reminderDate to Date object if it's a string
          const reminderDate = typeof note.reminderDate === 'string' 
            ? new Date(note.reminderDate)
            : note.reminderDate;
          
          // Check if reminder is due and hasn't been shown yet
          if (
            reminderDate <= now && 
            !note.reminderShown && 
            !processedNotes.includes(note.id)
          ) {
            // Show notification
            toast({
              title: "Note Reminder",
              description: `"${note.title}" needs your attention. Due: ${format(reminderDate, 'MMM d, yyyy')}`,
              action: (
                <Link 
                  to={`/note/${note.id}`} 
                  className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  View
                </Link>
              ),
            });
            
            // Mark as processed in local state
            setProcessedNotes(prev => [...prev, note.id]);
            
            // Mark the reminder as shown in the note itself
            updateNote(note.id, { reminderShown: true });
            
            console.log(`Reminder shown for note: ${note.title}`);
          }
        }
      });
    };
    
    // Check reminders immediately and then every minute
    checkReminders();
    const intervalId = setInterval(checkReminders, 60000);
    
    return () => clearInterval(intervalId);
  }, [notes, processedNotes, updateNote]);

  // This component doesn't render anything visible
  return null;
};

export default ReminderSystem;
