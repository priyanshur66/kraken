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
  const { account, contract, isConnected, connectWallet, isCorrectNetwork, switchNetwork } = useWeb3();
  const { showSuccess, showError, showConfirm } = useToast();
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

    showConfirm(
      'Are you sure you want to claim your winnings for this market?',
      async () => {
        try {
          setLoading(true);
          const tx = await contract.claimWinning(marketId);
          await tx.wait();
          showSuccess('Winnings claimed successfully!');
          loadUserPositions();
        } catch (error: any) {
          console.error('Error claiming winnings:', error);
          showError(`Error claiming winnings: ${error.message || error}`);
        } finally {
          setLoading(false);
        }
      }
    );
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <p className="mb-4">Please connect your wallet to view your positions.</p>
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
          <p className="mb-4">Please switch to the Etherlink Testnet to view your dashboard.</p>
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
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h1 className="text-3xl font-bold mb-2">Your Dashboard</h1>
          <p className="text-gray-600">Connected: {account}</p>
        </div>

        {/* Claimable Winnings */}
        {claimableWinnings.length > 0 && (
          <div className="bg-green-50 border border-green-200 p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold text-green-800 mb-4">🎉 Claimable Winnings</h2>
            <div className="space-y-3">
              {claimableWinnings.map((marketId) => {
                const position = userPositions.find(p => p.marketId === marketId);
                return position ? (
                  <div key={marketId} className="flex justify-between items-center bg-white p-4 rounded">
                    <div>
                      <p className="font-medium">{position.question}</p>
                      <p className="text-sm text-gray-600">
                        Winning shares: {getUserWinningShares(position)} USDC
                      </p>
                    </div>
                    <button
                      onClick={() => claimWinnings(marketId)}
                      disabled={loading}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
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
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Your Positions</h2>
          {loading ? (
            <div className="text-center py-8">
              <p>Loading your positions...</p>
            </div>
          ) : userPositions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You don't have any positions yet.</p>
              <a
                href="/market"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Explore Markets
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {userPositions.map((position) => (
                <div key={position.marketId} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{position.question}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Market ID: {position.marketId}</span>
                        <span>End Time: {formatDate(position.endTime)}</span>
                        {position.resolved && (
                          <span className="text-green-600 font-medium">
                            Resolved: {getOutcomeText(position.outcome)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {position.resolved ? (
                        <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                          Resolved
                        </span>
                      ) : Date.now() / 1000 > position.endTime ? (
                        <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                          Expired
                        </span>
                      ) : (
                        <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm font-medium text-gray-700 mb-1">Option A</div>
                      <div className="text-sm text-gray-600 mb-2">{position.optionA}</div>
                      <div className="text-sm font-semibold">
                        {parseFloat(position.userOptionAShares).toFixed(6)} USDC
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm font-medium text-gray-700 mb-1">Option B</div>
                      <div className="text-sm text-gray-600 mb-2">{position.optionB}</div>
                      <div className="text-sm font-semibold">
                        {parseFloat(position.userOptionBShares).toFixed(6)} USDC
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm font-medium text-gray-700 mb-1">Option C</div>
                      <div className="text-sm text-gray-600 mb-2">{position.optionC}</div>
                      <div className="text-sm font-semibold">
                        {parseFloat(position.userOptionCShares).toFixed(6)} USDC
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm font-medium text-gray-700 mb-1">Option D</div>
                      <div className="text-sm text-gray-600 mb-2">{position.optionD}</div>
                      <div className="text-sm font-semibold">
                        {parseFloat(position.userOptionDShares).toFixed(6)} USDC
                      </div>
                    </div>
                  </div>

                  {position.resolved && (
                    <div className="mt-4 p-3 bg-blue-50 rounded">
                      <p className="text-sm text-blue-800">
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