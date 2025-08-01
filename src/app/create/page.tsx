"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Plus, X, ArrowRight, Loader } from "lucide-react";
import Link from "next/link";
import { useStyleGeneration } from "@/hooks/useStyleGeneration";
import ProgressBar from "@/components/ProgressBar";

export default function CreateStyleBoard() {
  const router = useRouter();
  const [tastesInput, setTastesInput] = useState<string[]>([""]);
  const [error, setError] = useState("");

  const { generateStyleBoard, isGenerating, currentStep, progress, details } =
    useStyleGeneration({
      onComplete: (styleBoard) => {
        router.push(`/board/${styleBoard.id}`);
      },
      onError: (errorMessage) => {
        setError(errorMessage);
      },
    });

  const addTasteInput = () => {
    if (tastesInput.length < 10) {
      setTastesInput([...tastesInput, ""]);
    }
  };

  const removeTasteInput = (index: number) => {
    if (tastesInput.length > 1) {
      setTastesInput(tastesInput.filter((_, i) => i !== index));
    }
  };

  const updateTasteInput = (index: number, value: string) => {
    const newInputs = [...tastesInput];
    newInputs[index] = value;
    setTastesInput(newInputs);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" && !isGenerating) {
      e.preventDefault();
      const currentValue = tastesInput[index].trim();

      if (currentValue && tastesInput.length < 10) {
        addTasteInput();
        // Focus the next input after state update
        setTimeout(() => {
          const nextInput = document.querySelector(
            `input[data-index="${index + 1}"]`
          ) as HTMLInputElement;
          if (nextInput) {
            nextInput.focus();
          }
        }, 0);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validInputs = tastesInput.filter((input) => input.trim().length > 0);

    if (validInputs.length < 3) {
      setError(
        "Please provide at least 3 cultural influences to generate your style board."
      );
      return;
    }

    try {
      await generateStyleBoard(validInputs);
    } catch (error) {
      console.error("Error generating style board:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  };

  const exampleInputs = [
    "Studio Ghibli movies",
    "Indie folk music",
    "Wes Anderson films",
    "Japanese minimalism",
    "Taylor Swift",
    "The Great Gatsby",
    "Art Nouveau",
    "Vintage vinyl records",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Create Style Board
                </h1>
                <p className="text-sm text-gray-600">
                  Discover your unique aesthetic
                </p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                What influences your taste?
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Share 3-10 of your favorite cultural influences—movies, music,
                artists, books, or anything that speaks to your aesthetic. Our
                AI will analyze these to create your personalized style board.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {tastesInput.map((input, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) =>
                          updateTasteInput(index, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        placeholder={`Cultural influence ${index + 1} (e.g., ${
                          exampleInputs[index % exampleInputs.length]
                        })`}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        disabled={isGenerating}
                        data-index={index}
                      />
                    </div>
                    {tastesInput.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTasteInput(index)}
                        className="p-3 text-gray-400 hover:text-red-500 transition-colors"
                        disabled={isGenerating}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {tastesInput.length < 10 && (
                <button
                  type="button"
                  onClick={addTasteInput}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors flex items-center justify-center gap-2"
                  disabled={isGenerating}
                >
                  <Plus className="h-5 w-5" />
                  Add another influence ({tastesInput.length}/10)
                </button>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  {error}
                </div>
              )}

              {/* Progress Bar - Show when generating */}
              {isGenerating && (
                <ProgressBar
                  currentStep={currentStep}
                  progress={progress}
                  details={details}
                  isGenerating={isGenerating}
                />
              )}

              <button
                type="submit"
                disabled={
                  isGenerating || tastesInput.filter((i) => i.trim()).length < 3
                }
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                {isGenerating ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Generating Your Style Board...
                  </>
                ) : (
                  <>
                    Generate My Style Board
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 p-6 bg-purple-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-3">💡 Pro Tips:</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>
                  • Be specific: &quot;Miyazaki films&quot; vs &quot;Japanese
                  animation&quot;
                </li>
                <li>
                  • Mix different types: movies, music, books, artists, brands
                </li>
                <li>• Include both mainstream and niche influences</li>
                <li>
                  • Think about what truly resonates with your aesthetic sense
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
