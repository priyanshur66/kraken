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
  const { account, contract, provider, isConnected, connectWallet, isCorrectNetwork, switchNetwork, executeTransaction } = useWeb3();
  const { showSuccess, showError } = useToast();
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

  const mintUsdc = async () => {
    if (!provider) return;
    
    try {
      setLoading(true);
      
      await executeTransaction(
        async () => {
          const usdcAbi = [
            "function mint(uint256 amount) external"
          ];
          
          const signer = await provider.getSigner();
          const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, signer);
          
          // Mint 1000 USDC (1000 * 10^6 because USDC has 6 decimals)
          const mintAmount = ethers.parseUnits("1000", 6);
          const tx = await usdcContract.mint(mintAmount);
          return await tx.wait();
        },
        'This will mint 1,000 USDC to your wallet. Continue?',
        'USDC minted successfully!'
      );
      
      await loadUsdcBalance();
    } catch (error: any) {
      console.error('Error minting USDC:', error);
      if (error.message !== 'User cancelled') {
        showError(`Error minting USDC: ${error.message || error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const approveUsdc = async () => {
    if (!provider || !contract) return;
    
    try {
      setLoading(true);
      
      await executeTransaction(
        async () => {
          const usdcAbi = [
            "function approve(address spender, uint256 amount) returns (bool)"
          ];
          
          const signer = await provider.getSigner();
          const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, signer);
          
          // Approve a large amount (or specific amount based on your needs)
          const approveAmount = ethers.parseUnits("1000000", 6); // 1M USDC
          const tx = await usdcContract.approve(await contract.getAddress(), approveAmount);
          return await tx.wait();
        },
        'This will approve the contract to spend up to 1,000,000 USDC from your wallet. Continue?',
        'USDC approval successful!'
      );
      
      await checkAllowance();
    } catch (error: any) {
      console.error('Error approving USDC:', error);
      if (error.message !== 'User cancelled') {
        showError(`Error approving USDC: ${error.message || error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const placeBet = async () => {
    if (!contract || selectedMarket === null || !selectedOption || !betAmount) return;
    
    const market = markets.find(m => m.id === selectedMarket);
    const optionText = selectedOption === 'A' ? market?.optionA : 
                      selectedOption === 'B' ? market?.optionB : 
                      selectedOption === 'C' ? market?.optionC : 
                      market?.optionD;

    try {
      setLoading(true);
      
      await executeTransaction(
        async () => {
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
          
          return await tx.wait();
        },
        `Are you sure you want to bet ${betAmount} USDC on "${optionText}"?`,
        'Bet placed successfully!'
      );
      
      // Reset form
      setSelectedMarket(null);
      setSelectedOption('');
      setBetAmount('');
      
      // Reload balances
      loadUsdcBalance();
      checkAllowance();
    } catch (error: any) {
      console.error('Error placing bet:', error);
      if (error.message !== 'User cancelled') {
        showError(`Error placing bet: ${error.message || error}`);
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

  const isMarketActive = (market: Market) => {
    return !market.resolved && !isMarketExpired(market.endTime);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-purple-700/50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
          <h1 className="text-3xl font-bold mb-4 text-white">Prediction Markets</h1>
          <p className="mb-6 text-gray-300">Please connect your wallet to view and participate in markets.</p>
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
          <p className="mb-6 text-gray-300">Please switch to the Etherlink Testnet to access the markets.</p>
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
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Prediction Markets</h1>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <p className="text-gray-300 font-mono">Connected: {account}</p>
            <div className="text-right">
              <p className="text-sm text-gray-300">USDC Balance: {parseFloat(usdcBalance).toFixed(2)} USDC</p>
              <p className="text-sm text-gray-300">Allowance: {parseFloat(allowance).toFixed(2)} USDC</p>
              <div className="mt-3 flex gap-3 justify-end">
                <button
                  onClick={mintUsdc}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg text-sm hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 transition-all font-medium"
                >
                  {loading ? 'Minting...' : 'Mint USDC'}
                </button>
                {parseFloat(allowance) < 100 && (
                  <button
                    onClick={approveUsdc}
                    disabled={loading}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 transition-all font-medium"
                  >
                    {loading ? 'Approving...' : 'Approve USDC'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Markets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {markets.length === 0 ? (
            <div className="col-span-full bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 text-center">
              <p className="text-gray-300 text-lg">No markets available yet.</p>
            </div>
          ) : (
            markets.map((market) => (
              <div key={market.id} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3 text-white">{market.question}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-300 mb-3">
                    <span>Market ID: {market.id}</span>
                    <span>Ends: {formatDate(market.endTime)}</span>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="mb-4">
                    {market.resolved ? (
                      <span className="inline-block bg-gray-500/50 text-gray-200 px-3 py-1 rounded-lg text-sm">
                        Resolved
                      </span>
                    ) : isMarketExpired(market.endTime) ? (
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

                {/* Options */}
                <div className="space-y-3 mb-6">
                  <div className="text-sm font-medium text-gray-300">Options:</div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-white/10 rounded-lg text-gray-300">A: {market.optionA}</div>
                    <div className="p-3 bg-white/10 rounded-lg text-gray-300">B: {market.optionB}</div>
                    <div className="p-3 bg-white/10 rounded-lg text-gray-300">C: {market.optionC}</div>
                    <div className="p-3 bg-white/10 rounded-lg text-gray-300">D: {market.optionD}</div>
                  </div>
                </div>

                {/* Betting Interface */}
                {isMarketActive(market) && (
                  <div className="border-t border-white/20 pt-6">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Select Option to Bet On:
                      </label>
                      <select
                        value={selectedMarket === market.id ? selectedOption : ''}
                        onChange={(e) => {
                          setSelectedMarket(market.id);
                          setSelectedOption(e.target.value);
                        }}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 backdrop-blur-md"
                      >
                        <option value="" className="bg-gray-800">Choose an option...</option>
                        <option value="A" className="bg-gray-800">A: {market.optionA}</option>
                        <option value="B" className="bg-gray-800">B: {market.optionB}</option>
                        <option value="C" className="bg-gray-800">C: {market.optionC}</option>
                        <option value="D" className="bg-gray-800">D: {market.optionD}</option>
                      </select>
                    </div>

                    {selectedMarket === market.id && selectedOption && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Bet Amount (USDC):
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          min="0"
                          value={betAmount}
                          onChange={(e) => setBetAmount(e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 backdrop-blur-md placeholder-gray-400"
                          placeholder="Enter amount in USDC"
                        />
                      </div>
                    )}

                    {selectedMarket === market.id && selectedOption && betAmount && (
                      <button
                        onClick={placeBet}
                        disabled={loading || parseFloat(allowance) < parseFloat(betAmount)}
                        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-6 rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                      >
                        {loading ? 'Placing Bet...' : `Place Bet: ${betAmount} USDC on Option ${selectedOption}`}
                      </button>
                    )}

                    {parseFloat(allowance) < parseFloat(betAmount || '0') && betAmount && (
                      <p className="text-sm text-red-400 mt-3">
                        Insufficient allowance. Please approve USDC first.
                      </p>
                    )}
                  </div>
                )}

                {!isMarketActive(market) && (
                  <div className="border-t border-white/20 pt-6">
                    <p className="text-sm text-gray-400 text-center">
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
