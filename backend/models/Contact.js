import mongoose from 'mongoose';

const { Schema } = mongoose;

// Aligns with src/utils/interfaces/interfaces.ts Contact interface
const socialLinksSchema = new Schema(
  {
    linkedin: { type: String, trim: true },
    twitter: { type: String, trim: true },
    github: { type: String, trim: true },
  },
  { _id: false }
);

const contactSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    position: { type: String, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['personal', 'work', 'school', 'client', 'vendor'],
      default: 'personal',
    },
    notes: { type: String, trim: true },
    socialLinks: socialLinksSchema,
  },
  { timestamps: true, versionKey: false }
);

// Helpful index if emails are used to look up contacts often (not unique to allow multiple contacts sharing a generic email)
contactSchema.index({ email: 1 });

export default mongoose.model('Contact', contactSchema);
