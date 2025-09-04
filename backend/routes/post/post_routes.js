import express from 'express';
import Contact from '../../models/Contact.js';
import Lesson from '../../models/Lesson.js';
import Test from '../../models/Test.js';
import CalendarEvent from '../../models/CalendarEvent.js';
import Task from '../../models/Task.js';
import Notification from '../../models/Notification.js';
import Project from '../../models/Project.js';

const router = express.Router();

// POST /api/contacts - create a contact
router.post('/contacts', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json(contact);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create contact', details: err.message });
  }
});

export default router;
// PROJECTS
router.post('/projects', async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create project', details: err.message });
  }
});
// TASKS
router.post('/tasks', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create task', details: err.message });
  }
});

// NOTIFICATIONS
router.post('/notifications', async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create notification', details: err.message });
  }
});
// CALENDAR EVENTS
router.post('/events', async (req, res) => {
  try {
    const event = new CalendarEvent(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create event', details: err.message });
  }
});
// LESSONS
router.post('/lessons', async (req, res) => {
  try {
    const lesson = new Lesson(req.body);
    await lesson.save();
    res.status(201).json(lesson);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create lesson', details: err.message });
  }
});

// TESTS
router.post('/tests', async (req, res) => {
  try {
    const test = new Test(req.body);
    await test.save();
    res.status(201).json(test);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create test', details: err.message });
  }
});
