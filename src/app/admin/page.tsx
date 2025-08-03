'use client';

import { useState, useEffect } from 'react';
import { useWeb3 } from '@/lib/Web3Context';
import { useToast } from '@/lib/ToastContext';
import { ethers } from 'ethers';

interface Market {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  endTime: number;
  resolved: boolean;
  totalOptionAShares: string;
  totalOptionBShares: string;
  totalOptionCShares: string;
  totalOptionDShares: string;
}

export default function AdminPage() {
  const { account, contract, isConnected, connectWallet, isCorrectNetwork, switchNetwork, executeTransaction, isOwner } = useWeb3();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [markets, setMarkets] = useState<Market[]>([]);
  
  // Create Market Form State
  const [createForm, setCreateForm] = useState({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    duration: ''
  });

  useEffect(() => {
    if (contract && isCorrectNetwork) {
      loadMarkets();
    }
  }, [contract, isCorrectNetwork]);

  const loadMarkets = async () => {
    if (!contract) return;
    
    try {
      const marketCount = await contract.marketCount();
      const marketPromises = [];
      
      for (let i = 0; i < Number(marketCount); i++) {
        marketPromises.push(contract.getMarketInfo(i));
      }
      
      const marketResults = await Promise.all(marketPromises);
      const formattedMarkets: Market[] = marketResults.map((result, index) => ({
        id: index,
        question: result[0],
        optionA: result[1],
        optionB: result[2],
        optionC: result[3],
        optionD: result[4],
        endTime: Number(result[5]),
        resolved: result[11],
        totalOptionAShares: ethers.formatEther(result[7]),
        totalOptionBShares: ethers.formatEther(result[8]),
        totalOptionCShares: ethers.formatEther(result[9]),
        totalOptionDShares: ethers.formatEther(result[10]),
      }));
      
      setMarkets(formattedMarkets.reverse());
    } catch (error) {
      console.error('Error loading markets:', error);
    }
  };

  const handleCreateMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) return;

    try {
      setLoading(true);
      
      await executeTransaction(
        async () => {
          const durationInSeconds = parseInt(createForm.duration) * 60; // Convert minutes to seconds
          
          const tx = await contract.createMarket(
            createForm.question,
            createForm.optionA,
            createForm.optionB,
            createForm.optionC,
            createForm.optionD,
            durationInSeconds
          );
          
          return await tx.wait();
        },
        `Create market "${createForm.question}" with duration ${createForm.duration} minutes?`,
        'Market created successfully!'
      );
      
      // Reset form
      setCreateForm({
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        duration: ''
      });
      
      // Reload markets
      loadMarkets();
    } catch (error: any) {
      console.error('Error creating market:', error);
      if (error.message !== 'User cancelled') {
        showError(`Error creating market: ${error.message || error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResolveMarket = async (marketId: number) => {
    if (!contract) return;

    try {
      setLoading(true);
      
      await executeTransaction(
        async () => {
          const tx = await contract.resolveMarket(marketId);
          return await tx.wait();
        },
        'Are you sure you want to resolve this market? This action cannot be undone.',
        'Market resolved successfully!'
      );
      
      loadMarkets();
    } catch (error: any) {
      console.error('Error resolving market:', error);
      if (error.message !== 'User cancelled') {
        showError(`Error resolving market: ${error.message || error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const isMarketExpired = (endTime: number) => {
    return Date.now() / 1000 > endTime;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-purple-700/50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
          <h1 className="text-3xl font-bold mb-4 text-white">Admin Dashboard</h1>
          <p className="mb-6 text-gray-300">Please connect your wallet to access the admin panel.</p>
          <button
            onClick={connectWallet}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all font-medium"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-purple-700/50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
          <h1 className="text-3xl font-bold mb-4 text-white">Wrong Network</h1>
          <p className="mb-6 text-gray-300">Please switch to the Etherlink Testnet to access the admin panel.</p>
          <button
            onClick={switchNetwork}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-medium"
          >
            Switch Network
          </button>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-purple-700/50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
          <h1 className="text-3xl font-bold mb-4 text-white">Access Denied</h1>
          <p className="mb-6 text-gray-300">Only the contract owner can access the admin panel.</p>
          <p className="text-sm text-gray-400">Your wallet: {account?.slice(0, 6)}...{account?.slice(-4)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden p-6">
      {/* Purple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-purple-700/50"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
      
      {/* Decorative gradient orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Admin Dashboard</h1>
          <p className="text-gray-300 font-mono">Connected: {account}</p>
        </div>

        {/* Create Market Section */}
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-white">Create New Market</h2>
          <form onSubmit={handleCreateMarket} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Question
              </label>
              <input
                type="text"
                required
                value={createForm.question}
                onChange={(e) => setCreateForm({ ...createForm, question: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your prediction question"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Option A
                </label>
                <input
                  type="text"
                  required
                  value={createForm.optionA}
                  onChange={(e) => setCreateForm({ ...createForm, optionA: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="First option"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Option B
                </label>
                <input
                  type="text"
                  required
                  value={createForm.optionB}
                  onChange={(e) => setCreateForm({ ...createForm, optionB: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Second option"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Option C
                </label>
                <input
                  type="text"
                  required
                  value={createForm.optionC}
                  onChange={(e) => setCreateForm({ ...createForm, optionC: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Third option"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Option D
                </label>
                <input
                  type="text"
                  required
                  value={createForm.optionD}
                  onChange={(e) => setCreateForm({ ...createForm, optionD: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Fourth option"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                required
                min="1"
                value={createForm.duration}
                onChange={(e) => setCreateForm({ ...createForm, duration: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="How many minutes should this market run?"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-4 rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {loading ? 'Creating...' : 'Create Market'}
            </button>
          </form>
        </div>

        {/* Markets List Section */}
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
          <h2 className="text-3xl font-bold mb-6 text-white">All Markets</h2>
          {markets.length === 0 ? (
            <p className="text-gray-300">No markets created yet.</p>
          ) : (
            <div className="space-y-6">
              {markets.map((market) => (
                <div key={market.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{market.question}</h3>
                      <p className="text-sm text-gray-400">Market ID: {market.id}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {market.resolved ? (
                        <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm border border-green-500/30">
                          Resolved
                        </span>
                      ) : isMarketExpired(market.endTime) ? (
                        <button
                          onClick={() => handleResolveMarket(market.id)}
                          disabled={loading}
                          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 transition-all font-medium"
                        >
                          Resolve Market
                        </button>
                      ) : (
                        <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm border border-blue-500/30">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                      <div className="text-xs text-gray-400 mb-1">Option A</div>
                      <div className="font-medium text-white">{market.optionA}</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                      <div className="text-xs text-gray-400 mb-1">Option B</div>
                      <div className="font-medium text-white">{market.optionB}</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                      <div className="text-xs text-gray-400 mb-1">Option C</div>
                      <div className="font-medium text-white">{market.optionC}</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                      <div className="text-xs text-gray-400 mb-1">Option D</div>
                      <div className="font-medium text-white">{market.optionD}</div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-300">
                    <span className="mr-4">End Time: {formatDate(market.endTime)}</span>
                    {isMarketExpired(market.endTime) && !market.resolved && (
                      <span className="text-orange-400 font-medium">⚠ Ready to resolve</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}