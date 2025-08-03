'use client';

import Link from 'next/link';
import { useWeb3 } from '@/lib/Web3Context';

export default function Navbar() {
  const { account, isConnected, connectWallet, disconnectWallet } = useWeb3();

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-xl font-bold text-gray-800 hover:text-blue-600">
              Kraken Prediction
            </Link>
            <div className="flex space-x-4">
              <Link 
                href="/market" 
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Markets
              </Link>
              <Link 
                href="/dashboard" 
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/admin" 
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Admin
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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