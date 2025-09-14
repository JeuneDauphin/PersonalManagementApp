import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Lesson from '../../models/Lesson.js';
import Test from '../../models/Test.js';

const router = express.Router();

// Resolve uploads base dir relative to backend folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../../');
const uploadsBase = path.join(backendRoot, 'uploads', 'school');

// Ensure base directory exists
fs.mkdirSync(uploadsBase, { recursive: true });

// Multer storage config: keep PDFs only
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { lessonId, testId } = req.params;
    const target = path.join(uploadsBase, lessonId ? 'lessons' : 'tests', String(lessonId || testId));
    fs.mkdirSync(target, { recursive: true });
    cb(null, target);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${timestamp}_${safeOriginal}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  },
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

// Utility to build public URL from an absolute file path inside backend/uploads
const publicUrlFor = (absFile) => {
  const relFromBackend = path.relative(path.resolve(backendRoot), absFile).split(path.sep).join('/');
  const prefix = 'uploads/';
  const idx = relFromBackend.indexOf(prefix);
  const tail = idx >= 0 ? relFromBackend.slice(idx + prefix.length) : relFromBackend;
  return `/uploads/${tail}`;
};

// List files for a Lesson
router.get('/school/lessons/:lessonId/files', async (req, res) => {
  try {
    const { lessonId } = req.params;
    if (!mongoose.isValidObjectId(lessonId)) return res.status(400).json({ error: 'Invalid id' });
    const target = path.join(uploadsBase, 'lessons', lessonId);
    if (!fs.existsSync(target)) return res.json({ items: [] });
    const files = fs.readdirSync(target).filter((f) => f.toLowerCase().endsWith('.pdf'));
    const items = files.map((f) => ({ name: f, url: publicUrlFor(path.join(target, f)) }));
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list files', details: err.message });
  }
});

// Upload files for a Lesson
router.post('/school/lessons/:lessonId/files', upload.array('files', 10), async (req, res) => {
  try {
    const { lessonId } = req.params;
    if (!mongoose.isValidObjectId(lessonId)) return res.status(400).json({ error: 'Invalid id' });
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    const saved = (req.files || []).map((f) => publicUrlFor(f.path));
    // Optionally append to lesson.materials
    if (saved.length) {
      await Lesson.findByIdAndUpdate(lessonId, { $addToSet: { materials: { $each: saved } } }, { new: true });
    }
    res.status(201).json({ uploaded: saved });
  } catch (err) {
    res.status(400).json({ error: 'Failed to upload files', details: err.message });
  }
});

// Delete a file for a Lesson by name
router.delete('/school/lessons/:lessonId/files/:fileName', async (req, res) => {
  try {
    const { lessonId, fileName } = req.params;
    if (!mongoose.isValidObjectId(lessonId)) return res.status(400).json({ error: 'Invalid id' });
    const dir = path.join(uploadsBase, 'lessons', lessonId);
    const target = path.join(dir, fileName);
    const resolved = path.resolve(target);
    if (!resolved.startsWith(path.resolve(dir))) {
      return res.status(400).json({ error: 'Invalid file path' });
    }
    if (!fs.existsSync(target)) return res.status(404).json({ error: 'File not found' });
    fs.unlinkSync(target);
    // Also remove from lesson.materials if present
    const publicUrl = publicUrlFor(target);
    await Lesson.findByIdAndUpdate(lessonId, { $pull: { materials: publicUrl } });
    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete file', details: err.message });
  }
});

// List files for a Test
router.get('/school/tests/:testId/files', async (req, res) => {
  try {
    const { testId } = req.params;
    if (!mongoose.isValidObjectId(testId)) return res.status(400).json({ error: 'Invalid id' });
    const target = path.join(uploadsBase, 'tests', testId);
    if (!fs.existsSync(target)) return res.json({ items: [] });
    const files = fs.readdirSync(target).filter((f) => f.toLowerCase().endsWith('.pdf'));
    const items = files.map((f) => ({ name: f, url: publicUrlFor(path.join(target, f)) }));
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list files', details: err.message });
  }
});

// Upload files for a Test
router.post('/school/tests/:testId/files', upload.array('files', 10), async (req, res) => {
  try {
    const { testId } = req.params;
    if (!mongoose.isValidObjectId(testId)) return res.status(400).json({ error: 'Invalid id' });
    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ error: 'Test not found' });

    const saved = (req.files || []).map((f) => publicUrlFor(f.path));
    // Optionally append to test.studyMaterials
    if (saved.length) {
      await Test.findByIdAndUpdate(testId, { $addToSet: { studyMaterials: { $each: saved } } }, { new: true });
    }
    res.status(201).json({ uploaded: saved });
  } catch (err) {
    res.status(400).json({ error: 'Failed to upload files', details: err.message });
  }
});

// Delete a file for a Test by name
router.delete('/school/tests/:testId/files/:fileName', async (req, res) => {
  try {
    const { testId, fileName } = req.params;
    if (!mongoose.isValidObjectId(testId)) return res.status(400).json({ error: 'Invalid id' });
    const dir = path.join(uploadsBase, 'tests', testId);
    const target = path.join(dir, fileName);
    const resolved = path.resolve(target);
    if (!resolved.startsWith(path.resolve(dir))) {
      return res.status(400).json({ error: 'Invalid file path' });
    }
    if (!fs.existsSync(target)) return res.status(404).json({ error: 'File not found' });
    fs.unlinkSync(target);
    const publicUrl = publicUrlFor(target);
    await Test.findByIdAndUpdate(testId, { $pull: { studyMaterials: publicUrl } });
    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete file', details: err.message });
  }
});

export default router;
