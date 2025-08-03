'use client';

import Link from 'next/link';
import { useWeb3 } from '@/lib/Web3Context';

export default function Navbar() {
  const { account, isConnected, connectWallet, disconnectWallet, isOwner } = useWeb3();

  return (
    <nav className="bg-black/90 backdrop-blur-md border-b border-white/10 relative z-50">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-blue-300 transition-all">
              Kraken Prediction
            </Link>
            <div className="flex space-x-6">
              <Link 
                href="/market" 
                className="text-gray-300 hover:text-white transition-colors font-medium"
              >
                Markets
              </Link>
              <Link 
                href="/dashboard" 
                className="text-gray-300 hover:text-white transition-colors font-medium"
              >
                Dashboard
              </Link>
              {isOwner && (
                <Link 
                  href="/admin" 
                  className="text-gray-300 hover:text-white transition-colors font-medium"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-300 font-mono bg-white/10 px-3 py-1 rounded-lg">
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="bg-red-500/80 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-500 transition-all border border-red-400/30"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all font-medium"
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