"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface ClothingItem {
  name: string;
  description: string;
  category: string;
  imageUrl: string;
}

interface ClothingItemLightboxProps {
  items: ClothingItem[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ClothingItemLightbox({
  items,
  initialIndex,
  isOpen,
  onClose,
}: ClothingItemLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
          break;
        case "ArrowRight":
          setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, items.length, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || items.length === 0) return null;

  const currentItem = items[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl max-h-[90vh] w-full mx-4 bg-white rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
          <div className="flex items-center gap-3">
            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
              {currentItem.category}
            </span>
            <span className="text-sm text-gray-600">
              {currentIndex + 1} of {items.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/80 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Image Section */}
          <div className="relative">
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
              <Image
                src={currentItem.imageUrl}
                alt={currentItem.name}
                className="w-full h-full object-cover"
                width={400}
                height={400}
              />
            </div>

            {/* Navigation Buttons */}
            {items.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
                >
                  <ChevronRight className="h-5 w-5 text-gray-700" />
                </button>
              </>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {currentItem.name}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {currentItem.description}
              </p>
            </div>

            {/* Thumbnails */}
            {items.length > 1 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Other pieces in this collection
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {items.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentIndex
                          ? "border-purple-500 ring-2 ring-purple-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        width={64}
                        height={64}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}