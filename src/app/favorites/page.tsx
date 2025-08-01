"use client";

import { useState, useEffect } from "react";
import { Heart, ArrowLeft, Calendar, Eye, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface StyleBoard {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  tastesInput: string[];
  createdAt: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<StyleBoard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/favorites");
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (styleBoardId: string) => {
    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          styleBoardId,
          action: "remove",
        }),
      });

      if (response.ok) {
        setFavorites((prev) => prev.filter((fav) => fav.id !== styleBoardId));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-600 mb-4">
                No Favorites Yet
              </h2>
              <p className="text-gray-500 mb-8">
                Start exploring and save your favorite style boards to see them
                here.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Sparkles className="h-5 w-5" />
                Explore Style Boards
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {favorites.length} Favorite{favorites.length !== 1 ? "s" : ""}
                </h2>
                <p className="text-gray-600">
                  Style boards you&apos;ve saved to your favorites collection.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((styleBoard) => (
                  <div
                    key={styleBoard.id}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="relative">
                      <Image
                        src={styleBoard.imageUrl}
                        alt={styleBoard.title}
                        className="w-full h-48 object-cover"
                        width={400}
                        height={192}
                      />
                      <button
                        onClick={() => removeFavorite(styleBoard.id)}
                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                        title="Remove from favorites"
                      >
                        <Heart className="h-4 w-4 text-red-500 fill-current" />
                      </button>
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {styleBoard.title}
                      </h3>

                      {styleBoard.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {styleBoard.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(styleBoard.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-purple-600">
                          {styleBoard.tags.length} tags
                        </div>
                      </div>

                      <Link
                        href={`/board/${styleBoard.id}`}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors group-hover:bg-purple-700"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
