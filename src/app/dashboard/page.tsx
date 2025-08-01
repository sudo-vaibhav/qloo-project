"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Plus, Sparkles, Calendar, Share, Eye, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface StyleBoard {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  tastesInput: string[];
  enrichedTastes: string[];
  createdAt: string;
}

export default function Dashboard() {
  const { user } = useUser();
  const [styleBoards, setStyleBoards] = useState<StyleBoard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStyleBoards();
  }, []);

  const fetchStyleBoards = async () => {
    try {
      const response = await fetch("/api/styleboards");
      if (response.ok) {
        const data = await response.json();
        setStyleBoards(data.styleBoards || []);
      }
    } catch (error) {
      console.error("Error fetching style boards:", error);
    } finally {
      setLoading(false);
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
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Your Style Gallery
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back,{" "}
                  {user?.username || user?.emailAddresses[0].emailAddress}!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/favorites"
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <Heart className="h-5 w-5" />
                <span className="hidden sm:inline">Favorites</span>
              </Link>
              <Link
                href="/create"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
              >
                <Plus className="h-5 w-5" />
                Create New Board
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {styleBoards.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Sparkles className="h-16 w-16 text-purple-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to discover your style?
              </h2>
              <p className="text-gray-600 mb-8">
                Create your first style board by sharing your favorite cultural
                influences with our AI.
              </p>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
              >
                <Plus className="h-5 w-5" />
                Create Your First Board
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {styleBoards.map((board) => (
              <div
                key={board.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="aspect-square relative">
                  <Image
                    src={board.imageUrl}
                    alt={board.title}
                    className="w-full h-full object-cover"
                    width={400}
                    height={400}
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Link
                      href={`/board/${board.id}`}
                      className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Link>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {board.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {board.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {board.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {board.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{board.tags.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(board.createdAt).toLocaleDateString()}
                    </div>
                    <button className="flex items-center gap-1 hover:text-purple-600 transition-colors">
                      <Share className="h-4 w-4" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
