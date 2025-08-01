"use client";

import { useState, useCallback } from "react";

interface StyleBoard {
  id: string;
  title: string;
  description: string;
  narrative: string;
  imageUrl: string;
  tags: string[];
  tastesInput: string[];
  enrichedTastes: string[];
  createdAt: Date;
}

interface ProgressUpdate {
  type: "progress" | "error" | "complete";
  step?: string;
  progress?: number;
  details?: string;
  error?: string;
  styleBoard?: StyleBoard;
  timestamp: string;
}

interface UseStyleGenerationOptions {
  onProgress?: (step: string, progress: number, details?: string) => void;
  onError?: (error: string) => void;
  onComplete?: (styleBoard: StyleBoard) => void;
}

export function useStyleGeneration(options: UseStyleGenerationOptions = {}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [details, setDetails] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const generateStyleBoard = useCallback(
    async (tastesInput: string[]) => {
      setIsGenerating(true);
      setError(null);
      setProgress(0);
      setCurrentStep("");
      setDetails("");

      try {
        const response = await fetch("/api/generate-stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tastesInput }),
        });

        if (!response.ok) {
          throw new Error("Failed to start generation");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No response body");
        }

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Process complete lines
          const lines = buffer.split("\n");
          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const jsonData = line.slice(6).trim();
                if (jsonData) {
                  const data: ProgressUpdate = JSON.parse(jsonData);

                  switch (data.type) {
                    case "progress":
                      if (data.step) setCurrentStep(data.step);
                      if (data.progress !== undefined)
                        setProgress(data.progress);
                      if (data.details) setDetails(data.details);

                      options.onProgress?.(
                        data.step || "",
                        data.progress || 0,
                        data.details
                      );
                      break;

                    case "error":
                      setError(data.error || "Unknown error");
                      options.onError?.(data.error || "Unknown error");
                      break;

                    case "complete":
                      setProgress(100);
                      setCurrentStep("Complete");
                      setDetails("Style board generated successfully!");
                      if (data.styleBoard) {
                        options.onComplete?.(data.styleBoard);
                      }
                      break;
                  }
                }
              } catch (parseError) {
                console.error(
                  "Error parsing SSE data:",
                  parseError,
                  "Line:",
                  line
                );
              }
            }
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        options.onError?.(errorMessage);
      } finally {
        setIsGenerating(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setIsGenerating(false);
    setCurrentStep("");
    setProgress(0);
    setDetails("");
    setError(null);
  }, []);

  return {
    generateStyleBoard,
    isGenerating,
    currentStep,
    progress,
    details,
    error,
    reset,
  };
}
