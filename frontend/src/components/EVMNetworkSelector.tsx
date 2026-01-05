import React from 'react';
import { useEVM } from '../providers/EVMProvider';

interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

const SUPPORTED_NETWORKS: { [key: string]: NetworkConfig } = {
  base: {
    chainId: 8453,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  baseSepolia: {
    chainId: 84532,
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  bnb: {
    chainId: 56,
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    blockExplorer: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
  },
  bnbTestnet: {
    chainId: 97,
    name: 'BNB Testnet',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    blockExplorer: 'https://testnet.bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
  },
  ethereum: {
    chainId: 1,
    name: 'Ethereum',
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
};

interface EVMNetworkSelectorProps {
  className?: string;
  onNetworkChange?: (network: NetworkConfig) => void;
}

export function EVMNetworkSelector({ className, onNetworkChange }: EVMNetworkSelectorProps) {
  const { chainId, switchNetwork, isConnected } = useEVM();

  const handleNetworkChange = async (networkKey: string) => {
    const network = SUPPORTED_NETWORKS[networkKey];
    if (network) {
      await switchNetwork(network.chainId);
      onNetworkChange?.(network);
    }
  };

  const getCurrentNetworkName = () => {
    if (!chainId) return 'Unknown';
    
    const network = Object.values(SUPPORTED_NETWORKS).find(n => n.chainId === chainId);
    return network?.name || `Chain ${chainId}`;
  };

  const isCurrentNetwork = (networkKey: string) => {
    const network = SUPPORTED_NETWORKS[networkKey];
    return network && network.chainId === chainId;
  };

  if (!isConnected) {
    return (
      <div className={className}>
        <div className="p-3 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">Connect wallet to select network</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">Select Network</h3>
        
        <div className="mb-3">
          <p className="text-sm text-gray-600">
            Current: <span className="font-medium">{getCurrentNetworkName()}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {Object.entries(SUPPORTED_NETWORKS).map(([key, network]) => (
            <button
              key={key}
              onClick={() => handleNetworkChange(key)}
              disabled={isCurrentNetwork(key)}
              className={`p-3 text-left rounded-lg border transition-colors ${
                isCurrentNetwork(key)
                  ? 'bg-blue-100 border-blue-300 text-blue-800'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
              } disabled:cursor-not-allowed`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{network.name}</div>
                  <div className="text-xs text-gray-500">
                    Chain ID: {network.chainId}
                  </div>
                </div>
                {isCurrentNetwork(key) && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> Make sure you have the native currency ({Object.values(SUPPORTED_NETWORKS).find(n => n.chainId === chainId)?.nativeCurrency.symbol || 'ETH'}) for gas fees on the selected network.
          </p>
        </div>
      </div>
    </div>
  );
}
