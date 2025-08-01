import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import StyleBoard from "@/models/StyleBoard";
import { nanoid } from "nanoid";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const styleBoard = await StyleBoard.findOne({
      $or: [
        { _id: id, userId },
        { shareId: id, isPublic: true },
      ],
    });

    if (!styleBoard) {
      return NextResponse.json(
        { error: "Style board not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      styleBoard: {
        id: styleBoard._id,
        title: styleBoard.title,
        description: styleBoard.description,
        narrative: styleBoard.narrative,
        imageUrl: styleBoard.imageUrl,
        clothingItems: styleBoard.clothingItems || [],
        tags: styleBoard.tags,
        tastesInput: styleBoard.tastesInput,
        enrichedTastes: styleBoard.enrichedTastes,
        createdAt: styleBoard.createdAt,
        isPublic: styleBoard.isPublic,
        shareId: styleBoard.shareId,
      },
    });
  } catch (error) {
    console.error("Error fetching style board:", error);
    return NextResponse.json(
      { error: "Failed to fetch style board" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    await dbConnect();

    const styleBoard = await StyleBoard.findOne({ _id: id, userId });

    if (!styleBoard) {
      return NextResponse.json(
        { error: "Style board not found" },
        { status: 404 }
      );
    }

    if (action === "share") {
      if (!styleBoard.shareId) {
        styleBoard.shareId = nanoid(10);
        styleBoard.isPublic = true;
        await styleBoard.save();
      }

      const shareUrl = `${
        process.env.APP_URL || "http://localhost:3000"
      }/share/${styleBoard.shareId}`;

      return NextResponse.json({
        success: true,
        shareUrl,
        shareId: styleBoard.shareId,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating style board:", error);
    return NextResponse.json(
      { error: "Failed to update style board" },
      { status: 500 }
    );
  }
}
