import mongoose from 'mongoose';

const { Schema } = mongoose;

const testSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['quiz', 'midterm', 'final', 'assignment', 'project'],
    },
    date: { type: Date, required: true },
    duration: { type: Number },
    location: { type: String, trim: true },
    totalMarks: { type: Number },
    achievedMarks: { type: Number },
    grade: { type: String, trim: true },
    studyMaterials: { type: [String], default: [] },
    notes: { type: String, trim: true },
  },
  { timestamps: true, versionKey: false }
);

testSchema.index({ date: -1 });
testSchema.index({ subject: 1 });

export default mongoose.model('Test', testSchema);
