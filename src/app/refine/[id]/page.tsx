'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sparkles, ArrowLeft, Wand2, Loader } from 'lucide-react';
import Link from 'next/link';

interface StyleBoard {
  id: string;
  title: string;
  narrative: string;
  imageUrl: string;
  tags: string[];
  tastesInput: string[];
}

export default function RefineStyleBoard() {
  const params = useParams();
  const router = useRouter();
  const [styleBoard, setStyleBoard] = useState<StyleBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refining, setRefining] = useState(false);
  const [refinementPrompt, setRefinementPrompt] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchStyleBoard(params.id as string);
    }
  }, [params.id]);

  const fetchStyleBoard = async (id: string) => {
    try {
      const response = await fetch(`/api/styleboards/${id}`);
      if (response.ok) {
        const data = await response.json();
        setStyleBoard(data.styleBoard);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching style board:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!styleBoard || !refinementPrompt.trim()) return;

    setRefining(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tastesInput: styleBoard.tastesInput,
          refinementPrompt: refinementPrompt.trim(),
          originalBoardId: styleBoard.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/board/${data.styleBoard.id}`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to refine style board');
      }
    } catch (error) {
      console.error('Error refining style board:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setRefining(false);
    }
  };

  const quickRefinements = [
    'Make it more casual and relaxed',
    'Add more vibrant colors',
    'Focus on minimalist aesthetics',
    'Include more vintage elements',
    'Make it more luxurious and elegant',
    'Add bohemian influences',
    'Focus on sustainable and eco-friendly options',
    'Make it more urban and edgy'
  ];

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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Style Board Not Found</h2>
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
          <Link href={`/board/${styleBoard.id}`} className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Refine Style Board</h1>
              <p className="text-sm text-gray-600">Customize &quot;{styleBoard.title}&quot;</p>
            </div>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Current Style Board */}
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Current Style</h2>
                <div className="aspect-square rounded-xl overflow-hidden mb-4">
                  <img
                    src={styleBoard.imageUrl}
                    alt={styleBoard.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{styleBoard.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{styleBoard.narrative}</p>
                
                <div className="flex flex-wrap gap-2">
                  {styleBoard.tags.slice(0, 4).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Refinement Form */}
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Wand2 className="h-6 w-6 text-purple-600" />
                  <h2 className="text-xl font-bold text-gray-900">Refine Your Style</h2>
                </div>

                <form onSubmit={handleRefine} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      How would you like to adjust your style?
                    </label>
                    <textarea
                      value={refinementPrompt}
                      onChange={(e) => setRefinementPrompt(e.target.value)}
                      placeholder="e.g., Make it more casual, add more earthy tones, focus on sustainable fashion..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                      rows={4}
                      disabled={refining}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={refining || !refinementPrompt.trim()}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                  >
                    {refining ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        Generating Refined Style...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Generate Refined Style
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Quick Refinements */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Refinements</h3>
                <div className="grid grid-cols-2 gap-2">
                  {quickRefinements.map((refinement, index) => (
                    <button
                      key={index}
                      onClick={() => setRefinementPrompt(refinement)}
                      className="p-3 text-sm text-left bg-gray-50 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                      disabled={refining}
                    >
                      {refinement}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">💡 Refinement Tips:</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Be specific about what you want to change</li>
                  <li>• Mention colors, textures, or moods you prefer</li>
                  <li>• Reference specific styles or aesthetics</li>
                  <li>• Consider both fashion and home decor aspects</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}