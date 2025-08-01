import mongoose, { Document, Schema } from "mongoose";

export interface IClothingItem {
  name: string;
  description: string;
  category: string;
  imageUrl: string;
}

export interface IStyleBoard extends Document {
  userId: string;
  title: string;
  description: string;
  tastesInput: string[];
  enrichedTastes: string[];
  narrative: string;
  imageUrl: string; // Keep for backward compatibility (main mood board image)
  clothingItems: IClothingItem[]; // New field for individual clothing pieces
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  shareId?: string;
}

const StyleBoardSchema = new Schema<IStyleBoard>(
  {
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
        validator: function (v: string[]) {
          return v && v.length >= 3 && v.length <= 10;
        },
        message: "TastesInput must contain between 3 and 10 items",
      },
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
    clothingItems: {
      type: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
          },
          description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300,
          },
          category: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
          },
          imageUrl: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
      validate: {
        validator: function (v: IClothingItem[]) {
          return v.length <= 10; // Maximum 10 clothing items
        },
        message: "Cannot have more than 10 clothing items",
      },
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
  },
  {
    timestamps: true,
  }
);

StyleBoardSchema.index({ createdAt: -1 });
StyleBoardSchema.index({ shareId: 1 });

export default mongoose.models.StyleBoard ||
  mongoose.model<IStyleBoard>("StyleBoard", StyleBoardSchema);
