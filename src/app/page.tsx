import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Sparkles, Palette, Heart } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">TasteTailor</h1>
          </div>
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
              <UserButton />
            </SignedIn>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Style,{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Uniquely You
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Transform your cultural tastes into personalized fashion and decor recommendations. 
            Discover a style that&apos;s authentically yours through AI-powered taste analysis.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20">
              <Palette className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Cultural Analysis</h3>
              <p className="text-gray-600">
                Share your favorite movies, music, and artists to discover your unique aesthetic DNA
              </p>
            </div>
            
            <div className="p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20">
              <Sparkles className="h-12 w-12 text-pink-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Generation</h3>
              <p className="text-gray-600">
                Our AI creates personalized style narratives and visual mood boards just for you
              </p>
            </div>
            
            <div className="p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20">
              <Heart className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Personal Gallery</h3>
              <p className="text-gray-600">
                Save, refine, and share your style boards with friends and the community
              </p>
            </div>
          </div>

          <SignedOut>
            <SignUpButton mode="modal">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg">
                Start Your Style Journey
              </button>
            </SignUpButton>
          </SignedOut>
          
          <SignedIn>
            <Link href="/dashboard" className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg">
              Go to Dashboard
            </Link>
          </SignedIn>
        </div>
      </main>
    </div>
  );
}
