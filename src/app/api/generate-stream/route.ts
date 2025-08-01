import { NextRequest } from "next/server";
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
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const { tastesInput } = body;

    if (!tastesInput || !Array.isArray(tastesInput) || tastesInput.length < 3) {
      return new Response(
        JSON.stringify({ error: "At least 3 taste inputs are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Set up streaming response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const sendUpdate = (
          step: string,
          progress: number,
          details?: string
        ) => {
          const data = JSON.stringify({
            type: "progress",
            step,
            progress,
            details,
            timestamp: new Date().toISOString(),
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        };

        const sendError = (error: string) => {
          const data = JSON.stringify({
            type: "error",
            error,
            timestamp: new Date().toISOString(),
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        };

        const sendComplete = (styleBoard: {
          id: string;
          title: string;
          description: string;
          narrative: string;
          imageUrl: string;
          clothingItems?: Array<{
            name: string;
            description: string;
            category: string;
            imageUrl: string;
          }>;
          tags: string[];
          tastesInput: string[];
          enrichedTastes: string[];
          createdAt: Date;
        }) => {
          const data = JSON.stringify({
            type: "complete",
            styleBoard,
            timestamp: new Date().toISOString(),
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        };

        try {
          // Initialize progress
          sendUpdate(
            "Getting Started",
            0,
            "Initializing your style generation..."
          );

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

          sendUpdate(
            "Analyzing Cultural Tastes",
            10,
            "Connecting with taste intelligence..."
          );

          const correlations = await qlooAPI.getStyleCorrelations(tastesInput);

          // Extract enriched taste entities from Qloo correlations
          const enrichedTastes = [
            ...correlations.fashionEntities.map((e) => e.name),
            ...correlations.decorEntities.map((e) => e.name),
          ].slice(0, 15); // Limit to 15 enriched tastes

          sendUpdate(
            "Beginning AI Analysis",
            15,
            "Starting agentic style generation..."
          );

          const { title, narrative, visualPrompt, clothingItems } =
            await generateStyleNarrative(
              tastesInput,
              correlations,
              sendUpdate // Pass the progress callback
            );

          sendUpdate(
            "Generating Visual Assets",
            95,
            "Creating your style board image..."
          );

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

          // Send completion
          sendComplete({
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
          });
        } catch (error) {
          console.error("Error generating style board:", error);
          sendError("Failed to generate style board");
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error in streaming generation:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate style board" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
