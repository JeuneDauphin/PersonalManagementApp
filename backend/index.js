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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
