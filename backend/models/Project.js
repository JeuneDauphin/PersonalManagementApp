import mongoose from 'mongoose';

const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: { type: String, enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], required: true },
    progress: { type: Number, required: true, min: 0, max: 100 },
    tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }], // Task IDs (optional)
    collaborators: { type: [String], default: [] }, // Contact IDs (optional)
    tags: { type: [String], default: [] },
    githubLink: { type: String, trim: true },
    figmaLink: { type: String, trim: true },
    mailingList: { type: String, trim: true },
  },
  { timestamps: true, versionKey: false }
);

projectSchema.index({ status: 1, priority: 1 });
projectSchema.index({ startDate: 1, endDate: 1 });
projectSchema.index({ _id: 1, 'tasks': 1 });

export default mongoose.model('Project', projectSchema);
