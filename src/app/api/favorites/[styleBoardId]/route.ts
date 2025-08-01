import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import Favorite from "@/models/Favorite";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ styleBoardId: string }> }
) {
  try {
    const { styleBoardId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const favorite = await Favorite.findOne({ userId, styleBoardId });

    return NextResponse.json({
      success: true,
      isFavorited: !!favorite,
    });
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return NextResponse.json(
      { error: "Failed to check favorite status" },
      { status: 500 }
    );
  }
}
