import { openai } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import OpenAI from "openai";

// Model configuration from environment variables
const MODEL_CONFIG = {
  main: process.env.OPENAI_TEXT_MODEL || "gpt-3.5-turbo",
  stepName: process.env.OPENAI_STEP_NAME_MODEL || "gpt-3.5-turbo",
  image: (process.env.OPENAI_IMAGE_MODEL || "dall-e-2") as
    | "dall-e-2"
    | "dall-e-3",
  imageSize: (process.env.OPENAI_IMAGE_SIZE || "512x512") as
    | "256x256"
    | "512x512"
    | "1024x1024",
  imageQuality: (process.env.OPENAI_IMAGE_QUALITY || "standard") as
    | "standard"
    | "hd",
  clothingItemsMin: parseInt(process.env.CLOTHING_ITEMS_MIN || "2"),
  clothingItemsMax: parseInt(process.env.CLOTHING_ITEMS_MAX || "3"),
};

// Check model compatibility
const isStructuredOutputSupported =
  MODEL_CONFIG.main.includes("gpt-4") || MODEL_CONFIG.main.includes("o1");
const isQualitySupported = MODEL_CONFIG.image === "dall-e-3";

// Use compatible model for structured output if needed
const structuredOutputModel = isStructuredOutputSupported
  ? MODEL_CONFIG.main
  : "gpt-4o-mini";

// Log the current model configuration
console.log("🤖 Model Configuration:", {
  textModel: MODEL_CONFIG.main,
  structuredOutputModel: structuredOutputModel,
  stepNameModel: MODEL_CONFIG.stepName,
  imageModel: MODEL_CONFIG.image,
  imageSize: MODEL_CONFIG.imageSize,
  imageQuality: isQualitySupported
    ? MODEL_CONFIG.imageQuality
    : "N/A (DALL-E 2)",
  clothingItems: `${MODEL_CONFIG.clothingItemsMin}-${MODEL_CONFIG.clothingItemsMax} items`,
});

// OpenAI client for image generation (still needed for DALL-E)
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface FashionEntity {
  name: string;
  id: string;
  category?: string;
}

interface ClothingItem {
  name: string;
  description: string;
  category: string;
  imageUrl: string;
}

interface StyleGenerationResult {
  narrative: string;
  visualPrompt: string;
  title: string;
  clothingRecommendations: string[];
  colorPalette: string[];
  styleArchetype: string;
  clothingItems: ClothingItem[];
}

interface ProgressCallback {
  (step: string, progress: number, details?: string): void;
}

// Step Name Generator using cheaper model
class StepNameGenerator {
  async generateStepName(
    stepType: string,
    tastesInput: string[]
  ): Promise<string> {
    try {
      const result = await generateText({
        model: openai(MODEL_CONFIG.stepName),
        prompt: `Generate a creative, engaging step name for this fashion analysis phase:

Step Type: ${stepType}
User's Cultural Tastes: ${tastesInput.join(", ")}

Create a short, catchy step name (3-6 words) that relates to the user's tastes and the current analysis phase. Make it personal and engaging.

Examples:
- "Decoding Your Cultural DNA"
- "Weaving Japanese Elegance"
- "Crafting Your Color Story"
- "Building Your Fashion Narrative"`,
        system:
          "You are a creative copywriter specializing in fashion and user experience. Create engaging, personalized step names.",
      });

      return result.text.replace(/"/g, "").trim();
    } catch (error) {
      console.error("Error generating step name:", error);
      // Fallback to generic step names
      const fallbacks = {
        "fashion-analysis": "Analyzing Your Style DNA",
        "color-curation": "Curating Your Color Palette",
        storytelling: "Crafting Your Style Story",
        "visual-design": "Designing Your Mood Board",
      };
      return (
        fallbacks[stepType as keyof typeof fallbacks] || "Processing Your Style"
      );
    }
  }
}

// Zod schemas for structured output
const FashionAnalysisSchema = z.object({
  analysis: z
    .string()
    .describe("Professional analysis of style psychology and fashion DNA"),
  recommendations: z
    .array(z.string())
    .describe("Specific clothing categories and garment types"),
  styleArchetypes: z
    .array(z.string())
    .describe("Key fashion archetypes and style identities"),
  fashionDNA: z.string().describe("Core fashion DNA and psychological drivers"),
});

const ColorPaletteSchema = z.object({
  palette: z
    .array(z.string())
    .describe(
      "5-7 color palette with hex codes and names (format: #HEXCODE - Color Name)"
    ),
  aesthetic: z.string().describe("Overarching aesthetic style/archetype name"),
  colorPsychology: z
    .string()
    .describe("Explanation of color choices and their cultural significance"),
});

const StyleNarrativeSchema = z.object({
  title: z.string().describe("Compelling 2-4 word style title"),
  narrative: z
    .string()
    .describe(
      "250-300 word narrative connecting cultural tastes to personal style"
    ),
  styleManifesto: z
    .string()
    .describe("Brief manifesto or tagline for this style identity"),
});

const VisualPromptSchema = z.object({
  moodBoardPrompt: z
    .string()
    .describe("Detailed prompt for fashion mood board generation"),
  styleElements: z.array(z.string()).describe("Key visual elements to include"),
  composition: z.string().describe("Layout and composition guidelines"),
});

const ClothingItemsSchema = z.object({
  clothingItems: z
    .array(
      z.object({
        name: z.string().describe("Short, catchy name for the clothing item"),
        description: z
          .string()
          .describe("Brief description of the item and why it fits the style"),
        category: z
          .string()
          .describe(
            "Category like 'Top', 'Bottom', 'Footwear', 'Accessory', 'Outerwear'"
          ),
      })
    )
    .min(MODEL_CONFIG.clothingItemsMin)
    .max(MODEL_CONFIG.clothingItemsMax)
    .describe(
      `${MODEL_CONFIG.clothingItemsMin}-${MODEL_CONFIG.clothingItemsMax} carefully curated clothing items that define this style`
    ),
  reasoning: z
    .string()
    .describe(
      "Brief explanation of how these items work together as a cohesive style"
    ),
});

// Fashion Style Analyst Agent
class FashionAnalystAgent {
  async analyze(tastesInput: string[], fashionEntities: FashionEntity[]) {
    const result = await generateObject({
      model: openai(structuredOutputModel),
      schema: FashionAnalysisSchema,
      prompt: `As a professional fashion analyst, analyze these cultural tastes and fashion correlations to identify core style elements:

Cultural Tastes: ${tastesInput.join(", ")}
Fashion Correlations: ${fashionEntities.map((e) => e.name).join(", ")}

Provide:
1. A detailed analysis of the fashion DNA and style psychology
2. Key fashion archetypes and style identities present  
3. Specific clothing categories and garment types that align
4. Core fashion DNA and psychological drivers`,
      system:
        "You are a renowned fashion analyst specializing in cultural fashion psychology and style archetypes. Analyze fashion preferences with depth and precision.",
    });

    return result.object;
  }
}

// Color & Aesthetic Curator Agent
class ColorCuratorAgent {
  async curate(tastesInput: string[], fashionAnalysis: string) {
    const result = await generateObject({
      model: openai(structuredOutputModel),
      schema: ColorPaletteSchema,
      prompt: `As a color theory expert and aesthetic curator, create a cohesive color palette and aesthetic direction:

Cultural Tastes: ${tastesInput.join(", ")}
Fashion Analysis: ${fashionAnalysis}

Provide:
1. A sophisticated 5-7 color palette with hex codes and color names
2. The overarching aesthetic style/archetype name
3. Explanation of color choices and their cultural significance`,
      system:
        "You are a master colorist and aesthetic curator with expertise in cultural color psychology and fashion harmony.",
    });

    return result.object;
  }
}

// Style Storyteller Agent
class StyleStorytellerAgent {
  async craft(
    tastesInput: string[],
    fashionAnalysis: string,
    clothingRecs: string[],
    colorInfo: { palette: string[]; aesthetic: string; colorPsychology: string }
  ) {
    const result = await generateObject({
      model: openai(structuredOutputModel),
      schema: StyleNarrativeSchema,
      prompt: `As a fashion storyteller, craft a compelling personal style narrative:

Cultural Tastes: ${tastesInput.join(", ")}
Fashion Analysis: ${fashionAnalysis}
Clothing Recommendations: ${clothingRecs.join(", ")}
Color Palette: ${colorInfo.palette.join(", ")}
Style Aesthetic: ${colorInfo.aesthetic}
Color Psychology: ${colorInfo.colorPsychology}

Create:
1. A compelling 2-4 word style title
2. A 250-300 word narrative that tells the story of this unique fashion identity
3. A brief manifesto or tagline for this style identity`,
      system:
        "You are a master fashion storyteller who creates compelling personal style narratives that connect cultural identity to fashion expression.",
    });

    return result.object;
  }
}

// Visual Prompt Designer Agent
class VisualPromptAgent {
  async design(
    title: string,
    narrative: string,
    colorPalette: string[],
    clothingRecs: string[],
    aesthetic: string
  ) {
    const result = await generateObject({
      model: openai(structuredOutputModel),
      schema: VisualPromptSchema,
      prompt: `As a visual art director, create a detailed prompt for generating a fashion mood board:

Style Title: ${title}
Narrative: ${narrative}
Color Palette: ${colorPalette.join(", ")}
Clothing Types: ${clothingRecs.join(", ")}
Aesthetic: ${aesthetic}

Create:
1. A detailed visual prompt for DALL-E that will generate a sophisticated fashion mood board
2. Key visual elements to include in the mood board
3. Layout and composition guidelines for the mood board`,
      system:
        "You are a visual art director specializing in fashion photography and mood board creation. Create detailed, artistic prompts that capture style essence.",
    });

    return result.object;
  }
}

// Clothing Curator Agent
class ClothingCuratorAgent {
  async curate(
    tastesInput: string[],
    fashionAnalysis: string,
    clothingRecommendations: string[],
    colorPalette: string[],
    aesthetic: string
  ) {
    const result = await generateObject({
      model: openai(structuredOutputModel),
      schema: ClothingItemsSchema,
      prompt: `As a professional fashion stylist and curator, select ${
        MODEL_CONFIG.clothingItemsMin
      }-${
        MODEL_CONFIG.clothingItemsMax
      } specific clothing items that perfectly embody this style:

Cultural Tastes: ${tastesInput.join(", ")}
Fashion Analysis: ${fashionAnalysis}
General Clothing Categories: ${clothingRecommendations.join(", ")}
Color Palette: ${colorPalette.join(", ")}
Style Aesthetic: ${aesthetic}

Curate ${MODEL_CONFIG.clothingItemsMin}-${
        MODEL_CONFIG.clothingItemsMax
      } specific clothing items that work together as a cohesive wardrobe. Each item should be:
- Specific and detailed (not just "dress" but "midi wrap dress with geometric print")
- Aligned with the cultural tastes and aesthetic
- Part of a balanced outfit selection across different categories
- Unique and distinctive to this particular style identity

Focus on creating a diverse but cohesive selection that tells the complete style story.`,
      system:
        "You are a world-renowned fashion stylist and curator with expertise in cultural fashion and personal style development. Create specific, detailed clothing selections that form cohesive style narratives.",
    });

    return result.object;
  }
}

export async function generateStyleNarrative(
  tastesInput: string[],
  correlations: {
    fashionEntities: FashionEntity[];
    decorEntities: FashionEntity[];
    tags: string[];
  },
  onProgress?: ProgressCallback
): Promise<StyleGenerationResult> {
  const { fashionEntities } = correlations;

  try {
    // Initialize agents and step generator
    const fashionAnalyst = new FashionAnalystAgent();
    const colorCurator = new ColorCuratorAgent();
    const styleStoryteller = new StyleStorytellerAgent();
    const visualPromptAgent = new VisualPromptAgent();
    const clothingCurator = new ClothingCuratorAgent();
    const stepGenerator = new StepNameGenerator();

    // Step 1: Fashion Analysis
    const stepName1 = await stepGenerator.generateStepName(
      "fashion-analysis",
      tastesInput
    );
    onProgress?.(
      stepName1,
      15,
      "Analyzing your cultural tastes and fashion correlations..."
    );

    const fashionAnalysis = await fashionAnalyst.analyze(
      tastesInput,
      fashionEntities
    );

    // Step 2: Color & Aesthetic Curation
    const stepName2 = await stepGenerator.generateStepName(
      "color-curation",
      tastesInput
    );
    onProgress?.(stepName2, 30, "Creating your personalized color palette...");

    const { palette, aesthetic, colorPsychology } = await colorCurator.curate(
      tastesInput,
      fashionAnalysis.analysis
    );

    // Step 3: Style Storytelling
    const stepName3 = await stepGenerator.generateStepName(
      "storytelling",
      tastesInput
    );
    onProgress?.(stepName3, 45, "Crafting your unique style narrative...");

    const { title, narrative } = await styleStoryteller.craft(
      tastesInput,
      fashionAnalysis.analysis,
      fashionAnalysis.recommendations,
      { palette, aesthetic, colorPsychology }
    );

    // Step 4: Clothing Curation
    onProgress?.(
      "Curating Your Wardrobe",
      60,
      "Selecting specific clothing pieces..."
    );

    const clothingSelection = await clothingCurator.curate(
      tastesInput,
      fashionAnalysis.analysis,
      fashionAnalysis.recommendations,
      palette,
      aesthetic
    );

    // Step 5: Visual Prompt Design
    const stepName4 = await stepGenerator.generateStepName(
      "visual-design",
      tastesInput
    );
    onProgress?.(stepName4, 75, "Designing your fashion mood board...");

    const visualPromptResult = await visualPromptAgent.design(
      title,
      narrative,
      palette,
      fashionAnalysis.recommendations,
      aesthetic
    );

    // Step 6: Generate Individual Clothing Item Images
    onProgress?.(
      "Creating Style Visuals",
      85,
      "Generating images for each clothing piece..."
    );

    const clothingItemsWithImages = await Promise.all(
      clothingSelection.clothingItems.map(async (item, index) => {
        try {
          const imageUrl = await generateClothingItemImage(
            item.name,
            item.description,
            palette,
            aesthetic
          );
          onProgress?.(
            "Creating Style Visuals",
            85 + (index + 1) * 3,
            `Generated ${item.name}...`
          );
          return {
            ...item,
            imageUrl,
          };
        } catch (error) {
          console.error(`Error generating image for ${item.name}:`, error);
          return {
            ...item,
            imageUrl: "/placeholder-clothing.svg", // Fallback image
          };
        }
      })
    );

    onProgress?.(
      "Finalizing Your Style Board",
      100,
      "Your personalized style board is ready!"
    );

    return {
      title,
      narrative,
      visualPrompt: visualPromptResult.moodBoardPrompt,
      clothingRecommendations: fashionAnalysis.recommendations,
      colorPalette: palette,
      styleArchetype: aesthetic,
      clothingItems: clothingItemsWithImages,
    };
  } catch (error) {
    console.error("Error in agentic style generation:", error);

    // Fallback response
    return {
      title: "Unique Style",
      narrative: `Your fashion identity draws inspiration from ${tastesInput.join(
        ", "
      )}, creating a distinctive style that reflects your cultural influences and personal aesthetic. This unique approach to clothing and personal expression showcases your individual taste and creative vision through carefully curated pieces that tell your story.`,
      visualPrompt: `A sophisticated fashion mood board featuring clothing and accessories inspired by ${tastesInput.join(
        ", "
      )}, with a cohesive color palette and modern aesthetic`,
      clothingRecommendations: [
        "Statement pieces",
        "Classic basics",
        "Cultural-inspired accessories",
      ],
      colorPalette: [
        "#2D3436 - Charcoal",
        "#636E72 - Steel Gray",
        "#DDA0DD - Plum",
      ],
      styleArchetype: "Cultural Modern",
      clothingItems: [
        {
          name: "Statement Jacket",
          description:
            "A culturally-inspired jacket that serves as the centerpiece of your style",
          category: "Outerwear",
          imageUrl: "/placeholder-clothing.svg",
        },
        {
          name: "Classic Foundation Piece",
          description: "Essential basic that anchors your cultural aesthetic",
          category: "Top",
          imageUrl: "/placeholder-clothing.svg",
        },
        {
          name: "Cultural Accessory",
          description: "Distinctive accessory that tells your cultural story",
          category: "Accessory",
          imageUrl: "/placeholder-clothing.svg",
        },
      ],
    };
  }
}

export async function generateStyleImage(
  visualPrompt: string
): Promise<string> {
  try {
    const baseParams = {
      model: MODEL_CONFIG.image,
      prompt: `Create a sophisticated fashion mood board and style collage: ${visualPrompt}. The image should be clean, well-organized, and visually appealing, showing clothing items, accessories, and fashion elements arranged in an aesthetic grid or collage format. Focus on fashion and clothing rather than home decor. DO NOT include any text, labels, words, or written content in the image. Only show visual fashion elements, clothing, accessories, and style elements without any typography or text overlays.`,
      n: 1,
      size: MODEL_CONFIG.imageSize,
      response_format: "b64_json" as const,
      style: "vivid" as const,
    };

    // Only add quality parameter for DALL-E 3
    const params = isQualitySupported
      ? { ...baseParams, quality: MODEL_CONFIG.imageQuality }
      : baseParams;

    const response = await openaiClient.images.generate(params);

    const imageData = response.data?.[0];
    if (!imageData?.b64_json) {
      throw new Error("No image data returned from OpenAI");
    }

    return `data:image/png;base64,${imageData.b64_json}`;
  } catch (error) {
    console.error("Error generating style image:", error);
    throw new Error("Failed to generate style image");
  }
}

export async function generateClothingItemImage(
  itemName: string,
  itemDescription: string,
  colorPalette: string[],
  aesthetic: string
): Promise<string> {
  try {
    const baseParams = {
      model: MODEL_CONFIG.image,
      prompt: `Create a high-quality fashion photography image of a single clothing item: ${itemName}. ${itemDescription}. The item should be photographed in a clean, professional style with excellent lighting and composition. Use colors from this palette: ${colorPalette.join(
        ", "
      )}. The overall aesthetic should be ${aesthetic}. Show the item clearly and beautifully, either on a model or as a flat lay, with clean background. DO NOT include any text, labels, tags, or written content in the image. Focus solely on showcasing the clothing item's design, texture, and style.`,
      n: 1,
      size: MODEL_CONFIG.imageSize,
      response_format: "b64_json" as const,
      style: "vivid" as const,
    };

    // Only add quality parameter for DALL-E 3
    const params = isQualitySupported
      ? { ...baseParams, quality: MODEL_CONFIG.imageQuality }
      : baseParams;

    const response = await openaiClient.images.generate(params);

    const imageData = response.data?.[0];
    if (!imageData?.b64_json) {
      throw new Error("No image data returned from OpenAI");
    }

    return `data:image/png;base64,${imageData.b64_json}`;
  } catch (error) {
    console.error("Error generating clothing item image:", error);
    throw new Error("Failed to generate clothing item image");
  }
}
