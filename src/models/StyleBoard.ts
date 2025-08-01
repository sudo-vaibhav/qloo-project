import mongoose, { Document, Schema } from 'mongoose';

export interface IStyleBoard extends Document {
  userId: string;
  title: string;
  description: string;
  tastesInput: string[];
  enrichedTastes: string[];
  narrative: string;
  imageUrl: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  shareId?: string;
}

const StyleBoardSchema = new Schema<IStyleBoard>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  tastesInput: {
    type: [String],
    required: true,
    validate: {
      validator: function(v: string[]) {
        return v && v.length >= 3 && v.length <= 10;
      },
      message: 'TastesInput must contain between 3 and 10 items'
    }
  },
  enrichedTastes: {
    type: [String],
    default: [],
  },
  narrative: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  shareId: {
    type: String,
    unique: true,
    sparse: true,
  },
}, {
  timestamps: true,
});

StyleBoardSchema.index({ createdAt: -1 });
StyleBoardSchema.index({ shareId: 1 });

export default mongoose.models.StyleBoard || mongoose.model<IStyleBoard>('StyleBoard', StyleBoardSchema);