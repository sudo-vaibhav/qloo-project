import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import StyleBoard from "@/models/StyleBoard";
import User from "@/models/User";
import { qlooAPI } from "@/lib/qloo";
import { generateStyleNarrative, generateStyleImage } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tastesInput } = body;

    if (!tastesInput || !Array.isArray(tastesInput) || tastesInput.length < 3) {
      return NextResponse.json(
        { error: "At least 3 taste inputs are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      const clerkUser = await currentUser();
      user = await User.create({
        clerkId: userId,
        email: clerkUser?.emailAddresses?.[0]?.emailAddress || "",
        firstName: clerkUser?.firstName,
        lastName: clerkUser?.lastName,
        profileImage: clerkUser?.imageUrl,
      });
    }

    const correlations = await qlooAPI.getStyleCorrelations(tastesInput);

    // Extract enriched taste entities from Qloo correlations
    const enrichedTastes = [
      ...correlations.fashionEntities.map((e) => e.name),
      ...correlations.decorEntities.map((e) => e.name),
    ].slice(0, 15); // Limit to 15 enriched tastes

    const { title, narrative, visualPrompt, clothingItems } =
      await generateStyleNarrative(tastesInput, correlations);

    const imageUrl = await generateStyleImage(visualPrompt);

    const styleBoard = await StyleBoard.create({
      userId,
      title,
      description: narrative.substring(0, 500),
      tastesInput,
      enrichedTastes,
      narrative,
      imageUrl,
      clothingItems,
      tags: correlations.tags,
    });

    return NextResponse.json({
      success: true,
      styleBoard: {
        id: styleBoard._id,
        title: styleBoard.title,
        description: styleBoard.description,
        narrative: styleBoard.narrative,
        imageUrl: styleBoard.imageUrl,
        clothingItems: styleBoard.clothingItems,
        tags: styleBoard.tags,
        tastesInput: styleBoard.tastesInput,
        enrichedTastes: styleBoard.enrichedTastes,
        createdAt: styleBoard.createdAt,
      },
    });
  } catch (error) {
    console.error("Error generating style board:", error);
    return NextResponse.json(
      { error: "Failed to generate style board" },
      { status: 500 }
    );
  }
}
