'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MetaMaskSDK } from '@metamask/sdk';
import { ethers } from 'ethers';
import { contractAbi, contractAddress, chainId } from './constants';
import { useToast } from './ToastContext';

interface Web3ContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  contract: ethers.Contract | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isCorrectNetwork: boolean;
  switchNetwork: () => Promise<void>;
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

  useEffect(() => {
    checkConnection();
  }, []);

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
        alert('Please install MetaMask!');
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
      alert('Failed to connect wallet');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setContract(null);
    setIsConnected(false);
    setIsCorrectNetwork(false);
  };

  const switchNetwork = async () => {
    try {
      if (!window.ethereum) return;
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      
      if (provider) {
        await checkNetwork(provider);
      }
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
        } catch (addError) {
          console.error('Error adding network:', addError);
        }
      } else {
        console.error('Error switching network:', error);
      }
    }
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
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};