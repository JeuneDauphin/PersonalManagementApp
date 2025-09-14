import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Lesson from '../models/Lesson.js';

dotenv.config({ path: '../../.env' });

const {
  MONGODB_USERNAME,
  MONGODB_PASSWORD,
  MONGODB_CLUSTER_HOST,
  MONGODB_DB_NAME,
  MONGODB_OPTIONS,
  APP_NAME,
  MONGO_URI,
  MONGODB_URI,
} = process.env;

const buildAtlasUri = () => {
  if (MONGODB_USERNAME && MONGODB_PASSWORD && MONGODB_CLUSTER_HOST) {
    const user = encodeURIComponent(MONGODB_USERNAME);
    const pass = encodeURIComponent(MONGODB_PASSWORD);
    const host = MONGODB_CLUSTER_HOST;
    const db = MONGODB_DB_NAME ? `/${encodeURIComponent(MONGODB_DB_NAME)}` : '';
    const params = MONGODB_OPTIONS || 'retryWrites=true&w=majority';
    const app = encodeURIComponent(APP_NAME || 'PersonalManagementApp');
    return `mongodb+srv://${user}:${pass}@${host}${db}?${params}&appName=${app}`;
  }
  return undefined;
};

const uri = MONGO_URI || MONGODB_URI || buildAtlasUri() || 'mongodb://localhost:27017/personal_management';

async function run() {
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: process.env.MONGODB_DB_NAME || undefined,
  });
  console.log('Connected to MongoDB');

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // 1) Backfill Task.project from legacy task.projectId if present
      const legacyTasks = await Task.find({ project: { $exists: false }, projectId: { $exists: true, $ne: null } }).select('_id projectId');
      for (const t of legacyTasks) {
        if (mongoose.isValidObjectId(t.projectId)) {
          await Task.updateOne({ _id: t._id }, { $set: { project: t.projectId } }, { session });
        }
      }

      // 2) Re-build reverse arrays for Project.tasks and Lesson.tasks using existing tasks
      const projects = await Project.find({}, '_id').lean();
      const lessons = await Lesson.find({}, '_id').lean();

      // Clear current arrays (optional, but avoids duplicates); if collections large, consider aggregation instead
      await Project.updateMany({}, { $set: { tasks: [] } }, { session });
      await Lesson.updateMany({}, { $set: { tasks: [] } }, { session });

      // Add tasks to projects
      const tasksWithProject = await Task.find({ project: { $exists: true, $ne: null } }, '_id project');
      for (const t of tasksWithProject) {
        await Project.updateOne({ _id: t.project }, { $addToSet: { tasks: t._id } }, { session });
      }

      // Add tasks to lessons
      const tasksWithLesson = await Task.find({ lesson: { $exists: true, $ne: null } }, '_id lesson');
      for (const t of tasksWithLesson) {
        await Lesson.updateOne({ _id: t.lesson }, { $addToSet: { tasks: t._id } }, { session });
      }
    });

    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await session.endSession();
    await mongoose.disconnect();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
