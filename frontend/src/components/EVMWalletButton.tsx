import React from 'react';
import { useEVM } from '../providers/EVMProvider';

interface EVMWalletButtonProps {
  className?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function EVMWalletButton({ className, onConnect, onDisconnect }: EVMWalletButtonProps) {
  const { isConnected, account, connect, disconnect, error, chainId } = useEVM();

  const handleClick = async () => {
    if (isConnected) {
      disconnect();
      onDisconnect?.();
    } else {
      await connect();
      onConnect?.();
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getChainName = (chainId: number | null) => {
    switch (chainId) {
      case 1:
        return 'Ethereum';
      case 8453:
        return 'Base';
      case 84532:
        return 'Base Sepolia';
      case 56:
        return 'BNB Smart Chain';
      case 97:
        return 'BNB Testnet';
      default:
        return `Chain ${chainId}`;
    }
  };

  return (
    <div className={className}>
      {error && (
        <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        {isConnected ? (
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium">
              {formatAddress(account || '')}
            </span>
            <span className="text-xs opacity-75">
              {getChainName(chainId)}
            </span>
          </div>
        ) : (
          'Connect EVM Wallet'
        )}
      </button>
    </div>
  );
}
