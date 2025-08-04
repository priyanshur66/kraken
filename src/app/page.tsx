'use client';

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Purple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-purple-700/50"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
      
      {/* Decorative gradient orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Kraken Prediction{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Markets
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Where underdogs wins. Our prediction markets reward the hidden choice, 
            not the crowd favorite. Outsmart the masses and claim massive rewards when the kraken emerges.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/market"
              className="bg-white text-black px-10 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              View Markets
            </Link>
            <Link
              href="/dashboard"
              className="bg-transparent border-2 border-purple-400 text-purple-400 px-10 py-4 rounded-xl font-semibold hover:bg-purple-400 hover:text-black transition-all transform hover:scale-105"
            >
              Dashboard
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all transform hover:scale-105">
              <div className="text-purple-400 text-4xl mb-6">📊</div>
              <h3 className="text-xl font-semibold mb-4 text-white">Trade Predictions</h3>
              <p className="text-gray-300 leading-relaxed">
                Buy shares in outcomes you believe will happen and earn rewards if you're right.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all transform hover:scale-105">
              <div className="text-purple-400 text-4xl mb-6">🏆</div>
              <h3 className="text-xl font-semibold mb-4 text-white">Win Rewards</h3>
              <p className="text-gray-300 leading-relaxed">
                Successful predictions are rewarded with USDC tokens from the market pool.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all transform hover:scale-105">
              <div className="text-purple-400 text-4xl mb-6">🔒</div>
              <h3 className="text-xl font-semibold mb-4 text-white">Decentralized</h3>
              <p className="text-gray-300 leading-relaxed">
                All markets run on smart contracts ensuring transparency and fair resolution.
              </p>
            </div>
          </div>

          {/* Why Kraken's Shadow Section */}
          <div className="mt-20 bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/10">
            <h2 className="text-4xl font-bold text-white mb-6 text-center">
              Why Kraken 
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-4xl mx-auto text-center leading-relaxed">
              Dive in where the underdog reigns supreme. Unlike traditional prediction markets where the crowd's favorite wins, 
              Kraken rewards the hidden choice—turning betting into a thrilling game of strategy and surprise. Here's why it's a cut above:
            </p>
            
            {/* Overlapping Trading Cards */}
            <div className="relative max-w-5xl mx-auto h-96 flex items-center justify-center">
              <style jsx>{`
                .flip-card {
                  background-color: transparent;
                  width: 280px;
                  height: 400px;
                  perspective: 1000px;
                }
                .flip-card-inner {
                  position: relative;
                  width: 100%;
                  height: 100%;
                  text-align: center;
                  transition: transform 0.8s;
                  transform-style: preserve-3d;
                }
                .flip-card:hover .flip-card-inner {
                  transform: rotateY(180deg);
                }
                .flip-card-front, .flip-card-back {
                  position: absolute;
                  width: 100%;
                  height: 100%;
                  -webkit-backface-visibility: hidden;
                  backface-visibility: hidden;
                  border-radius: 15px;
                  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                .flip-card-back {
                  transform: rotateY(180deg);
                }
              `}</style>

              {/* Card 1 - Strategic Mastery */}
              <div className="flip-card absolute z-40 transform -rotate-12 -translate-x-32 hover:z-50 hover:scale-110 transition-all duration-300">
                <div className="flip-card-inner">
                  {/* Front */}
                  <div className="flip-card-front bg-transparent p-1">
                    <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 rounded-xl p-6 h-full flex flex-col justify-center items-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-xl"></div>
                      <div className="relative z-10 text-center">
                        <div className="text-6xl mb-4">🎭</div>
                        <h3 className="text-xl font-bold text-white mb-2">Strategic Mastery</h3>
                        <p className="text-purple-200 text-sm">From the Shadows</p>
                      </div>
                    </div>
                  </div>
                  {/* Back */}
                  <div className="flip-card-back bg-transparent p-1">
                    <div className="bg-gradient-to-br from-purple-700 via-purple-600 to-blue-700 rounded-xl p-6 h-full flex flex-col justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-xl"></div>
                      <div className="relative z-10 text-center">
                        <h3 className="text-xl font-bold text-white mb-4">🎭 Strategic Mastery</h3>
                        <p className="text-white text-sm leading-relaxed mb-6">
                          Unlike traditional markets that reward following the crowd, Kraken rewards strategic thinking. Bet on underdogs, manipulate market sentiment, and use tactical depth to outsmart the masses in this thrilling game of wit and deception.
                        </p>
                        
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 - Instant Resolution */}
              <div className="flip-card absolute z-30 transform -rotate-6 -translate-x-16 hover:z-50 hover:scale-110 transition-all duration-300">
                <div className="flip-card-inner">
                  {/* Front */}
                  <div className="flip-card-front bg-transparent p-1">
                    <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 rounded-xl p-6 h-full flex flex-col justify-center items-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-xl"></div>
                      <div className="relative z-10 text-center">
                        <div className="text-6xl mb-4">⚡</div>
                        <h3 className="text-xl font-bold text-white mb-2">Instant Resolution</h3>
                        
                      </div>
                    </div>
                  </div>
                  {/* Back */}
                  <div className="flip-card-back bg-transparent p-1">
                    <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 rounded-xl p-6 h-full flex flex-col justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-xl"></div>
                      <div className="relative z-10 text-center">
                        <h3 className="text-xl font-bold text-white mb-4">⚡ Instant Resolution</h3>
                        <p className="text-white text-sm leading-relaxed mb-6">
                          No external oracles or delayed settlements. Markets resolve instantly based on which option has the fewest shares when the timer ends. This trustless, on-chain mechanism ensures fair, fast, and tamper-proof outcomes every time.
                        </p>
                        
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 - Massive Payouts */}
              <div className="flip-card absolute z-20 transform rotate-0 hover:z-50 hover:scale-110 transition-all duration-300">
                <div className="flip-card-inner">
                  {/* Front */}
                  <div className="flip-card-front bg-transparent p-1">
                    <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-600 rounded-xl p-6 h-full flex flex-col justify-center items-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-xl"></div>
                      <div className="relative z-10 text-center">
                        <div className="text-6xl mb-4">💰</div>
                        <h3 className="text-xl font-bold text-white mb-2">Massive Payouts</h3>
                        <p className="text-blue-200 text-sm">For Strategic Thinkers</p>
                      </div>
                    </div>
                  </div>
                  {/* Back */}
                  <div className="flip-card-back bg-transparent p-1">
                    <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-700 rounded-xl p-6 h-full flex flex-col justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-xl"></div>
                      <div className="relative z-10 text-center">
                        <h3 className="text-xl font-bold text-white mb-4">💰 Massive Payouts</h3>
                        <p className="text-white text-sm leading-relaxed mb-6">
                          When the underdog wins, winners take massive slices of the entire pool. Expect 2x-10x returns or more. Unlike traditional markets where favorites dilute rewards, here the bold are richly rewarded.
                        </p>
                        <div className="bg-white/20 rounded-full px-3 py-1 text-xs text-white font-semibold inline-block">
                          RARE
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4 - Accessible Depths */}
              <div className="flip-card absolute z-10 transform rotate-6 translate-x-16 hover:z-50 hover:scale-110 transition-all duration-300">
                <div className="flip-card-inner">
                  {/* Front */}
                  <div className="flip-card-front bg-transparent p-1">
                    <div className="bg-gradient-to-br from-cyan-600 via-cyan-500 to-teal-600 rounded-xl p-6 h-full flex flex-col justify-center items-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-xl"></div>
                      <div className="relative z-10 text-center">
                        <div className="text-6xl mb-4">🎯</div>
                        <h3 className="text-xl font-bold text-white mb-2">Accessible Depths</h3>
                        <p className="text-cyan-200 text-sm">For All Adventurers</p>
                      </div>
                    </div>
                  </div>
                  {/* Back */}
                  <div className="flip-card-back bg-transparent p-1">
                    <div className="bg-gradient-to-br from-cyan-700 via-cyan-600 to-teal-700 rounded-xl p-6 h-full flex flex-col justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-xl"></div>
                      <div className="relative z-10 text-center">
                        <h3 className="text-xl font-bold text-white mb-4">🎯 Accessible Depths</h3>
                        <p className="text-white text-sm leading-relaxed mb-6">
                          No expert knowledge required. Simple connect-and-play mechanics make this perfect for newcomers to prediction markets. Short cycles, clear rules, and fun themes create an engaging experience without regulatory complexity.
                        </p>
                        
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-center">
              <div className="group">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold mb-6 mx-auto text-lg group-hover:scale-110 transition-transform">1</div>
                <h4 className="font-semibold mb-3 text-white text-lg">Connect Your Wallet</h4>
                <p className="text-gray-300 leading-relaxed">Connect your MetaMask wallet to the Etherlink Testnet</p>
              </div>
              <div className="group">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold mb-6 mx-auto text-lg group-hover:scale-110 transition-transform">2</div>
                <h4 className="font-semibold mb-3 text-white text-lg">Browse Markets</h4>
                <p className="text-gray-300 leading-relaxed">Explore available prediction markets and their options</p>
              </div>
              <div className="group">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold mb-6 mx-auto text-lg group-hover:scale-110 transition-transform">3</div>
                <h4 className="font-semibold mb-3 text-white text-lg">Place Your Bet</h4>
                <p className="text-gray-300 leading-relaxed">Use USDC to buy shares in outcomes you believe will happen</p>
              </div>
              <div className="group">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold mb-6 mx-auto text-lg group-hover:scale-110 transition-transform">4</div>
                <h4 className="font-semibold mb-3 text-white text-lg">Await Resolution</h4>
                <p className="text-gray-300 leading-relaxed">Wait for the market to close and resolve automatically</p>
              </div>
              <div className="group">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold mb-6 mx-auto text-lg group-hover:scale-110 transition-transform">5</div>
                <h4 className="font-semibold mb-3 text-white text-lg">Claim Your Rewards</h4>
                <p className="text-gray-300 leading-relaxed">If your prediction is correct, claim your rewards from the pool</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
