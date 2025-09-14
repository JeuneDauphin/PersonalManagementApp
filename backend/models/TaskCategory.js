import mongoose from 'mongoose';

const { Schema } = mongoose;

const taskCategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    color: { type: String, trim: true }, // optional hex like #ff0000
    description: { type: String, trim: true },
  },
  { timestamps: true, versionKey: false }
);

// Basic index on name for quick lookup
taskCategorySchema.index({ name: 1 }, { unique: true });

export default mongoose.model('TaskCategory', taskCategorySchema);
