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
  const { account, contract, isConnected, connectWallet, isCorrectNetwork, switchNetwork, executeTransaction } = useWeb3();
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
      
      setMarkets(formattedMarkets);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
          <p className="mb-4">Please connect your wallet to access the admin panel.</p>
          <button
            onClick={connectWallet}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Wrong Network</h1>
          <p className="mb-4">Please switch to the Etherlink Testnet to access the admin panel.</p>
          <button
            onClick={switchNetwork}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Switch Network
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Connected: {account}</p>
        </div>

        {/* Create Market Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-bold mb-4">Create New Market</h2>
          <form onSubmit={handleCreateMarket} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question
              </label>
              <input
                type="text"
                required
                value={createForm.question}
                onChange={(e) => setCreateForm({ ...createForm, question: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your prediction question"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Option A
                </label>
                <input
                  type="text"
                  required
                  value={createForm.optionA}
                  onChange={(e) => setCreateForm({ ...createForm, optionA: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="First option"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Option B
                </label>
                <input
                  type="text"
                  required
                  value={createForm.optionB}
                  onChange={(e) => setCreateForm({ ...createForm, optionB: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Second option"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Option C
                </label>
                <input
                  type="text"
                  required
                  value={createForm.optionC}
                  onChange={(e) => setCreateForm({ ...createForm, optionC: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Third option"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Option D
                </label>
                <input
                  type="text"
                  required
                  value={createForm.optionD}
                  onChange={(e) => setCreateForm({ ...createForm, optionD: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Fourth option"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                required
                min="1"
                value={createForm.duration}
                onChange={(e) => setCreateForm({ ...createForm, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="How many minutes should this market run?"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Market'}
            </button>
          </form>
        </div>

        {/* Markets List Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">All Markets</h2>
          {markets.length === 0 ? (
            <p className="text-gray-500">No markets created yet.</p>
          ) : (
            <div className="space-y-4">
              {markets.map((market) => (
                <div key={market.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">{market.question}</h3>
                      <p className="text-sm text-gray-500">Market ID: {market.id}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {market.resolved ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                          Resolved
                        </span>
                      ) : isMarketExpired(market.endTime) ? (
                        <button
                          onClick={() => handleResolveMarket(market.id)}
                          disabled={loading}
                          className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 disabled:opacity-50"
                        >
                          Resolve Market
                        </button>
                      ) : (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">Option A</div>
                      <div className="font-medium">{market.optionA}</div>
                      <div className="text-xs text-blue-600">{market.totalOptionAShares} USDC</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">Option B</div>
                      <div className="font-medium">{market.optionB}</div>
                      <div className="text-xs text-blue-600">{market.totalOptionBShares} USDC</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">Option C</div>
                      <div className="font-medium">{market.optionC}</div>
                      <div className="text-xs text-blue-600">{market.totalOptionCShares} USDC</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">Option D</div>
                      <div className="font-medium">{market.optionD}</div>
                      <div className="text-xs text-blue-600">{market.totalOptionDShares} USDC</div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="mr-4">End Time: {formatDate(market.endTime)}</span>
                    {isMarketExpired(market.endTime) && !market.resolved && (
                      <span className="text-orange-600 font-medium">⚠ Ready to resolve</span>
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