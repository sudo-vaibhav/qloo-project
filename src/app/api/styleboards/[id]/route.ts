import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import StyleBoard from "@/models/StyleBoard";
import { nanoid } from "nanoid";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    console.log("API: Looking for styleBoard with ID/shareId:", id);
    console.log("API: User ID:", userId);

    await dbConnect();

    // Check if the id is a valid MongoDB ObjectId
    const isValidObjectId =
      mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
    console.log("API: Is valid ObjectId:", isValidObjectId);

    // Build query based on whether user is authenticated
    let query: Record<string, unknown>;
    if (userId) {
      // Authenticated user can see their own boards or public shared boards
      const orConditions: Record<string, unknown>[] = [
        { shareId: id, isPublic: true },
      ];

      // Only add _id condition if the id is a valid ObjectId
      if (isValidObjectId) {
        orConditions.unshift({ _id: id, userId });
      }

      query = { $or: orConditions };
    } else {
      // Unauthenticated user can only see public shared boards by shareId
      query = { shareId: id, isPublic: true };
    }

    console.log("API: Query:", JSON.stringify(query));

    const styleBoard = await StyleBoard.findOne(query);
    console.log("API: Found styleBoard:", !!styleBoard);

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
