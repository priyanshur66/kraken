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
            Bet on future events with our decentralized prediction markets. 
            Trade your insights and earn rewards based on accurate predictions.
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

          <div className="mt-20 bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div className="group">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold mb-6 mx-auto text-lg group-hover:scale-110 transition-transform">1</div>
                <h4 className="font-semibold mb-3 text-white text-lg">Connect Wallet</h4>
                <p className="text-gray-300 leading-relaxed">Connect your MetaMask wallet to the Etherlink Testnet</p>
              </div>
              <div className="group">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold mb-6 mx-auto text-lg group-hover:scale-110 transition-transform">2</div>
                <h4 className="font-semibold mb-3 text-white text-lg">Browse Markets</h4>
                <p className="text-gray-300 leading-relaxed">Explore available prediction markets and their options</p>
              </div>
              <div className="group">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold mb-6 mx-auto text-lg group-hover:scale-110 transition-transform">3</div>
                <h4 className="font-semibold mb-3 text-white text-lg">Place Bets</h4>
                <p className="text-gray-300 leading-relaxed">Use USDC to buy shares in outcomes you believe will happen</p>
              </div>
              <div className="group">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold mb-6 mx-auto text-lg group-hover:scale-110 transition-transform">4</div>
                <h4 className="font-semibold mb-3 text-white text-lg">Claim Winnings</h4>
                <p className="text-gray-300 leading-relaxed">If your prediction is correct, claim your rewards from the pool</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
