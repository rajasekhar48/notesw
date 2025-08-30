// src/routes/notes.ts
import { Router, Request, Response } from 'express';
import { Note } from '../models/Note';
import { authenticate } from '../middleware/auth';

const router = Router();

interface AuthRequest extends Request {
  user?: any;
}

// Get all notes for authenticated user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const notes = await Note.find({ userId: req.user?.id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Error fetching notes' });
  }
});

// Create a new note
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { title, content } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const note = new Note({
      title: title.trim(),
      content: content?.trim() || '',
      userId: req.user?.id,
    });

    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Error creating note' });
  }
});

// Update a note
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { title, content } = req.body;
    const noteId = req.params.id;

    const note = await Note.findOne({
      _id: noteId,
      userId: req.user?.id,
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.title = title?.trim() || note.title;
    note.content = content?.trim() || note.content;
    note.updatedAt = new Date();

    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Error updating note' });
  }
});

// Delete a note
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const noteId = req.params.id;

    const note = await Note.findOneAndDelete({
      _id: noteId,
      userId: req.user?.id,
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Error deleting note' });
  }
});

// Get a specific note
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const noteId = req.params.id;

    const note = await Note.findOne({
      _id: noteId,
      userId: req.user?.id,
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ message: 'Error fetching note' });
  }
});

export default router;
