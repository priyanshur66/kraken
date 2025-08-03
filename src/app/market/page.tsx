'use client';

import { useState, useEffect } from 'react';
import { useWeb3 } from '@/lib/Web3Context';
import { useToast } from '@/lib/ToastContext';
import { ethers } from 'ethers';
import { usdcAddress } from '@/lib/constants';

interface Market {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  endTime: number;
  resolved: boolean;
  outcome: number;
}

export default function MarketPage() {
  const { account, contract, provider, isConnected, connectWallet, isCorrectNetwork, switchNetwork } = useWeb3();
  const { showSuccess, showError, showConfirm } = useToast();
  const [loading, setLoading] = useState(false);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [betAmount, setBetAmount] = useState('');
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [allowance, setAllowance] = useState('0');

  useEffect(() => {
    if (contract && isCorrectNetwork) {
      loadMarkets();
      if (account) {
        loadUsdcBalance();
        checkAllowance();
      }
    }
  }, [contract, isCorrectNetwork, account]);

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
        outcome: Number(result[6]),
        resolved: result[11],
      }));
      
      setMarkets(formattedMarkets);
    } catch (error) {
      console.error('Error loading markets:', error);
    }
  };

  const loadUsdcBalance = async () => {
    if (!provider || !account) return;
    
    try {
      const usdcAbi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function allowance(address owner, address spender) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)"
      ];
      
      const signer = await provider.getSigner();
      const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, signer);
      const balance = await usdcContract.balanceOf(account);
      setUsdcBalance(ethers.formatUnits(balance, 6)); // USDC has 6 decimals
    } catch (error) {
      console.error('Error loading USDC balance:', error);
    }
  };

  const checkAllowance = async () => {
    if (!provider || !account || !contract) return;
    
    try {
      const usdcAbi = [
        "function allowance(address owner, address spender) view returns (uint256)"
      ];
      
      const signer = await provider.getSigner();
      const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, signer);
      const currentAllowance = await usdcContract.allowance(account, await contract.getAddress());
      setAllowance(ethers.formatUnits(currentAllowance, 6));
    } catch (error) {
      console.error('Error checking allowance:', error);
    }
  };

  const approveUsdc = async () => {
    if (!provider || !contract) return;
    
    showConfirm(
      'This will approve the contract to spend up to 1,000,000 USDC from your wallet. Continue?',
      async () => {
        try {
          setLoading(true);
          const usdcAbi = [
            "function approve(address spender, uint256 amount) returns (bool)"
          ];
          
          const signer = await provider.getSigner();
          const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, signer);
          
          // Approve a large amount (or specific amount based on your needs)
          const approveAmount = ethers.parseUnits("1000000", 6); // 1M USDC
          const tx = await usdcContract.approve(await contract.getAddress(), approveAmount);
          await tx.wait();
          
          showSuccess('USDC approval successful!');
          await checkAllowance();
        } catch (error: any) {
          console.error('Error approving USDC:', error);
          showError(`Error approving USDC: ${error.message || error}`);
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const placeBet = async () => {
    if (!contract || selectedMarket === null || !selectedOption || !betAmount) return;
    
    const market = markets.find(m => m.id === selectedMarket);
    const optionText = selectedOption === 'A' ? market?.optionA : 
                      selectedOption === 'B' ? market?.optionB : 
                      selectedOption === 'C' ? market?.optionC : 
                      market?.optionD;

    showConfirm(
      `Are you sure you want to bet ${betAmount} USDC on "${optionText}"?`,
      async () => {
        try {
          setLoading(true);
          
          // Convert bet amount to USDC format (6 decimals)
          const amount = ethers.parseUnits(betAmount, 6);
          
          // Determine which option is selected
          const isOptionA = selectedOption === 'A';
          const isOptionB = selectedOption === 'B';
          const isOptionC = selectedOption === 'C';
          const isOptionD = selectedOption === 'D';
          
          const tx = await contract.buyShares(
            selectedMarket,
            isOptionA,
            isOptionB,
            isOptionC,
            isOptionD,
            amount
          );
          
          await tx.wait();
          showSuccess('Bet placed successfully!');
          
          // Reset form
          setSelectedMarket(null);
          setSelectedOption('');
          setBetAmount('');
          
          // Reload balances
          loadUsdcBalance();
          checkAllowance();
        } catch (error: any) {
          console.error('Error placing bet:', error);
          showError(`Error placing bet: ${error.message || error}`);
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const isMarketExpired = (endTime: number) => {
    return Date.now() / 1000 > endTime;
  };

  const isMarketActive = (market: Market) => {
    return !market.resolved && !isMarketExpired(market.endTime);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Prediction Markets</h1>
          <p className="mb-4">Please connect your wallet to view and participate in markets.</p>
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
          <p className="mb-4">Please switch to the Etherlink Testnet to access the markets.</p>
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
          <h1 className="text-3xl font-bold mb-2">Prediction Markets</h1>
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Connected: {account}</p>
            <div className="text-right">
              <p className="text-sm text-gray-500">USDC Balance: {parseFloat(usdcBalance).toFixed(2)} USDC</p>
              <p className="text-sm text-gray-500">Allowance: {parseFloat(allowance).toFixed(2)} USDC</p>
              {parseFloat(allowance) < 100 && (
                <button
                  onClick={approveUsdc}
                  disabled={loading}
                  className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 disabled:opacity-50"
                >
                  {loading ? 'Approving...' : 'Approve USDC'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Markets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {markets.length === 0 ? (
            <div className="col-span-full bg-white p-8 rounded-lg shadow-md text-center">
              <p className="text-gray-500">No markets available yet.</p>
            </div>
          ) : (
            markets.map((market) => (
              <div key={market.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">{market.question}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <span>Market ID: {market.id}</span>
                    <span>Ends: {formatDate(market.endTime)}</span>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="mb-3">
                    {market.resolved ? (
                      <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                        Resolved
                      </span>
                    ) : isMarketExpired(market.endTime) ? (
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

                {/* Options */}
                <div className="space-y-2 mb-4">
                  <div className="text-sm font-medium text-gray-700">Options:</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-gray-50 rounded">A: {market.optionA}</div>
                    <div className="p-2 bg-gray-50 rounded">B: {market.optionB}</div>
                    <div className="p-2 bg-gray-50 rounded">C: {market.optionC}</div>
                    <div className="p-2 bg-gray-50 rounded">D: {market.optionD}</div>
                  </div>
                </div>

                {/* Betting Interface */}
                {isMarketActive(market) && (
                  <div className="border-t pt-4">
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Option to Bet On:
                      </label>
                      <select
                        value={selectedMarket === market.id ? selectedOption : ''}
                        onChange={(e) => {
                          setSelectedMarket(market.id);
                          setSelectedOption(e.target.value);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Choose an option...</option>
                        <option value="A">A: {market.optionA}</option>
                        <option value="B">B: {market.optionB}</option>
                        <option value="C">C: {market.optionC}</option>
                        <option value="D">D: {market.optionD}</option>
                      </select>
                    </div>

                    {selectedMarket === market.id && selectedOption && (
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bet Amount (USDC):
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          min="0"
                          value={betAmount}
                          onChange={(e) => setBetAmount(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter amount in USDC"
                        />
                      </div>
                    )}

                    {selectedMarket === market.id && selectedOption && betAmount && (
                      <button
                        onClick={placeBet}
                        disabled={loading || parseFloat(allowance) < parseFloat(betAmount)}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Placing Bet...' : `Place Bet: ${betAmount} USDC on Option ${selectedOption}`}
                      </button>
                    )}

                    {parseFloat(allowance) < parseFloat(betAmount || '0') && betAmount && (
                      <p className="text-sm text-red-500 mt-2">
                        Insufficient allowance. Please approve USDC first.
                      </p>
                    )}
                  </div>
                )}

                {!isMarketActive(market) && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-500 text-center">
                      {market.resolved ? 'This market has been resolved.' : 'This market has expired.'}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
