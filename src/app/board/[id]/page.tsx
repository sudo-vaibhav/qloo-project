"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Sparkles,
  Share,
  ArrowLeft,
  Calendar,
  Tag,
  Download,
  Heart,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import ClothingItemLightbox from "@/components/ClothingItemLightbox";

interface ClothingItem {
  name: string;
  description: string;
  category: string;
  imageUrl: string;
}

interface StyleBoard {
  id: string;
  title: string;
  description: string;
  narrative: string;
  imageUrl: string;
  clothingItems: ClothingItem[];
  tags: string[];
  tastesInput: string[];
  enrichedTastes: string[];
  createdAt: string;
  isPublic: boolean;
  shareId?: string;
}

export default function StyleBoardDetail() {
  const params = useParams();
  const router = useRouter();
  const [styleBoard, setStyleBoard] = useState<StyleBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoritingLoading, setFavoritingLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);

  const fetchStyleBoard = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/styleboards/${id}`);
        if (response.ok) {
          const data = await response.json();
          setStyleBoard(data.styleBoard);
          if (data.styleBoard.shareId) {
            setShareUrl(
              `${window.location.origin}/share/${data.styleBoard.shareId}`
            );
          }
        } else {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching style board:", error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const checkFavoriteStatus = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/favorites/${id}`);
      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data.isFavorited);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  }, []);

  const toggleFavorite = async () => {
    if (!styleBoard) return;

    setFavoritingLoading(true);
    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          styleBoardId: styleBoard.id,
          action: isFavorited ? "remove" : "add",
        }),
      });

      if (response.ok) {
        setIsFavorited(!isFavorited);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setFavoritingLoading(false);
    }
  };

  const openLightbox = (index: number) => {
    setSelectedItemIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  useEffect(() => {
    if (params.id) {
      fetchStyleBoard(params.id as string);
      checkFavoriteStatus(params.id as string);
    }
  }, [params.id, fetchStyleBoard, checkFavoriteStatus]);

  const handleShare = async () => {
    if (!styleBoard) return;

    setSharing(true);
    try {
      const response = await fetch(`/api/styleboards/${styleBoard.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "share" }),
      });

      if (response.ok) {
        const data = await response.json();
        setShareUrl(data.shareUrl);

        // Copy to clipboard
        await navigator.clipboard.writeText(data.shareUrl);
        toast.success("Share link copied to clipboard!");
        setCopyFeedback("Copied!");
        setTimeout(() => setCopyFeedback(""), 2000);
      }
    } catch (error) {
      console.error("Error sharing style board:", error);
      toast.error("Failed to create share link. Please try again.");
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!styleBoard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Style Board Not Found
          </h2>
          <Link href="/dashboard" className="text-purple-600 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={handleShare}
                disabled={sharing}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <Share className="h-4 w-4" />
                {sharing ? "Creating Link..." : "Share"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
                <Image
                  src={styleBoard.imageUrl}
                  alt={styleBoard.title}
                  className="w-full aspect-square object-cover"
                  width={600}
                  height={600}
                />
              </div>

              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 text-gray-700 hover:bg-white transition-colors">
                  <Download className="h-4 w-4" />
                  Download
                </button>
                <button
                  onClick={toggleFavorite}
                  disabled={favoritingLoading}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 backdrop-blur-sm rounded-xl border transition-colors ${
                    isFavorited
                      ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                      : "bg-white/80 border-white/20 text-gray-700 hover:bg-white"
                  } disabled:opacity-50`}
                >
                  <Heart
                    className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`}
                  />
                  {favoritingLoading
                    ? "Loading..."
                    : isFavorited
                    ? "Favorited"
                    : "Add to Favorites"}
                </button>
              </div>

              {/* Clothing Items Section */}
              {styleBoard.clothingItems &&
                styleBoard.clothingItems.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Curated Style Pieces
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {styleBoard.clothingItems.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => openLightbox(index)}
                          className="flex gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-xl hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer text-left"
                        >
                          <div className="flex-shrink-0">
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-lg border border-white/50"
                              width={80}
                              height={80}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {item.name}
                              </h4>
                              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                {item.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {item.description}
                            </p>
                            <p className="text-xs text-purple-600 mt-2 font-medium">
                              Click to view details →
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Content Section */}
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
                <div className="flex items-start gap-3 mb-4">
                  <Sparkles className="h-6 w-6 text-purple-600 mt-1" />
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {styleBoard.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(styleBoard.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="prose prose-gray max-w-none mb-6">
                  <p className="text-gray-700 leading-relaxed">
                    {styleBoard.narrative}
                  </p>
                </div>

                {/* Tags */}
                {styleBoard.tags.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Style Tags
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {styleBoard.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cultural Influences */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Your Original Influences
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {styleBoard.tastesInput.map((taste, index) => (
                        <div
                          key={index}
                          className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 font-medium"
                        >
                          {taste}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enriched Tastes from AI */}
                  {styleBoard.enrichedTastes &&
                    styleBoard.enrichedTastes.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          AI-Discovered Related Influences
                          <span className="text-sm font-normal text-gray-600 ml-2">
                            (Found by analyzing your cultural tastes)
                          </span>
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {styleBoard.enrichedTastes.map((taste, index) => (
                            <div
                              key={index}
                              className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800"
                            >
                              {taste}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Share URL Section */}
              {shareUrl && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Share Your Style
                  </h3>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(shareUrl);
                        toast.success("Share link copied to clipboard!");
                        setCopyFeedback("Copied!");
                        setTimeout(() => setCopyFeedback(""), 2000);
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm relative"
                    >
                      {copyFeedback || "Copy"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox */}
      {styleBoard && styleBoard.clothingItems && (
        <ClothingItemLightbox
          items={styleBoard.clothingItems}
          initialIndex={selectedItemIndex}
          isOpen={lightboxOpen}
          onClose={closeLightbox}
        />
      )}
    </div>
  );
}
