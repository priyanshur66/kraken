'use client';

import Link from 'next/link';
import { useWeb3 } from '@/lib/Web3Context';

export default function Navbar() {
  const { account, isConnected, connectWallet, disconnectWallet, isOwner } = useWeb3();

  return (
    <nav className="relative z-50">
      {/* Background with gradient similar to admin page */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-purple-700/30"></div>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
      <div className="absolute inset-0 border-b border-white/20"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-blue-300 transition-all">
              Kraken Prediction
            </Link>
            <div className="flex space-x-6">
              <Link 
                href="/market" 
                className="text-gray-300 hover:text-white transition-colors font-medium hover:bg-white/10 px-3 py-2 rounded-lg"
              >
                Markets
              </Link>
              <Link 
                href="/dashboard" 
                className="text-gray-300 hover:text-white transition-colors font-medium hover:bg-white/10 px-3 py-2 rounded-lg"
              >
                Dashboard
              </Link>
              {isOwner && (
                <Link 
                  href="/admin" 
                  className="text-gray-300 hover:text-white transition-colors font-medium hover:bg-white/10 px-3 py-2 rounded-lg"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-300 font-mono bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="bg-gradient-to-r from-red-500/80 to-red-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm hover:from-red-500 hover:to-red-600 transition-all border border-red-400/30"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all font-medium backdrop-blur-sm border border-purple-400/30"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}