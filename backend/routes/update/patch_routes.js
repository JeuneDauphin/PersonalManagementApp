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

// PATCH /api/contacts/:id - partial update
router.patch('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const updates = req.body;
    const contact = await Contact.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update contact', details: err.message });
  }
});

// PUT alias for contacts update (frontend uses PUT)
router.put('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const contact = await Contact.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update contact', details: err.message });
  }
});

export default router;
// PROJECTS
router.patch('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const updates = { ...req.body };
    const hasTasksUpdate = Array.isArray(updates.tasks);
    let beforeTasks = [];
    if (hasTasksUpdate) {
      const before = await Project.findById(id).select('tasks');
      if (!before) return res.status(404).json({ error: 'Project not found' });
      beforeTasks = (before.tasks || []).map((t) => String(t));
    }

    const project = await Project.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (hasTasksUpdate) {
      const newTasks = (updates.tasks || []).map((t) => String(t));
      const added = newTasks.filter((t) => !beforeTasks.includes(t));
      const removed = beforeTasks.filter((t) => !newTasks.includes(t));
      const ops = [];
      if (added.length) ops.push(Task.updateMany({ _id: { $in: added } }, { $set: { project: id } }).exec());
      if (removed.length) ops.push(Task.updateMany({ _id: { $in: removed }, project: id }, { $unset: { project: '' } }).exec());
      if (ops.length) await Promise.allSettled(ops);
    }
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update project', details: err.message });
  }
});

router.put('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const updates = { ...req.body };
    const hasTasksUpdate = Array.isArray(updates.tasks);
    let beforeTasks = [];
    if (hasTasksUpdate) {
      const before = await Project.findById(id).select('tasks');
      if (!before) return res.status(404).json({ error: 'Project not found' });
      beforeTasks = (before.tasks || []).map((t) => String(t));
    }

    const project = await Project.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (hasTasksUpdate) {
      const newTasks = (updates.tasks || []).map((t) => String(t));
      const added = newTasks.filter((t) => !beforeTasks.includes(t));
      const removed = beforeTasks.filter((t) => !newTasks.includes(t));
      const ops = [];
      if (added.length) ops.push(Task.updateMany({ _id: { $in: added } }, { $set: { project: id } }).exec());
      if (removed.length) ops.push(Task.updateMany({ _id: { $in: removed }, project: id }, { $unset: { project: '' } }).exec());
      if (ops.length) await Promise.allSettled(ops);
    }
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update project', details: err.message });
  }
});
// TASKS
router.patch('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const updates = { ...req.body };
    // Map projectId/lessonId to actual refs even when null is provided
    if (Object.prototype.hasOwnProperty.call(updates, 'projectId') && !Object.prototype.hasOwnProperty.call(updates, 'project')) {
      updates.project = updates.projectId;
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'lessonId') && !Object.prototype.hasOwnProperty.call(updates, 'lesson')) {
      updates.lesson = updates.lessonId;
    }

    // Fetch existing to compare relations
    const before = await Task.findById(id).select('project lesson');
    if (!before) return res.status(404).json({ error: 'Task not found' });

    const task = await Task.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).populate('category');

    // Maintain reverse relations if project/lesson changed
    const ops = [];
    if (String(before.project || '') !== String(task.project || '')) {
      if (before.project && mongoose.isValidObjectId(before.project)) {
        ops.push(Project.findByIdAndUpdate(before.project, { $pull: { tasks: task._id } }).exec());
      }
      if (task.project && mongoose.isValidObjectId(task.project)) {
        ops.push(Project.findByIdAndUpdate(task.project, { $addToSet: { tasks: task._id } }).exec());
      }
    }
    if (String(before.lesson || '') !== String(task.lesson || '')) {
      if (before.lesson && mongoose.isValidObjectId(before.lesson)) {
        ops.push(Lesson.findByIdAndUpdate(before.lesson, { $pull: { tasks: task._id } }).exec());
      }
      if (task.lesson && mongoose.isValidObjectId(task.lesson)) {
        ops.push(Lesson.findByIdAndUpdate(task.lesson, { $addToSet: { tasks: task._id } }).exec());
      }
    }
    if (ops.length) await Promise.allSettled(ops);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update task', details: err.message });
  }
});

// PUT alias for tasks update (frontend uses PUT)
router.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const updates = { ...req.body };
    // Map projectId/lessonId to actual refs even when null is provided
    if (Object.prototype.hasOwnProperty.call(updates, 'projectId') && !Object.prototype.hasOwnProperty.call(updates, 'project')) {
      updates.project = updates.projectId;
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'lessonId') && !Object.prototype.hasOwnProperty.call(updates, 'lesson')) {
      updates.lesson = updates.lessonId;
    }

    // Fetch existing to compare relations
    const before = await Task.findById(id).select('project lesson');
    if (!before) return res.status(404).json({ error: 'Task not found' });

    const task = await Task.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).populate('category');

    // Maintain reverse relations if project/lesson changed
    const ops = [];
    if (String(before.project || '') !== String(task.project || '')) {
      if (before.project && mongoose.isValidObjectId(before.project)) {
        ops.push(Project.findByIdAndUpdate(before.project, { $pull: { tasks: task._id } }).exec());
      }
      if (task.project && mongoose.isValidObjectId(task.project)) {
        ops.push(Project.findByIdAndUpdate(task.project, { $addToSet: { tasks: task._id } }).exec());
      }
    }
    if (String(before.lesson || '') !== String(task.lesson || '')) {
      if (before.lesson && mongoose.isValidObjectId(before.lesson)) {
        ops.push(Lesson.findByIdAndUpdate(before.lesson, { $pull: { tasks: task._id } }).exec());
      }
      if (task.lesson && mongoose.isValidObjectId(task.lesson)) {
        ops.push(Lesson.findByIdAndUpdate(task.lesson, { $addToSet: { tasks: task._id } }).exec());
      }
    }
    if (ops.length) await Promise.allSettled(ops);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update task', details: err.message });
  }
});

// TASK CATEGORIES
router.patch('/task-categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const cat = await TaskCategory.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!cat) return res.status(404).json({ error: 'Task category not found' });
    res.json(cat);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update task category', details: err.message });
  }
});

router.put('/task-categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const cat = await TaskCategory.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!cat) return res.status(404).json({ error: 'Task category not found' });
    res.json(cat);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update task category', details: err.message });
  }
});

// NOTIFICATIONS
router.patch('/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const notification = await Notification.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update notification', details: err.message });
  }
});

// Mark notification as read
router.patch('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(400).json({ error: 'Failed to mark as read', details: err.message });
  }
});

// PUT alias to mark notification as read (frontend uses PUT)
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(400).json({ error: 'Failed to mark as read', details: err.message });
  }
});
// CALENDAR EVENTS
router.patch('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const event = await CalendarEvent.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update event', details: err.message });
  }
});

// PUT alias for events update (frontend uses PUT)
router.put('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const event = await CalendarEvent.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update event', details: err.message });
  }
});
// LESSONS
router.patch('/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const updates = { ...req.body };
    const hasTasksUpdate = Array.isArray(updates.tasks);
    let beforeTasks = [];
    if (hasTasksUpdate) {
      const before = await Lesson.findById(id).select('tasks');
      if (!before) return res.status(404).json({ error: 'Lesson not found' });
      beforeTasks = (before.tasks || []).map((t) => String(t));
    }

    const lesson = await Lesson.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    if (hasTasksUpdate) {
      const newTasks = (updates.tasks || []).map((t) => String(t));
      const added = newTasks.filter((t) => !beforeTasks.includes(t));
      const removed = beforeTasks.filter((t) => !newTasks.includes(t));
      const ops = [];
      if (added.length) ops.push(Task.updateMany({ _id: { $in: added } }, { $set: { lesson: id } }).exec());
      if (removed.length) ops.push(Task.updateMany({ _id: { $in: removed }, lesson: id }, { $unset: { lesson: '' } }).exec());
      if (ops.length) await Promise.allSettled(ops);
    }
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    res.json(lesson);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update lesson', details: err.message });
  }
});

// PUT alias for lessons update (frontend uses PUT)
router.put('/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const updates = { ...req.body };
    const hasTasksUpdate = Array.isArray(updates.tasks);
    let beforeTasks = [];
    if (hasTasksUpdate) {
      const before = await Lesson.findById(id).select('tasks');
      if (!before) return res.status(404).json({ error: 'Lesson not found' });
      beforeTasks = (before.tasks || []).map((t) => String(t));
    }

    const lesson = await Lesson.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    if (hasTasksUpdate) {
      const newTasks = (updates.tasks || []).map((t) => String(t));
      const added = newTasks.filter((t) => !beforeTasks.includes(t));
      const removed = beforeTasks.filter((t) => !newTasks.includes(t));
      const ops = [];
      if (added.length) ops.push(Task.updateMany({ _id: { $in: added } }, { $set: { lesson: id } }).exec());
      if (removed.length) ops.push(Task.updateMany({ _id: { $in: removed }, lesson: id }, { $unset: { lesson: '' } }).exec());
      if (ops.length) await Promise.allSettled(ops);
    }
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    res.json(lesson);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update lesson', details: err.message });
  }
});

// TESTS
router.patch('/tests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const test = await Test.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!test) return res.status(404).json({ error: 'Test not found' });
    res.json(test);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update test', details: err.message });
  }
});

// PUT alias for tests update (frontend uses PUT)
router.put('/tests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const test = await Test.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!test) return res.status(404).json({ error: 'Test not found' });
    res.json(test);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update test', details: err.message });
  }
});
