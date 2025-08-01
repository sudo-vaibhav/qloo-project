import mongoose, { Document, Schema } from "mongoose";

export interface IFavorite extends Document {
  userId: string;
  styleBoardId: string;
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    styleBoardId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one favorite per user per styleboard
FavoriteSchema.index({ userId: 1, styleBoardId: 1 }, { unique: true });

export default mongoose.models.Favorite ||
  mongoose.model<IFavorite>("Favorite", FavoriteSchema);
