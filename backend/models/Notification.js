import mongoose from 'mongoose';

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: ['info', 'warning', 'error', 'success'], required: true },
    read: { type: Boolean, default: false },
    entityType: { type: String, enum: ['task', 'project', 'event', 'lesson', 'test'] },
    entityId: { type: String, trim: true },
  },
  { timestamps: true, versionKey: false }
);

notificationSchema.index({ read: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
