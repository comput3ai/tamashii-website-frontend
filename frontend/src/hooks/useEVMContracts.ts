import { useEVM } from '../providers/EVMProvider';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface ContractAddresses {
  coordinator: string;
  authorizer: string;
  treasurer: string;
  miningPool: string;
}

interface EVMContractHook {
  contracts: {
    coordinator: ethers.Contract | null;
    authorizer: ethers.Contract | null;
    treasurer: ethers.Contract | null;
    miningPool: ethers.Contract | null;
  };
  isLoading: boolean;
  error: string | null;
}

// Basic ABI for contract interactions
const COORDINATOR_ABI = [
  'function getRunInfo(string calldata runId) external view returns (tuple(address owner, tuple(uint256 totalSteps, uint256 minClients, uint256 maxClients, uint256 batchSize, uint256 learningRate, string modelHash, string dataHash) config, uint8 state, uint256 createdAt, uint256 trainingStartedAt, uint256 completedAt, uint256 currentStep, uint256 epochNumber, uint256 lastEpochAt))',
  'function getRunClients(string calldata runId) external view returns (address[])',
  'function createRun(string calldata runId, tuple(uint256 totalSteps, uint256 minClients, uint256 maxClients, uint256 batchSize, uint256 learningRate, string modelHash, string dataHash) calldata config) external',
  'function joinRun(string calldata runId) external',
  'function leaveRun(string calldata runId) external',
  'function submitGradients(string calldata runId, bytes32 gradientHash, uint256 stepNumber) external',
  'function tick(string calldata runId) external',
  'event RunCreated(string indexed runId, address indexed owner, tuple(uint256 totalSteps, uint256 minClients, uint256 maxClients, uint256 batchSize, uint256 learningRate, string modelHash, string dataHash) config)',
  'event ClientJoined(string indexed runId, address indexed client)',
  'event ClientLeft(string indexed runId, address indexed client)',
  'event GradientsSubmitted(string indexed runId, address indexed client, bytes32 gradientHash)',
  'event RunStateChanged(string indexed runId, uint8 oldState, uint8 newState)',
];

const MINING_POOL_ABI = [
  'function getPool(uint256 poolId) external view returns (tuple(address creator, string description, address collateralToken, uint256 targetAmount, uint256 totalCollateral, uint256 extractedAmount, uint256 totalRewards, uint256 deadline, uint256 createdAt, uint256 closedAt, bool rewardsClaimable, uint8 status))',
  'function getLender(uint256 poolId, address lender) external view returns (tuple(address lender, uint256 collateralAmount, uint256 createdAt, bool hasClaimed, uint256 claimedAmount, uint256 claimedAt))',
  'function createPool(string calldata description, address collateralToken, uint256 targetAmount, uint256 deadline) external',
  'function depositCollateral(uint256 poolId, uint256 amount) external payable',
  'function claimRewards(uint256 poolId) external',
  'event PoolCreated(uint256 indexed poolId, address indexed creator, string description, address collateralToken, uint256 targetAmount)',
  'event CollateralDeposited(uint256 indexed poolId, address indexed lender, uint256 amount)',
  'event RewardsClaimed(uint256 indexed poolId, address indexed lender, uint256 amount)',
];

const TREASURER_ABI = [
  'function getTreasuryRun(uint256 runId) external view returns (tuple(address owner, string coordinatorRunId, address rewardToken, uint256 totalReward, uint256 depositedAmount, uint256 createdAt, uint256 completedAt, uint8 status))',
  'function getParticipant(uint256 runId, address participant) external view returns (tuple(address participant, uint256 computePoints, uint256 registeredAt, uint256 canClaimAt, bool hasClaimed, uint256 claimedAmount, uint256 claimedAt))',
  'function depositRewards(uint256 runId, uint256 amount) external payable',
  'function claimRewards(uint256 runId) external',
  'event TreasuryRunCreated(uint256 indexed runId, string indexed coordinatorRunId, address indexed owner, address rewardToken, uint256 totalReward)',
  'event RewardDeposited(uint256 indexed runId, address indexed depositor, uint256 amount)',
  'event RewardClaimed(uint256 indexed runId, address indexed participant, uint256 amount)',
];

const AUTHORIZER_ABI = [
  'function hasRoleFor(address account, bytes32 role) external view returns (bool)',
  'function isAuthorized(address account, bytes32 role, bytes calldata scope) external view returns (bool)',
  'function createAuthorization(address grantee, bytes32 role, bytes calldata scope) external',
  'event AuthorizationCreated(bytes32 indexed authId, address indexed grantor, address indexed grantee, bytes32 role)',
];

export function useEVMContracts(contractAddresses: ContractAddresses): EVMContractHook {
  const { provider, signer } = useEVM();
  const [contracts, setContracts] = useState({
    coordinator: null as ethers.Contract | null,
    authorizer: null as ethers.Contract | null,
    treasurer: null as ethers.Contract | null,
    miningPool: null as ethers.Contract | null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!provider || !contractAddresses.coordinator) {
      setContracts({
        coordinator: null,
        authorizer: null,
        treasurer: null,
        miningPool: null,
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const coordinator = new ethers.Contract(
        contractAddresses.coordinator,
        COORDINATOR_ABI,
        signer || provider
      );

      const authorizer = new ethers.Contract(
        contractAddresses.authorizer,
        AUTHORIZER_ABI,
        signer || provider
      );

      const treasurer = new ethers.Contract(
        contractAddresses.treasurer,
        TREASURER_ABI,
        signer || provider
      );

      const miningPool = new ethers.Contract(
        contractAddresses.miningPool,
        MINING_POOL_ABI,
        signer || provider
      );

      setContracts({
        coordinator,
        authorizer,
        treasurer,
        miningPool,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to initialize contracts');
    } finally {
      setIsLoading(false);
    }
  }, [provider, signer, contractAddresses]);

  return { contracts, isLoading, error };
}

// Hook for getting contract addresses from environment
export function useEVMContractAddresses(): ContractAddresses | null {
  const [addresses, setAddresses] = useState<ContractAddresses | null>(null);

  useEffect(() => {
    const coordinator = import.meta.env.VITE_EVM_COORDINATOR_ADDRESS;
    const authorizer = import.meta.env.VITE_EVM_AUTHORIZER_ADDRESS;
    const treasurer = import.meta.env.VITE_EVM_TREASURER_ADDRESS;
    const miningPool = import.meta.env.VITE_EVM_MINING_POOL_ADDRESS;

    if (coordinator && authorizer && treasurer && miningPool) {
      setAddresses({
        coordinator,
        authorizer,
        treasurer,
        miningPool,
      });
    }
  }, []);

  return addresses;
}
