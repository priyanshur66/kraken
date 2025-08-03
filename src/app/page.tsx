import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Kraken Prediction Markets
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Bet on future events with our decentralized prediction markets. 
            Trade your insights and earn rewards based on accurate predictions.
          </p>
          
          <div className="flex gap-4 justify-center mb-12">
            <Link
              href="/market"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View Markets
            </Link>
            <Link
              href="/dashboard"
              className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Dashboard
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">Trade Predictions</h3>
              <p className="text-gray-600">
                Buy shares in outcomes you believe will happen and earn rewards if you're right.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-3xl mb-4">🏆</div>
              <h3 className="text-lg font-semibold mb-2">Win Rewards</h3>
              <p className="text-gray-600">
                Successful predictions are rewarded with USDC tokens from the market pool.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-3xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold mb-2">Decentralized</h3>
              <p className="text-gray-600">
                All markets run on smart contracts ensuring transparency and fair resolution.
              </p>
            </div>
          </div>

          <div className="mt-16 bg-blue-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
              <div>
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mb-3">1</div>
                <h4 className="font-semibold mb-2">Connect Wallet</h4>
                <p className="text-sm text-gray-600">Connect your MetaMask wallet to the Etherlink Testnet</p>
              </div>
              <div>
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mb-3">2</div>
                <h4 className="font-semibold mb-2">Browse Markets</h4>
                <p className="text-sm text-gray-600">Explore available prediction markets and their options</p>
              </div>
              <div>
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mb-3">3</div>
                <h4 className="font-semibold mb-2">Place Bets</h4>
                <p className="text-sm text-gray-600">Use USDC to buy shares in outcomes you believe will happen</p>
              </div>
              <div>
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mb-3">4</div>
                <h4 className="font-semibold mb-2">Claim Winnings</h4>
                <p className="text-sm text-gray-600">If your prediction is correct, claim your rewards from the pool</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
