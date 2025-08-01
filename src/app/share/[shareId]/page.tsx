'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Sparkles, Calendar, Tag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface StyleBoard {
  id: string;
  title: string;
  description: string;
  narrative: string;
  imageUrl: string;
  tags: string[];
  tastesInput: string[];
  createdAt: string;
}

export default function SharedStyleBoard() {
  const params = useParams();
  const [styleBoard, setStyleBoard] = useState<StyleBoard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.shareId) {
      fetchSharedStyleBoard(params.shareId as string);
    }
  }, [params.shareId]);

  const fetchSharedStyleBoard = async (shareId: string) => {
    try {
      const response = await fetch(`/api/styleboards/${shareId}`);
      if (response.ok) {
        const data = await response.json();
        setStyleBoard(data.styleBoard);
      }
    } catch (error) {
      console.error('Error fetching shared style board:', error);
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

  if (!styleBoard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Sparkles className="h-16 w-16 text-purple-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Style Board Not Found</h2>
          <p className="text-gray-600 mb-8">This style board may have been removed or the link is invalid.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Go to Homepage
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
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">TasteTailor</h1>
                <p className="text-sm text-gray-600">Shared Style Board</p>
              </div>
            </div>
            <Link
              href="/"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Your Own
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
                <img
                  src={styleBoard.imageUrl}
                  alt={styleBoard.title}
                  className="w-full aspect-square object-cover"
                />
              </div>
            </div>

            {/* Content Section */}
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
                <div className="flex items-start gap-3 mb-4">
                  <Sparkles className="h-6 w-6 text-purple-600 mt-1" />
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{styleBoard.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(styleBoard.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="prose prose-gray max-w-none mb-6">
                  <p className="text-gray-700 leading-relaxed">{styleBoard.narrative}</p>
                </div>

                {/* Tags */}
                {styleBoard.tags.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Style Tags</span>
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
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Cultural Influences</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {styleBoard.tastesInput.map((taste, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700"
                      >
                        {taste}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
                <h3 className="text-2xl font-bold mb-4">Love this style?</h3>
                <p className="mb-6 opacity-90">
                  Create your own personalized style board with TasteTailor&apos;s AI-powered taste analysis.
                </p>
                <Link
                  href="/"
                  className="inline-block px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Start Your Style Journey
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}