import { openai } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import OpenAI from "openai";

// OpenAI client for image generation (still needed for DALL-E)
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface FashionEntity {
  name: string;
  id: string;
  category?: string;
}

interface StyleGenerationResult {
  narrative: string;
  visualPrompt: string;
  title: string;
  clothingRecommendations: string[];
  colorPalette: string[];
  styleArchetype: string;
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
        model: openai("gpt-3.5-turbo"),
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

// Fashion Style Analyst Agent
class FashionAnalystAgent {
  async analyze(tastesInput: string[], fashionEntities: FashionEntity[]) {
    const result = await generateObject({
      model: openai("gpt-4o"),
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
      model: openai("gpt-4o"),
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
      model: openai("gpt-4o"),
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
      model: openai("gpt-4o"),
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
    const stepGenerator = new StepNameGenerator();

    // Step 1: Fashion Analysis
    const stepName1 = await stepGenerator.generateStepName(
      "fashion-analysis",
      tastesInput
    );
    onProgress?.(
      stepName1,
      25,
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
    onProgress?.(stepName2, 50, "Creating your personalized color palette...");

    const { palette, aesthetic, colorPsychology } = await colorCurator.curate(
      tastesInput,
      fashionAnalysis.analysis
    );

    // Step 3: Style Storytelling
    const stepName3 = await stepGenerator.generateStepName(
      "storytelling",
      tastesInput
    );
    onProgress?.(stepName3, 75, "Crafting your unique style narrative...");

    const { title, narrative } = await styleStoryteller.craft(
      tastesInput,
      fashionAnalysis.analysis,
      fashionAnalysis.recommendations,
      { palette, aesthetic, colorPsychology }
    );

    // Step 4: Visual Prompt Design
    const stepName4 = await stepGenerator.generateStepName(
      "visual-design",
      tastesInput
    );
    onProgress?.(stepName4, 90, "Designing your fashion mood board...");

    const visualPromptResult = await visualPromptAgent.design(
      title,
      narrative,
      palette,
      fashionAnalysis.recommendations,
      aesthetic
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
    };
  }
}

export async function generateStyleImage(
  visualPrompt: string
): Promise<string> {
  try {
    const response = await openaiClient.images.generate({
      model: "dall-e-3",
      prompt: `Create a sophisticated fashion mood board and style collage: ${visualPrompt}. The image should be clean, well-organized, and visually appealing, showing clothing items, accessories, and fashion elements arranged in an aesthetic grid or collage format. Focus on fashion and clothing rather than home decor.`,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      response_format: "b64_json",
      style: "vivid",
    });

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
