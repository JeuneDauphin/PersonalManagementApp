import mongoose from 'mongoose';

const { Schema } = mongoose;

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], required: true },
    status: { type: String, enum: ['pending', 'in-progress', 'completed', 'cancelled'], required: true },
    dueDate: { type: Date, required: true },
    projectId: { type: String, trim: true },
    tags: { type: [String], default: [] },
    estimatedHours: { type: Number },
    actualHours: { type: Number },
  },
  { timestamps: true, versionKey: false }
);

taskSchema.index({ dueDate: 1 });
taskSchema.index({ status: 1, priority: 1 });

export default mongoose.model('Task', taskSchema);
