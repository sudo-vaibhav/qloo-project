import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import Favorite from "@/models/Favorite";
import StyleBoard from "@/models/StyleBoard";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get all favorite styleboards for the user
    const favorites = await Favorite.find({ userId });
    const styleBoardIds = favorites.map((fav) => fav.styleBoardId);

    const styleBoards = await StyleBoard.find({
      _id: { $in: styleBoardIds },
    })
      .sort({ createdAt: -1 })
      .select("_id title description imageUrl tags createdAt tastesInput");

    return NextResponse.json({
      success: true,
      favorites: styleBoards.map((board) => ({
        id: board._id,
        title: board.title,
        description: board.description,
        imageUrl: board.imageUrl,
        tags: board.tags,
        tastesInput: board.tastesInput,
        createdAt: board.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { styleBoardId, action } = body;

    if (!styleBoardId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify that the styleboard exists
    const styleBoard = await StyleBoard.findById(styleBoardId);
    if (!styleBoard) {
      return NextResponse.json(
        { error: "StyleBoard not found" },
        { status: 404 }
      );
    }

    if (action === "add") {
      // Add to favorites
      try {
        await Favorite.create({ userId, styleBoardId });
        return NextResponse.json({
          success: true,
          message: "Added to favorites",
        });
      } catch (error: unknown) {
        // Handle duplicate key error (already favorited)
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === 11000
        ) {
          return NextResponse.json({
            success: true,
            message: "Already in favorites",
          });
        }
        throw error;
      }
    } else if (action === "remove") {
      // Remove from favorites
      await Favorite.deleteOne({ userId, styleBoardId });
      return NextResponse.json({
        success: true,
        message: "Removed from favorites",
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error managing favorites:", error);
    return NextResponse.json(
      { error: "Failed to manage favorites" },
      { status: 500 }
    );
  }
}
