import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import getRoutes from './routes/get/get_routes.js';
import postRoutes from './routes/post/post_routes.js';
import deleteRoutes from './routes/delete/delete_routes.js';
import patchRoutes from './routes/update/patch_routes.js';

// Load env from project root .env (one level up from /backend)
dotenv.config({ path: '../.env' });

const app = express();
app.use(cors());
app.use(express.json());

// Build a MongoDB Atlas URI from separate parts if a full URI isn't provided
const {
  MONGODB_USERNAME,
  MONGODB_PASSWORD,
  MONGODB_CLUSTER_HOST,
  MONGODB_DB_NAME,
  MONGODB_OPTIONS,
  APP_NAME,
} = process.env;

const buildAtlasUri = () => {
  if (MONGODB_USERNAME && MONGODB_PASSWORD && MONGODB_CLUSTER_HOST) {
    const user = encodeURIComponent(MONGODB_USERNAME);
    const pass = encodeURIComponent(MONGODB_PASSWORD);
    const host = MONGODB_CLUSTER_HOST; // e.g., cluster0.xxxxxx.mongodb.net
    const db = MONGODB_DB_NAME ? `/${encodeURIComponent(MONGODB_DB_NAME)}` : '';
    const params = MONGODB_OPTIONS || 'retryWrites=true&w=majority';
    const app = encodeURIComponent(APP_NAME || 'PersonalManagementApp');
    return `mongodb+srv://${user}:${pass}@${host}${db}?${params}&appName=${app}`;
  }
  return undefined;
};

// Support either MONGO_URI or MONGODB_URI or a derived Atlas URI; default to local if none provided
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || buildAtlasUri() || 'mongodb://localhost:27017/personal_management';
const PORT = process.env.PORT || 3000;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: process.env.MONGODB_DB_NAME || undefined,
})
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

// Mount split routers under /api
app.use('/api', getRoutes);
app.use('/api', postRoutes);
app.use('/api', deleteRoutes);
app.use('/api', patchRoutes);

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

// Contacts CRUD now handled in routes/contacts.js

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
