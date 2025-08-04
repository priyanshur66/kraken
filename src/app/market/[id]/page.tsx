'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWeb3 } from '@/lib/Web3Context';
import { useToast } from '@/lib/ToastContext';
import { ethers } from 'ethers';
import { usdcAddress } from '@/lib/constants';
import Comments from '@/components/Comments';
import Link from 'next/link';

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
  totalOptionAShares: string;
  totalOptionBShares: string;
  totalOptionCShares: string;
  totalOptionDShares: string;
}

export default function MarketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const marketId = parseInt(params.id as string);
  
  const { account, contract, provider, isConnected, connectWallet, isCorrectNetwork, switchNetwork, executeTransaction } = useWeb3();
  const { showSuccess, showError } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [market, setMarket] = useState<Market | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [betAmount, setBetAmount] = useState('');
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [allowance, setAllowance] = useState('0');
  const [userShares, setUserShares] = useState({
    optionA: '0',
    optionB: '0',
    optionC: '0',
    optionD: '0'
  });

  useEffect(() => {
    if (contract && isCorrectNetwork && !isNaN(marketId)) {
      loadMarket();
      if (account) {
        loadUsdcBalance();
        checkAllowance();
        loadUserShares();
      }
    }
  }, [contract, isCorrectNetwork, account, marketId]);

  const loadMarket = async () => {
    if (!contract || isNaN(marketId)) return;
    
    try {
      setLoading(true);
      const result = await contract.getMarketInfo(marketId);
      
      const formattedMarket: Market = {
        id: marketId,
        question: result[0],
        optionA: result[1],
        optionB: result[2],
        optionC: result[3],
        optionD: result[4],
        endTime: Number(result[5]),
        outcome: Number(result[6]),
        totalOptionAShares: ethers.formatEther(result[7]),
        totalOptionBShares: ethers.formatEther(result[8]),
        totalOptionCShares: ethers.formatEther(result[9]),
        totalOptionDShares: ethers.formatEther(result[10]),
        resolved: result[11],
      };
      
      setMarket(formattedMarket);
    } catch (error) {
      console.error('Error loading market:', error);
      showError('Market not found');
      router.push('/market');
    } finally {
      setLoading(false);
    }
  };

  const loadUsdcBalance = async () => {
    if (!provider || !account) return;
    
    try {
      const usdcAbi = [
        "function balanceOf(address owner) view returns (uint256)"
      ];
      
      const signer = await provider.getSigner();
      const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, signer);
      const balance = await usdcContract.balanceOf(account);
      setUsdcBalance(ethers.formatUnits(balance, 6));
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

  const loadUserShares = async () => {
    if (!contract || !account || isNaN(marketId)) return;
    
    try {
      const [sharesA, sharesB, sharesC, sharesD] = await Promise.all([
        contract.getUserShares(marketId, account, true, false, false, false),
        contract.getUserShares(marketId, account, false, true, false, false),
        contract.getUserShares(marketId, account, false, false, true, false),
        contract.getUserShares(marketId, account, false, false, false, true)
      ]);
      
      setUserShares({
        optionA: ethers.formatEther(sharesA),
        optionB: ethers.formatEther(sharesB),
        optionC: ethers.formatEther(sharesC),
        optionD: ethers.formatEther(sharesD)
      });
    } catch (error) {
      console.error('Error loading user shares:', error);
    }
  };

  const mintUsdc = async () => {
    if (!provider) return;
    
    try {
      setLoading(true);
      
      await executeTransaction(
        async () => {
          const usdcAbi = [
            "function mint(address to, uint256 amount) returns (bool)"
          ];
          
          const signer = await provider.getSigner();
          const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, signer);
          
          const mintAmount = ethers.parseUnits("1000", 6);
          const tx = await usdcContract.mint(account, mintAmount);
          
          return await tx.wait();
        },
        'Are you sure you want to mint 1000 USDC?',
        '1000 USDC minted successfully!'
      );
      
      loadUsdcBalance();
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
          
          const approveAmount = ethers.parseUnits("1000000", 6);
          const tx = await usdcContract.approve(await contract.getAddress(), approveAmount);
          
          return await tx.wait();
        },
        'Are you sure you want to approve USDC spending?',
        'USDC approval successful!'
      );
      
      checkAllowance();
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
    if (!contract || !selectedOption || !betAmount || !market) return;
    
    const optionText = selectedOption === 'A' ? market.optionA : 
                      selectedOption === 'B' ? market.optionB : 
                      selectedOption === 'C' ? market.optionC : 
                      market.optionD;

    try {
      setLoading(true);
      
      await executeTransaction(
        async () => {
          const amount = ethers.parseUnits(betAmount, 6);
          
          const isOptionA = selectedOption === 'A';
          const isOptionB = selectedOption === 'B';
          const isOptionC = selectedOption === 'C';
          const isOptionD = selectedOption === 'D';
          
          const tx = await contract.buyShares(
            marketId,
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
      
      // Reset form and reload data
      setSelectedOption('');
      setBetAmount('');
      loadMarket();
      loadUsdcBalance();
      checkAllowance();
      loadUserShares();
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

  const getMarketStatus = (market: Market) => {
    if (market.resolved) {
      return { text: 'Resolved', className: 'bg-gray-500/50 text-gray-200' };
    } else if (isMarketExpired(market.endTime)) {
      return { text: 'Expired', className: 'bg-red-500/50 text-red-200' };
    } else {
      return { text: 'Active', className: 'bg-green-500/50 text-green-200' };
    }
  };

  const getTotalShares = () => {
    if (!market) return '0';
    return (
      parseFloat(market.totalOptionAShares) +
      parseFloat(market.totalOptionBShares) +
      parseFloat(market.totalOptionCShares) +
      parseFloat(market.totalOptionDShares)
    ).toFixed(2);
  };

  const getOptionPercentage = (shares: string) => {
    const totalShares = parseFloat(getTotalShares());
    if (totalShares === 0) return '0';
    return ((parseFloat(shares) / totalShares) * 100).toFixed(1);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-purple-700/50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
          <h1 className="text-3xl font-bold mb-4 text-white">Prediction Market</h1>
          <p className="mb-6 text-gray-300">Please connect your wallet to view and participate in this market.</p>
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
          <p className="mb-6 text-gray-300">Please switch to the Etherlink Testnet to access this market.</p>
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

  if (loading && !market) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-purple-700/50"></div>
        <div className="text-white text-lg">Loading market...</div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-purple-700/50"></div>
        <div className="relative z-10 bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
          <h1 className="text-3xl font-bold mb-4 text-white">Market Not Found</h1>
          <p className="mb-6 text-gray-300">The requested market could not be found.</p>
          <Link
            href="/market"
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all font-medium inline-block"
          >
            Back to Markets
          </Link>
        </div>
      </div>
    );
  }

  const status = getMarketStatus(market);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden p-6">
      {/* Purple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-purple-700/50"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
      
      {/* Decorative gradient orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/market"
              className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
            >
              ← Back to Markets
            </Link>
            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${status.className}`}>
              {status.text}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold mb-4 text-white">
            {market.question}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Market ID:</span>
              <span className="text-white ml-2">#{market.id}</span>
            </div>
            <div>
              <span className="text-gray-400">Ends:</span>
              <span className="text-white ml-2">{formatDate(market.endTime)}</span>
            </div>
            <div>
              <span className="text-gray-400">Total Pool:</span>
              <span className="text-white ml-2">{getTotalShares()} USDC</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Market Options */}
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <h2 className="text-xl font-semibold mb-4 text-white">Market Options</h2>
            
            <div className="space-y-4">
              {[
                { key: 'A', text: market.optionA, shares: market.totalOptionAShares },
                { key: 'B', text: market.optionB, shares: market.totalOptionBShares },
                { key: 'C', text: market.optionC, shares: market.totalOptionCShares },
                { key: 'D', text: market.optionD, shares: market.totalOptionDShares }
              ].map((option) => (
                <div key={option.key} className="p-4 bg-white/10 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">
                      {option.key}: {option.text}
                    </span>
                    
                  </div>
                  
                  
                </div>
              ))}
            </div>
          </div>

          {/* Betting Interface */}
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Place Your Bet</h2>
              <div className="text-right text-sm">
                <div className="text-gray-300">Balance: {parseFloat(usdcBalance).toFixed(2)} USDC</div>
                <div className="text-gray-300">Allowance: {parseFloat(allowance).toFixed(2)} USDC</div>
              </div>
            </div>

            {/* USDC Actions */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={mintUsdc}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg text-sm hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 transition-all font-medium"
              >
                {loading ? 'Minting...' : 'Mint USDC'}
              </button>
              {parseFloat(allowance) < 100 && (
                <button
                  onClick={approveUsdc}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 transition-all font-medium"
                >
                  {loading ? 'Approving...' : 'Approve USDC'}
                </button>
              )}
            </div>

            {isMarketActive(market) ? (
              <div className="space-y-4">
                {/* Option Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Option:
                  </label>
                  <select
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 backdrop-blur-md"
                  >
                    <option value="" className="bg-gray-800">Choose an option...</option>
                    <option value="A" className="bg-gray-800">A: {market.optionA}</option>
                    <option value="B" className="bg-gray-800">B: {market.optionB}</option>
                    <option value="C" className="bg-gray-800">C: {market.optionC}</option>
                    <option value="D" className="bg-gray-800">D: {market.optionD}</option>
                  </select>
                </div>

                {/* Bet Amount */}
                {selectedOption && (
                  <div>
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

                {/* Place Bet Button */}
                {selectedOption && betAmount && (
                  <button
                    onClick={placeBet}
                    disabled={loading || parseFloat(allowance) < parseFloat(betAmount)}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-6 rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                  >
                    {loading ? 'Placing Bet...' : `Place Bet: ${betAmount} USDC on Option ${selectedOption}`}
                  </button>
                )}

                {parseFloat(allowance) < parseFloat(betAmount || '0') && betAmount && (
                  <p className="text-sm text-red-400">
                    Insufficient allowance. Please approve USDC first.
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">
                  {market.resolved ? 'This market has been resolved.' : 'This market has expired.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Your Positions */}
        {account && (parseFloat(userShares.optionA) > 0 || parseFloat(userShares.optionB) > 0 || parseFloat(userShares.optionC) > 0 || parseFloat(userShares.optionD) > 0) && (
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 mt-8">
            <h2 className="text-xl font-semibold mb-4 text-white">Your Positions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'A', text: market.optionA, shares: userShares.optionA },
                { key: 'B', text: market.optionB, shares: userShares.optionB },
                { key: 'C', text: market.optionC, shares: userShares.optionC },
                { key: 'D', text: market.optionD, shares: userShares.optionD }
              ].map((position) => (
                parseFloat(position.shares) > 0 && (
                  <div key={position.key} className="p-4 bg-white/10 rounded-lg text-center">
                    <div className="text-white font-medium mb-1">Option {position.key}</div>
                    <div className="text-purple-400 font-bold">{parseFloat(position.shares).toFixed(4)} shares</div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <Comments marketId={marketId} />
      </div>
    </div>
  );
}
