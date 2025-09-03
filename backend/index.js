import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/personal_management';
const PORT = process.env.PORT || 3000;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mongo: mongoose.connection.readyState });
});

// Example Task schema
const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  priority: String,
  status: String,
  dueDate: Date,
  projectId: String,
  tags: [String],
  estimatedHours: Number,
  actualHours: Number,
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

// Event schema
const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  location: String,
  attendees: [String],
  type: String,
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

// Project schema
const projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  startDate: Date,
  endDate: Date,
  status: String,
  members: [String],
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

// Contact schema
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  notes: String,
}, { timestamps: true });

const Contact = mongoose.model('Contact', contactSchema);

// GET tasks
app.get('/api/tasks', async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// POST task
app.post('/api/tasks', async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  res.json(task);
});

// UPDATE task
app.put('/api/tasks/:id', async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// DELETE task
app.delete('/api/tasks/:id', async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json({ message: 'Task deleted' });
});

// GET events
app.get('/api/events', async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

// POST event
app.post('/api/events', async (req, res) => {
  const event = new Event(req.body);
  await event.save();
  res.json(event);
});

// UPDATE event
app.put('/api/events/:id', async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

// DELETE event
app.delete('/api/events/:id', async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json({ message: 'Event deleted' });
});

// GET projects
app.get('/api/projects', async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
});

// POST project
app.post('/api/projects', async (req, res) => {
  const project = new Project(req.body);
  await project.save();
  res.json(project);
});

// UPDATE project
app.put('/api/projects/:id', async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

// DELETE project
app.delete('/api/projects/:id', async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json({ message: 'Project deleted' });
});

// GET contacts
app.get('/api/contacts', async (req, res) => {
  const contacts = await Contact.find();
  res.json(contacts);
});

// POST contact
app.post('/api/contacts', async (req, res) => {
  const contact = new Contact(req.body);
  await contact.save();
  res.json(contact);
});

// UPDATE contact
app.put('/api/contacts/:id', async (req, res) => {
  const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!contact) return res.status(404).json({ error: 'Contact not found' });
  res.json(contact);
});

// DELETE contact
app.delete('/api/contacts/:id', async (req, res) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);
  if (!contact) return res.status(404).json({ error: 'Contact not found' });
  res.json({ message: 'Contact deleted' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
