'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MetaMaskSDK } from '@metamask/sdk';
import { ethers } from 'ethers';
import { contractAbi, contractAddress, chainId } from './constants';
import toast from 'react-hot-toast';

interface Web3ContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  contract: ethers.Contract | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isCorrectNetwork: boolean;
  switchNetwork: () => Promise<void>;
  isOwner: boolean;
  checkOwnership: () => Promise<void>;
  executeTransaction: (
    transactionFn: () => Promise<any>,
    confirmationMessage: string,
    successMessage: string,
    retries?: number
  ) => Promise<any>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    checkConnection();
    
    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected wallet
          disconnectWallet();
          toast('Wallet disconnected', { icon: 'ℹ️' });
        } else if (accounts[0] !== account) {
          // Account changed - you can choose between refresh or graceful update
          
          // Option 1: Graceful update (recommended)
          try {
            if (window.ethereum) {
              const web3Provider = new ethers.BrowserProvider(window.ethereum);
              const signer = await web3Provider.getSigner();
              const newAddress = await signer.getAddress();
              
              setAccount(newAddress);
              setProvider(web3Provider);
              setIsConnected(true);
              
              const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
              setContract(contractInstance);
              
              await checkNetwork(web3Provider);
              toast.success(`Switched to account: ${newAddress.slice(0, 6)}...${newAddress.slice(-4)}`);
            }
          } catch (error) {
            console.error('Error updating account:', error);
            // Fallback to page refresh if graceful update fails
            window.location.reload();
          }
          
          // Option 2: Full page refresh (uncomment if you prefer this)
          // window.location.reload();
        }
      };

      const handleChainChanged = (chainId: string) => {
        // Chain changed, refresh to update network state
        toast('Network changed, refreshing page...', { icon: 'ℹ️' });
        setTimeout(() => window.location.reload(), 1000);
      };

      // Add event listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Cleanup event listeners
      return () => {
        if (window.ethereum && window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [account]);

  useEffect(() => {
    if (contract && account && isCorrectNetwork) {
      checkOwnership();
    } else {
      setIsOwner(false);
    }
  }, [contract, account, isCorrectNetwork]);

  const checkOwnership = async () => {
    if (!contract || !account) {
      setIsOwner(false);
      return;
    }

    try {
      const contractOwner = await contract.owner();
      setIsOwner(contractOwner.toLowerCase() === account.toLowerCase());
    } catch (error) {
      console.error('Error checking ownership:', error);
      setIsOwner(false);
    }
  };

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await web3Provider.listAccounts();
        
        if (accounts.length > 0) {
          setAccount(accounts[0].address);
          setProvider(web3Provider);
          setIsConnected(true);
          
          const signer = await web3Provider.getSigner();
          const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
          setContract(contractInstance);
          
          await checkNetwork(web3Provider);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const checkNetwork = async (web3Provider: ethers.BrowserProvider) => {
    try {
      const network = await web3Provider.getNetwork();
      setIsCorrectNetwork(Number(network.chainId) === chainId);
    } catch (error) {
      console.error('Error checking network:', error);
      setIsCorrectNetwork(false);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast.error('Please install MetaMask!');
        return;
      }

      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      await web3Provider.send('eth_requestAccounts', []);
      
      const signer = await web3Provider.getSigner();
      const address = await signer.getAddress();
      
      setAccount(address);
      setProvider(web3Provider);
      setIsConnected(true);
      
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
      setContract(contractInstance);
      
      await checkNetwork(web3Provider);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setContract(null);
    setIsConnected(false);
    setIsCorrectNetwork(false);
    setIsOwner(false);
  };

  const switchNetwork = async () => {
    try {
      if (!window.ethereum) {
        toast.error('MetaMask not detected');
        return;
      }
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      
      if (provider) {
        await checkNetwork(provider);
      }
      toast.success('Network switched successfully');
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await window.ethereum?.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${chainId.toString(16)}`,
              chainName: 'Etherlink Testnet',
              nativeCurrency: {
                name: 'XTZ',
                symbol: 'XTZ',
                decimals: 18,
              },
              rpcUrls: ['https://node.ghostnet.etherlink.com'],
              blockExplorerUrls: ['https://testnet.explorer.etherlink.com'],
            }],
          });
          toast.success('Network added and switched successfully');
        } catch (addError) {
          console.error('Error adding network:', addError);
          toast.error('Failed to add network');
        }
      } else if (error.code === 4001) {
        toast.error('User rejected network switch');
      } else {
        console.error('Error switching network:', error);
        toast.error('Failed to switch network');
      }
    }
  };

  // Enhanced transaction wrapper with retry logic for circuit breaker errors
  const executeTransaction = async (
    transactionFn: () => Promise<any>,
    confirmationMessage: string,
    successMessage: string,
    retries: number = 3
  ) => {
    return new Promise((resolve, reject) => {
      toast((t) => (
        <div className="flex flex-col space-y-3">
          <span>{confirmationMessage}</span>
          <div className="flex space-x-2">
            <button
              className="bg-blue-500 text-teal px-3 py-1 rounded text-sm hover:bg-blue-600"
              onClick={async () => {
                toast.dismiss(t.id);
                let lastError;
                
                for (let i = 0; i < retries; i++) {
                  try {
                    const result = await transactionFn();
                    toast.success(successMessage);
                    resolve(result);
                    return;
                  } catch (error: any) {
                    lastError = error;
                    console.error(`Transaction attempt ${i + 1} failed:`, error);
                    
                    // Check for circuit breaker error
                    if (error.message?.includes('circuit breaker') || 
                        error.code === 'UNKNOWN_ERROR' ||
                        error.message?.includes('Execution prevented')) {
                      
                      if (i < retries - 1) {
                        toast.loading(`Transaction failed, retrying... (${i + 2}/${retries})`);
                        // Wait before retry
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        continue;
                      } else {
                        toast.error('MetaMask connectivity issue. Please try again later or refresh the page.');
                      }
                    } else if (error.code === 4001) {
                      toast.error('Transaction rejected by user');
                    } else {
                      toast.error(`Transaction failed: ${error.message || error}`);
                    }
                    break;
                  }
                }
                reject(lastError);
              }}
            >
              Confirm
            </button>
            <button
              className="bg-gray-500 text-red px-3 py-1 rounded text-sm hover:bg-gray-600"
              onClick={() => {
                toast.dismiss(t.id);
                reject(new Error('User cancelled'));
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ), {
        duration: Infinity,
      });
    });
  };

  const value: Web3ContextType = {
    account,
    provider,
    contract,
    isConnected,
    connectWallet,
    disconnectWallet,
    isCorrectNetwork,
    switchNetwork,
    isOwner,
    checkOwnership,
    executeTransaction,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
