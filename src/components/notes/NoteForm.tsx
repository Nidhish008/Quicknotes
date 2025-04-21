
import React, { useState, useEffect, useRef } from 'react';
import { useNotes, Note } from '@/context/NotesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Mic, Check, X, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SpeechToText } from '@/utils/speechToText';
import SpellChecker from '@/utils/spellCheck';
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface NoteFormProps {
  mode: 'create' | 'edit';
  existingNote?: Note;
}

const NoteForm: React.FC<NoteFormProps> = ({ mode, existingNote }) => {
  const [title, setTitle] = useState(existingNote?.title || '');
  const [content, setContent] = useState(existingNote?.content || '');
  const [isSecured, setIsSecured] = useState(existingNote?.isSecured || false);
  const [password, setPassword] = useState(existingNote?.password || '');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingText, setRecordingText] = useState('');
  const [date, setDate] = useState<Date | undefined>(
    existingNote?.reminderDate ? new Date(existingNote.reminderDate) : undefined
  );
  
  const { addNote, updateNote } = useNotes();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const speechToTextRef = useRef<SpeechToText | null>(null);
  const spellChecker = SpellChecker.getInstance();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Initialize speech recognition
  useEffect(() => {
    speechToTextRef.current = new SpeechToText({
      onResult: (text) => {
        setRecordingText(text);
      },
      onEnd: () => {
        setIsRecording(false);
        
        // When recording ends, add the final text to the content
        if (recordingText && recordingText.trim() !== '') {
          // Apply spell checking if available
          const correctedText = spellChecker.isInitialized()
            ? spellChecker.correctText(recordingText)
            : recordingText;
            
          setContent(prev => {
            // Add a space if the current content doesn't end with one
            const spacer = prev.trim().length > 0 && !prev.endsWith(' ') ? ' ' : '';
            return prev + spacer + correctedText;
          });
          
          toast({
            title: "Speech recognized",
            description: "Your speech has been added to the note."
          });
        }
      },
      onError: (error) => {
        setIsRecording(false);
        toast({
          title: "Speech recognition error",
          description: "There was an error with speech recognition.",
          variant: "destructive"
        });
        console.error("Speech recognition error:", error);
      }
    });
    
    return () => {
      if (speechToTextRef.current) {
        speechToTextRef.current.stop();
      }
    };
  }, []);

  const toggleSpeechRecognition = () => {
    if (!speechToTextRef.current) return;
    
    if (!isRecording) {
      // Reset recording text before starting
      setRecordingText('');
      
      speechToTextRef.current.start();
      setIsRecording(true);
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone."
      });
    } else {
      // When stopping, make sure to capture the text
      const currentText = recordingText;
      speechToTextRef.current.stop();
      setIsRecording(false);
      
      // Add recording text to content area if valid
      if (currentText && currentText.trim() !== '') {
        // Apply spell checking if available
        const correctedText = spellChecker.isInitialized()
          ? spellChecker.correctText(currentText)
          : currentText;
          
        setContent(prev => {
          // Add a space if the current content doesn't end with one
          const spacer = prev.trim().length > 0 && !prev.endsWith(' ') ? ' ' : '';
          return prev + spacer + correctedText;
        });
        
        toast({
          title: "Speech recognized",
          description: "Your speech has been added to the note."
        });
      }
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setContent(newText);
    
    // Apply real-time spell checking
    if (spellChecker.isInitialized()) {
      // Get the cursor position before we potentially modify the text
      const cursorPos = e.target.selectionStart;
      
      // Split text by spaces to check each word
      const words = newText.split(/\s+/);
      const lastWord = words[words.length - 1];
      
      // Check if the last character typed is a space or punctuation
      const lastCharIsSpace = newText.length > 0 && 
        (newText.slice(-1) === ' ' || /[.,!?;:'"()]\s*$/.test(newText));
        
      // Only correct when a word is completed (space or punctuation after it)
      if (lastCharIsSpace && lastWord && lastWord.length > 2 && !spellChecker.checkWord(lastWord)) {
        const suggestions = spellChecker.getSuggestions(lastWord);
        if (suggestions.length > 0) {
          // Replace the last word with the first suggestion
          const corrected = newText.replace(
            new RegExp(`\\b${lastWord}\\b`), 
            suggestions[0]
          );
          
          // Only update if there's a real change
          if (corrected !== newText) {
            setContent(corrected);
            
            // Show toast notification for the correction
            toast({
              title: "Spell corrected",
              description: `"${lastWord}" corrected to "${suggestions[0]}"`
            });
            
            // Position cursor at the proper position
            setTimeout(() => {
              if (textareaRef.current) {
                // Adjust cursor position based on the difference in length
                const posDiff = suggestions[0].length - lastWord.length;
                textareaRef.current.selectionStart = cursorPos + posDiff;
                textareaRef.current.selectionEnd = cursorPos + posDiff;
                textareaRef.current.focus();
              }
            }, 0);
          }
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Apply spell check to the entire content before saving
    const correctedContent = spellChecker.isInitialized()
      ? spellChecker.correctText(content)
      : content;
    
    if (mode === 'create') {
      addNote(title, correctedContent, isSecured, password, date);
      toast({
        title: "Note created",
        description: "Your note has been successfully created."
      });
    } else if (mode === 'edit' && existingNote) {
      updateNote(existingNote.id, { 
        title, 
        content: correctedContent, 
        isSecured, 
        password,
        reminderDate: date,
        // Reset reminderShown if date has changed
        reminderShown: existingNote.reminderDate !== date ? false : existingNote.reminderShown
      });
      toast({
        title: "Note updated",
        description: "Your note has been successfully updated."
      });
    }
    
    navigate('/');
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{mode === 'create' ? 'Create New Note' : 'Edit Note'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Content</Label>
              <Button
                type="button"
                variant={isRecording ? "destructive" : "outline"}
                size="sm"
                onClick={toggleSpeechRecognition}
                className="flex items-center space-x-1"
              >
                <Mic className="h-4 w-4" />
                <span>{isRecording ? 'Stop Recording' : 'Record'}</span>
              </Button>
            </div>
            {isRecording && (
              <div className="bg-amber-50 p-3 rounded-md mb-2 text-amber-800 border border-amber-200">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="font-semibold">Recording...</span>
                </div>
                <p className="text-sm italic">{recordingText || "Listening..."}</p>
              </div>
            )}
            <Textarea
              id="content"
              placeholder="Write your note here..."
              value={content}
              onChange={handleContentChange}
              required
              rows={12}
              ref={textareaRef}
              className="resize-none"
            />
          </div>
          
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Switch
                  id="secure-note"
                  checked={isSecured}
                  onCheckedChange={setIsSecured}
                />
                <Label htmlFor="secure-note">Secure this note</Label>
              </div>
              <p className="text-sm text-gray-500">
                Password protection will hide the note content
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">Set Reminder</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-[240px] justify-start text-left font-normal ${
                      !date && "text-muted-foreground"
                    }`}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {isSecured && (
            <div className="space-y-2">
              <Label htmlFor="password">Note Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter a password to protect this note"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={isSecured}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit">
            <Check className="h-4 w-4 mr-2" />
            {mode === 'create' ? 'Create Note' : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default NoteForm;
