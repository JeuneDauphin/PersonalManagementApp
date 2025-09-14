import express from 'express';
import mongoose from 'mongoose';
import Contact from '../../models/Contact.js';
import Lesson from '../../models/Lesson.js';
import Test from '../../models/Test.js';
import CalendarEvent from '../../models/CalendarEvent.js';
import Task from '../../models/Task.js';
import Notification from '../../models/Notification.js';
import Project from '../../models/Project.js';
import TaskCategory from '../../models/TaskCategory.js';

const router = express.Router();

// GET /api/contacts - list with optional query params: page, limit, q, type
router.get('/contacts', async (req, res) => {
  try {
    const { page = 1, limit = 40, q, type } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (q) {
      filter.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Contact.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(Number(limit)),
      Contact.countDocuments(filter),
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contacts', details: err.message });
  }
});

// GET /api/contacts/:id - single contact
router.get('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const contact = await Contact.findById(id);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contact', details: err.message });
  }
});

export default router;
// PROJECTS
router.get('/projects', async (req, res) => {
  try {
    const { page = 1, limit = 40, q, status, priority, tag } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (tag) filter.tags = tag;
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [q] } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Project.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(Number(limit)),
      Project.countDocuments(filter),
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects', details: err.message });
  }
});

router.get('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project', details: err.message });
  }
});
// TASKS
router.get('/tasks', async (req, res) => {
  try {
    const { page = 1, limit = 40, q, status, priority, projectId, project, lessonId, lesson, category, categoryId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    const projectFilter = project || projectId;
    if (projectFilter) {
      if (mongoose.isValidObjectId(projectFilter)) filter.project = projectFilter;
      else filter.project = null; // return empty result
    }
    const lessonFilter = lesson || lessonId;
    if (lessonFilter) {
      if (mongoose.isValidObjectId(lessonFilter)) filter.lesson = lessonFilter;
      else filter.lesson = null; // return empty result
    }
    if (categoryId) filter.category = categoryId; // direct id filter
    if (category && !categoryId) {
      // support filtering by category name
      const catDoc = await TaskCategory.findOne({ name: { $regex: `^${category}$`, $options: 'i' } }).select('_id');
      if (catDoc) filter.category = catDoc._id;
      else filter.category = null; // will return empty if none
    }
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [q] } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Task.find(filter).populate('category').sort({ dueDate: 1 }).skip(skip).limit(Number(limit)),
      Task.countDocuments(filter),
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks', details: err.message });
  }
});

router.get('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const task = await Task.findById(id).populate('category');
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch task', details: err.message });
  }
});

// TASK CATEGORIES
router.get('/task-categories', async (req, res) => {
  try {
    const { page = 1, limit = 100, q } = req.query;
    const filter = {};
    if (q) filter.name = { $regex: q, $options: 'i' };
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      TaskCategory.find(filter).sort({ name: 1 }).skip(skip).limit(Number(limit)),
      TaskCategory.countDocuments(filter),
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch task categories', details: err.message });
  }
});

router.get('/task-categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const cat = await TaskCategory.findById(id);
    if (!cat) return res.status(404).json({ error: 'Task category not found' });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch task category', details: err.message });
  }
});

// NOTIFICATIONS
router.get('/notifications', async (req, res) => {
  try {
    const { page = 1, limit = 40, type, read } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (read !== undefined) filter.read = read === 'true';
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Notification.countDocuments(filter),
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
  }
});

router.get('/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const notification = await Notification.findById(id);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notification', details: err.message });
  }
});
// CALENDAR EVENTS
router.get('/events', async (req, res) => {
  try {
    const { page = 1, limit = 40, q, type, from, to } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
      ];
    }
    if (from || to) {
      filter.$and = [];
      if (from) filter.$and.push({ endDate: { $gte: new Date(from) } });
      if (to) filter.$and.push({ startDate: { $lte: new Date(to) } });
      if (filter.$and.length === 0) delete filter.$and;
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      CalendarEvent.find(filter).sort({ startDate: 1 }).skip(skip).limit(Number(limit)),
      CalendarEvent.countDocuments(filter),
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events', details: err.message });
  }
});

router.get('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const event = await CalendarEvent.findById(id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event', details: err.message });
  }
});
// LESSONS
router.get('/lessons', async (req, res) => {
  try {
    const { page = 1, limit = 40, q, subject, type, completed } = req.query;
    const filter = {};
    if (subject) filter.subject = { $regex: subject, $options: 'i' };
    if (type) filter.type = type;
    if (completed !== undefined) filter.completed = completed === 'true';
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Lesson.find(filter).sort({ date: -1 }).skip(skip).limit(Number(limit)),
      Lesson.countDocuments(filter),
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lessons', details: err.message });
  }
});

router.get('/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const lesson = await Lesson.findById(id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lesson', details: err.message });
  }
});

// TESTS
router.get('/tests', async (req, res) => {
  try {
    const { page = 1, limit = 40, q, subject, type } = req.query;
    const filter = {};
    if (subject) filter.subject = { $regex: subject, $options: 'i' };
    if (type) filter.type = type;
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { notes: { $regex: q, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Test.find(filter).sort({ date: -1 }).skip(skip).limit(Number(limit)),
      Test.countDocuments(filter),
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tests', details: err.message });
  }
});

router.get('/tests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const test = await Test.findById(id);
    if (!test) return res.status(404).json({ error: 'Test not found' });
    res.json(test);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch test', details: err.message });
  }
});
