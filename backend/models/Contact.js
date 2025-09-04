import mongoose from 'mongoose';

const { Schema } = mongoose;

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

contactSchema.index({ email: 1 });

export default mongoose.model('Contact', contactSchema);
