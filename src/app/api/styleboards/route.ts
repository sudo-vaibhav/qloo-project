import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import StyleBoard from "@/models/StyleBoard";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const styleBoards = await StyleBoard.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select(
        "_id title description imageUrl clothingItems tags createdAt tastesInput enrichedTastes"
      );

    return NextResponse.json({
      success: true,
      styleBoards: styleBoards.map((board) => ({
        id: board._id,
        title: board.title,
        description: board.description,
        imageUrl: board.imageUrl,
        clothingItems: board.clothingItems || [],
        tags: board.tags,
        tastesInput: board.tastesInput,
        enrichedTastes: board.enrichedTastes,
        createdAt: board.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching style boards:", error);
    return NextResponse.json(
      { error: "Failed to fetch style boards" },
      { status: 500 }
    );
  }
}
