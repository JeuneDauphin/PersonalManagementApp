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

// DELETE /api/contacts/:id - delete contact by id
router.delete('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete contact', details: err.message });
  }
});

export default router;
// PROJECTS
router.delete('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const project = await Project.findByIdAndDelete(id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    await Task.updateMany({ project: id }, { $unset: { project: '' } });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project', details: err.message });
  }
});
// TASKS
router.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const task = await Task.findByIdAndDelete(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const ops = [];
    if (task.project && mongoose.isValidObjectId(task.project)) {
      ops.push(Project.findByIdAndUpdate(task.project, { $pull: { tasks: task._id } }).exec());
    }
    if (task.lesson && mongoose.isValidObjectId(task.lesson)) {
      ops.push(Lesson.findByIdAndUpdate(task.lesson, { $pull: { tasks: task._id } }).exec());
    }
    if (ops.length) await Promise.allSettled(ops);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task', details: err.message });
  }
});

// TASK CATEGORIES
router.delete('/task-categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const cat = await TaskCategory.findByIdAndDelete(id);
    if (!cat) return res.status(404).json({ error: 'Task category not found' });
    // Optionally, unset this category from tasks referencing it
    await Task.updateMany({ category: id }, { $unset: { category: '' } });
    res.json({ message: 'Task category deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task category', details: err.message });
  }
});

// NOTIFICATIONS
router.delete('/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notification', details: err.message });
  }
});
// CALENDAR EVENTS
router.delete('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const event = await CalendarEvent.findByIdAndDelete(id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event', details: err.message });
  }
});
// LESSONS
router.delete('/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const lesson = await Lesson.findByIdAndDelete(id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    await Task.updateMany({ lesson: id }, { $unset: { lesson: '' } });
    res.json({ message: 'Lesson deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete lesson', details: err.message });
  }
});

// TESTS
router.delete('/tests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    const test = await Test.findByIdAndDelete(id);
    if (!test) return res.status(404).json({ error: 'Test not found' });
    res.json({ message: 'Test deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete test', details: err.message });
  }
});
