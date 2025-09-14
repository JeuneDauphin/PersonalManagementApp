import mongoose from 'mongoose';

const { Schema } = mongoose;

const lessonSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['lecture', 'seminar', 'lab', 'tutorial', 'exam'],
    },
    date: { type: Date, required: true },
    duration: { type: Number, required: true }, // minutes
    location: { type: String, trim: true },
    instructor: { type: String, trim: true },
    description: { type: String, trim: true },
    materials: { type: [String], default: [] },
    completed: { type: Boolean, default: false },
    tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  },
  { timestamps: true, versionKey: false }
);

lessonSchema.index({ date: -1 });
lessonSchema.index({ subject: 1 });

export default mongoose.model('Lesson', lessonSchema);
