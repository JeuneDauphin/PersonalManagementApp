import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import getRoutes from './routes/get/get_routes.js';
import postRoutes from './routes/post/post_routes.js';
import deleteRoutes from './routes/delete/delete_routes.js';
import patchRoutes from './routes/update/patch_routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import schoolFilesRoutes from './routes/files/school_files.js';

// Load env from project root .env (one level up from /backend)
dotenv.config({ path: '../.env' });

const app = express();
app.use(cors());
app.use(express.json());

// Static serving for uploaded files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

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



// Projects CRUD handled in routes/* files

// Mount split routers under /api
app.use('/api', getRoutes);
app.use('/api', postRoutes);
app.use('/api', deleteRoutes);
app.use('/api', patchRoutes);
app.use('/api', schoolFilesRoutes);

// Tasks CRUD handled in routes/* files

// Events CRUD handled in routes/* files

// Projects CRUD handled in routes/* files

// Contacts CRUD now handled in routes/contacts.js

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
