import React, { useState, useEffect, useCallback } from 'react';
import { useEVM } from '../providers/EVMProvider';
import { useEVMContracts, useEVMContractAddresses } from '../hooks/useEVMContracts';
import { ethers } from 'ethers';

interface EVMContributeComputeProps {
  runId: string;
  onContribute?: (amount: string) => void;
  onError?: (error: string) => void;
}

interface PoolInfo {
  poolId: number;
  description: string;
  targetAmount: string;
  totalCollateral: string;
  deadline: number;
  status: number;
}

export function EVMContributeCompute({ runId, onContribute, onError }: EVMContributeComputeProps) {
  const { isConnected, account, signer } = useEVM();
  const contractAddresses = useEVMContractAddresses();
  const { contracts, isLoading, error } = useEVMContracts(contractAddresses || {
    coordinator: '',
    authorizer: '',
    treasurer: '',
    miningPool: '',
  });

  const [pools, setPools] = useState<PoolInfo[]>([]);
  const [selectedPool, setSelectedPool] = useState<number | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [isContributing, setIsContributing] = useState(false);
  const [userLenderInfo, setUserLenderInfo] = useState<any>(null);

  // Load available pools
  useEffect(() => {
    if (!contracts.miningPool || !isConnected) return;

    const loadPools = async () => {
      try {
        // For now, we'll assume there's at least one pool (pool ID 0)
        // In a real implementation, you'd have a way to enumerate pools
        const poolId = 0;
        const poolInfo = await contracts.miningPool.getPool(poolId);
        
        if (poolInfo && poolInfo.status !== 3) { // Not closed
          setPools([{
            poolId,
            description: poolInfo.description,
            targetAmount: ethers.utils.formatEther(poolInfo.targetAmount),
            totalCollateral: ethers.utils.formatEther(poolInfo.totalCollateral),
            deadline: poolInfo.deadline.toNumber(),
            status: poolInfo.status,
          }]);
          setSelectedPool(poolId);
        }
      } catch (err: any) {
        console.error('Failed to load pools:', err);
        onError?.(err.message || 'Failed to load pools');
      }
    };

    loadPools();
  }, [contracts.miningPool, isConnected, onError]);

  // Load user's lender info
  useEffect(() => {
    if (!contracts.miningPool || !isConnected || !account || selectedPool === null) return;

    const loadUserInfo = async () => {
      try {
        const lenderInfo = await contracts.miningPool.getLender(selectedPool, account);
        setUserLenderInfo(lenderInfo);
      } catch (err: any) {
        console.error('Failed to load user info:', err);
      }
    };

    loadUserInfo();
  }, [contracts.miningPool, isConnected, account, selectedPool]);

  const handleContribute = useCallback(async () => {
    if (!contracts.miningPool || !signer || selectedPool === null || !contributionAmount) return;

    setIsContributing(true);
    try {
      const amount = ethers.utils.parseEther(contributionAmount);
      
      // Check if user needs to create a lender account first
      if (!userLenderInfo || userLenderInfo.collateralAmount.isZero()) {
        // Create lender account first
        const createTx = await contracts.miningPool.createLender(selectedPool);
        await createTx.wait();
      }

      // Deposit collateral
      const depositTx = await contracts.miningPool.depositCollateral(selectedPool, amount, {
        value: amount, // For ETH deposits
      });
      
      const receipt = await depositTx.wait();
      console.log('Contribution successful:', receipt.transactionHash);
      
      onContribute?.(contributionAmount);
      setContributionAmount('');
      
      // Reload user info
      const lenderInfo = await contracts.miningPool.getLender(selectedPool, account);
      setUserLenderInfo(lenderInfo);
      
    } catch (err: any) {
      console.error('Contribution failed:', err);
      onError?.(err.message || 'Contribution failed');
    } finally {
      setIsContributing(false);
    }
  }, [contracts.miningPool, signer, selectedPool, contributionAmount, userLenderInfo, account, onContribute, onError]);

  const handleClaimRewards = useCallback(async () => {
    if (!contracts.miningPool || !signer || selectedPool === null) return;

    try {
      const claimTx = await contracts.miningPool.claimRewards(selectedPool);
      await claimTx.wait();
      
      // Reload user info
      const lenderInfo = await contracts.miningPool.getLender(selectedPool, account);
      setUserLenderInfo(lenderInfo);
      
    } catch (err: any) {
      console.error('Claim failed:', err);
      onError?.(err.message || 'Claim failed');
    }
  }, [contracts.miningPool, signer, selectedPool, account, onError]);

  if (!isConnected) {
    return (
      <div className="p-6 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Contribute Compute</h3>
        <p className="text-gray-600">Please connect your EVM wallet to contribute compute resources.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Contribute Compute</h3>
        <p className="text-gray-600">Loading contract information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-red-800">Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (pools.length === 0) {
    return (
      <div className="p-6 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Contribute Compute</h3>
        <p className="text-gray-600">No active mining pools available.</p>
      </div>
    );
  }

  const selectedPoolInfo = pools.find(p => p.poolId === selectedPool);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Contribute Compute</h3>
      
      {/* Pool Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Mining Pool
        </label>
        <select
          value={selectedPool || ''}
          onChange={(e) => setSelectedPool(parseInt(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          {pools.map((pool) => (
            <option key={pool.poolId} value={pool.poolId}>
              {pool.description} (Target: {pool.targetAmount} ETH)
            </option>
          ))}
        </select>
      </div>

      {selectedPoolInfo && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Pool Information</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Description: {selectedPoolInfo.description}</p>
            <p>Target Amount: {selectedPoolInfo.targetAmount} ETH</p>
            <p>Total Collateral: {selectedPoolInfo.totalCollateral} ETH</p>
            <p>Deadline: {new Date(selectedPoolInfo.deadline * 1000).toLocaleDateString()}</p>
          </div>
        </div>
      )}

      {/* User's Current Position */}
      {userLenderInfo && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">Your Position</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Collateral: {ethers.utils.formatEther(userLenderInfo.collateralAmount)} ETH</p>
            <p>Claimed: {ethers.utils.formatEther(userLenderInfo.claimedAmount)} ETH</p>
            <p>Has Claimed: {userLenderInfo.hasClaimed ? 'Yes' : 'No'}</p>
          </div>
        </div>
      )}

      {/* Contribution Form */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contribution Amount (ETH)
        </label>
        <input
          type="number"
          step="0.001"
          min="0"
          value={contributionAmount}
          onChange={(e) => setContributionAmount(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="0.0"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleContribute}
          disabled={isContributing || !contributionAmount}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isContributing ? 'Contributing...' : 'Contribute'}
        </button>
        
        {userLenderInfo && userLenderInfo.collateralAmount.gt(0) && (
          <button
            onClick={handleClaimRewards}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Claim Rewards
          </button>
        )}
      </div>
    </div>
  );
}
