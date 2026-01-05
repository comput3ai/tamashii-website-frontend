import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';

interface EVMProviderContextType {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  error: string | null;
}

const EVMProviderContext = createContext<EVMProviderContextType | undefined>(undefined);

interface EVMProviderProps {
  children: ReactNode;
  supportedChains: {
    [chainId: number]: {
      name: string;
      rpcUrl: string;
      blockExplorer: string;
      nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
      };
    };
  };
}

export function EVMProvider({ children, supportedChains }: EVMProviderProps) {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
  };

  // Initialize provider and check connection
  useEffect(() => {
    if (isMetaMaskInstalled()) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(web3Provider);

      // Check if already connected
      web3Provider.listAccounts().then((accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          web3Provider.getSigner().then(setSigner);
        }
      });

      // Get current chain ID
      web3Provider.getNetwork().then((network) => {
        setChainId(network.chainId);
      });

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          web3Provider.getSigner().then(setSigner);
        } else {
          setAccount(null);
          setIsConnected(false);
          setSigner(null);
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', (newChainId: string) => {
        setChainId(parseInt(newChainId, 16));
        // Reload the page to reset the provider
        window.location.reload();
      });
    }
  }, []);

  const connect = async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    try {
      setError(null);
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = web3Provider.getSigner();
        const network = await web3Provider.getNetwork();

        setProvider(web3Provider);
        setSigner(signer);
        setAccount(accounts[0]);
        setChainId(network.chainId);
        setIsConnected(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    }
  };

  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    setError(null);
  };

  const switchNetwork = async (targetChainId: number) => {
    if (!window.ethereum) {
      setError('MetaMask is not installed');
      return;
    }

    try {
      setError(null);
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (err: any) {
      // If the chain doesn't exist, try to add it
      if (err.code === 4902) {
        const chainConfig = supportedChains[targetChainId];
        if (chainConfig) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${targetChainId.toString(16)}`,
                  chainName: chainConfig.name,
                  rpcUrls: [chainConfig.rpcUrl],
                  blockExplorerUrls: [chainConfig.blockExplorer],
                  nativeCurrency: chainConfig.nativeCurrency,
                },
              ],
            });
          } catch (addErr: any) {
            setError(addErr.message || 'Failed to add network');
          }
        } else {
          setError('Unsupported network');
        }
      } else {
        setError(err.message || 'Failed to switch network');
      }
    }
  };

  const value: EVMProviderContextType = {
    provider,
    signer,
    account,
    chainId,
    isConnected,
    connect,
    disconnect,
    switchNetwork,
    error,
  };

  return (
    <EVMProviderContext.Provider value={value}>
      {children}
    </EVMProviderContext.Provider>
  );
}

export function useEVM() {
  const context = useContext(EVMProviderContext);
  if (context === undefined) {
    throw new Error('useEVM must be used within an EVMProvider');
  }
  return context;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}
