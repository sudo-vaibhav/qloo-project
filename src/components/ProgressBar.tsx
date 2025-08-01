"use client";

import React from "react";

interface ProgressBarProps {
  currentStep: string;
  progress: number;
  details: string;
  isGenerating: boolean;
}

export default function ProgressBar({
  currentStep,
  progress,
  details,
  isGenerating,
}: ProgressBarProps) {
  if (!isGenerating && progress === 0) return null;

  return (
    <div className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-purple-100">
      {/* Step Title */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          {currentStep || "Initializing..."}
        </h3>
        {details && <p className="text-sm text-gray-600">{details}</p>}
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />

        {/* Animated shine effect */}
        {isGenerating && (
          <div className="absolute top-0 left-0 h-full w-full overflow-hidden">
            <div
              className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"
              style={{
                animation: "shimmer 2s infinite",
                transform: `translateX(${(progress / 100) * 300}%)`,
              }}
            />
          </div>
        )}
      </div>

      {/* Progress Percentage */}
      <div className="text-center">
        <span className="text-sm font-medium text-gray-700">
          {Math.round(progress)}% Complete
        </span>
      </div>

      {/* Loading Animation */}
      {isGenerating && (
        <div className="flex justify-center mt-4">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
      `}</style>
    </div>
  );
}
