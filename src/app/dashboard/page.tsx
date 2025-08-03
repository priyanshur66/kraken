'use client';

import { useState, useEffect } from 'react';
import { useWeb3 } from '@/lib/Web3Context';
import { useToast } from '@/lib/ToastContext';
import { ethers } from 'ethers';

interface UserPosition {
  marketId: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  endTime: number;
  resolved: boolean;
  outcome: number;
  userOptionAShares: string;
  userOptionBShares: string;
  userOptionCShares: string;
  userOptionDShares: string;
}

export default function DashboardPage() {
  const { account, contract, isConnected, connectWallet, isCorrectNetwork, switchNetwork, executeTransaction } = useWeb3();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [userPositions, setUserPositions] = useState<UserPosition[]>([]);
  const [claimableWinnings, setClaimableWinnings] = useState<number[]>([]);

  useEffect(() => {
    if (contract && isCorrectNetwork && account) {
      loadUserPositions();
    }
  }, [contract, isCorrectNetwork, account]);

  const loadUserPositions = async () => {
    if (!contract || !account) return;
    
    try {
      setLoading(true);
      const marketCount = await contract.marketCount();
      const userPositions: UserPosition[] = [];
      const claimable: number[] = [];
      
      for (let i = 0; i < Number(marketCount); i++) {
        // Get market info
        const marketInfo = await contract.getMarketInfo(i);
        // Get user shares
        const shares = await contract.getSharesBalance(i, account);
        
        const hasShares = shares[0] > 0 || shares[1] > 0 || shares[2] > 0 || shares[3] > 0;
        
        if (hasShares) {
          userPositions.push({
            marketId: i,
            question: marketInfo[0],
            optionA: marketInfo[1],
            optionB: marketInfo[2],
            optionC: marketInfo[3],
            optionD: marketInfo[4],
            endTime: Number(marketInfo[5]),
            outcome: Number(marketInfo[6]),
            resolved: marketInfo[11],
            userOptionAShares: ethers.formatUnits(shares[0], 6),
            userOptionBShares: ethers.formatUnits(shares[1], 6),
            userOptionCShares: ethers.formatUnits(shares[2], 6),
            userOptionDShares: ethers.formatUnits(shares[3], 6),
          });

          // Check if user can claim winnings
          if (marketInfo[11]) { // if resolved
            const outcome = Number(marketInfo[6]);
            const hasWinningShares = (
              (outcome === 1 && shares[0] > 0) ||
              (outcome === 2 && shares[1] > 0) ||
              (outcome === 3 && shares[2] > 0) ||
              (outcome === 4 && shares[3] > 0)
            );
            if (hasWinningShares) {
              claimable.push(i);
            }
          }
        }
      }
      
      setUserPositions(userPositions);
      setClaimableWinnings(claimable);
    } catch (error) {
      console.error('Error loading user positions:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimWinnings = async (marketId: number) => {
    if (!contract) return;

    try {
      setLoading(true);
      
      await executeTransaction(
        async () => {
          const tx = await contract.claimWinning(marketId);
          return await tx.wait();
        },
        'Are you sure you want to claim your winnings for this market?',
        'Winnings claimed successfully!'
      );
      
      loadUserPositions();
    } catch (error: any) {
      console.error('Error claiming winnings:', error);
      if (error.message !== 'User cancelled') {
        showError(`Error claiming winnings: ${error.message || error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getOutcomeText = (outcome: number) => {
    switch (outcome) {
      case 1: return 'Option A';
      case 2: return 'Option B';
      case 3: return 'Option C';
      case 4: return 'Option D';
      default: return 'Unresolved';
    }
  };

  const getUserWinningShares = (position: UserPosition) => {
    const outcome = position.outcome;
    switch (outcome) {
      case 1: return position.userOptionAShares;
      case 2: return position.userOptionBShares;
      case 3: return position.userOptionCShares;
      case 4: return position.userOptionDShares;
      default: return '0';
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-purple-700/50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
          <h1 className="text-3xl font-bold mb-4 text-white">Dashboard</h1>
          <p className="mb-6 text-gray-300">Please connect your wallet to view your positions.</p>
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
          <p className="mb-6 text-gray-300">Please switch to the Etherlink Testnet to view your dashboard.</p>
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

  return (
    <div className="min-h-screen bg-black relative overflow-hidden p-6">
      {/* Purple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-purple-700/50"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
      
      {/* Decorative gradient orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Your Dashboard</h1>
          <p className="text-gray-300 font-mono">Connected: {account}</p>
        </div>

        {/* Claimable Winnings */}
        {claimableWinnings.length > 0 && (
          <div className="bg-green-500/20 border border-green-400/30 p-8 rounded-2xl backdrop-blur-md mb-8">
            <h2 className="text-2xl font-bold text-green-300 mb-6">🎉 Claimable Winnings</h2>
            <div className="space-y-4">
              {claimableWinnings.map((marketId) => {
                const position = userPositions.find(p => p.marketId === marketId);
                return position ? (
                  <div key={marketId} className="flex justify-between items-center bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                    <div>
                      <p className="font-medium text-white">{position.question}</p>
                      <p className="text-sm text-green-300">
                        Winning shares: {getUserWinningShares(position)} USDC
                      </p>
                    </div>
                    <button
                      onClick={() => claimWinnings(marketId)}
                      disabled={loading}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 transition-all font-medium"
                    >
                      {loading ? 'Claiming...' : 'Claim'}
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* User Positions */}
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
          <h2 className="text-3xl font-bold mb-6 text-white">Your Positions</h2>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-300">Loading your positions...</p>
            </div>
          ) : userPositions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-300 mb-6">You don't have any positions yet.</p>
              <a
                href="/market"
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all font-medium"
              >
                Explore Markets
              </a>
            </div>
          ) : (
            <div className="space-y-8">
              {userPositions.map((position) => (
                <div key={position.marketId} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                  <div className="flex flex-col lg:flex-row justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3 text-white">{position.question}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                        <span>Market ID: {position.marketId}</span>
                        <span>End Time: {formatDate(position.endTime)}</span>
                        {position.resolved && (
                          <span className="text-green-300 font-medium">
                            Resolved: {getOutcomeText(position.outcome)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 lg:mt-0">
                      {position.resolved ? (
                        <span className="inline-block bg-gray-500/50 text-gray-200 px-3 py-1 rounded-lg text-sm">
                          Resolved
                        </span>
                      ) : Date.now() / 1000 > position.endTime ? (
                        <span className="inline-block bg-red-500/50 text-red-200 px-3 py-1 rounded-lg text-sm">
                          Expired
                        </span>
                      ) : (
                        <span className="inline-block bg-green-500/50 text-green-200 px-3 py-1 rounded-lg text-sm">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/10 p-4 rounded-xl">
                      <div className="text-sm font-medium text-gray-300 mb-2">Option A</div>
                      <div className="text-sm text-gray-400 mb-3">{position.optionA}</div>
                      <div className="text-sm font-semibold text-white">
                        {parseFloat(position.userOptionAShares).toFixed(6)} USDC
                      </div>
                    </div>
                    <div className="bg-white/10 p-4 rounded-xl">
                      <div className="text-sm font-medium text-gray-300 mb-2">Option B</div>
                      <div className="text-sm text-gray-400 mb-3">{position.optionB}</div>
                      <div className="text-sm font-semibold text-white">
                        {parseFloat(position.userOptionBShares).toFixed(6)} USDC
                      </div>
                    </div>
                    <div className="bg-white/10 p-4 rounded-xl">
                      <div className="text-sm font-medium text-gray-300 mb-2">Option C</div>
                      <div className="text-sm text-gray-400 mb-3">{position.optionC}</div>
                      <div className="text-sm font-semibold text-white">
                        {parseFloat(position.userOptionCShares).toFixed(6)} USDC
                      </div>
                    </div>
                    <div className="bg-white/10 p-4 rounded-xl">
                      <div className="text-sm font-medium text-gray-300 mb-2">Option D</div>
                      <div className="text-sm text-gray-400 mb-3">{position.optionD}</div>
                      <div className="text-sm font-semibold text-white">
                        {parseFloat(position.userOptionDShares).toFixed(6)} USDC
                      </div>
                    </div>
                  </div>

                  {position.resolved && (
                    <div className="mt-6 p-4 bg-blue-500/20 rounded-xl border border-blue-400/30">
                      <p className="text-sm text-blue-200">
                        <strong>Result:</strong> {getOutcomeText(position.outcome)} won this market.
                        {getUserWinningShares(position) !== '0' ? 
                          ` You have ${parseFloat(getUserWinningShares(position)).toFixed(6)} USDC in winning shares.` :
                          ' You did not have shares in the winning option.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}