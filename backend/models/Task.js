import mongoose from 'mongoose';

const { Schema } = mongoose;

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], required: true },
    status: { type: String, enum: ['pending', 'in-progress', 'completed', 'cancelled'], required: true },
    // Freeform task type (e.g., Homework, Sub-Project mission)
    type: { type: String, trim: true },
    dueDate: { type: Date, required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    category: { type: Schema.Types.ObjectId, ref: 'TaskCategory' },
    tags: { type: [String], default: [] },
    estimatedHours: { type: Number },
    actualHours: { type: Number },
    contacts: { type: [String], default: [] },
  },
  { timestamps: true, versionKey: false }
);

taskSchema.index({ dueDate: 1 });
taskSchema.index({ status: 1, priority: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ project: 1 });
taskSchema.index({ lesson: 1 });

// Backward-compatible virtuals for API consumers still using projectId/lessonId
taskSchema.virtual('projectId').get(function () {
  // Return string id if set
  return this.project ? String(this.project) : undefined;
});

taskSchema.virtual('lessonId').get(function () {
  return this.lesson ? String(this.lesson) : undefined;
});

taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

export default mongoose.model('Task', taskSchema);
