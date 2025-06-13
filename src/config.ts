// config/index.ts
// Application configurations for Nerochain

import { ethers } from 'ethers';

// Environment detection
const isProduction = import.meta.env.PROD;

// Interfaces for type safety
interface ChainConfig {
  chainId: number;
  chainName: string;
  rpcUrl: string;
  currency: string;
  explorer: string;
}

interface AAPlatformConfig {
  platformUrl: string;
  platformApiUrl: string;
  paymasterRpc: string;
  bundlerRpc: string;
  priceServiceUrl: string;
}

interface ContractAddresses {
  paymaster: string;
  entryPoint: string;
  accountFactory: string;
  multiCall: string;
}

interface SmartContracts {
  gameRegistry: string;
  arcadeNFT: string;
  arcadeToken: string;
  pointsSystem: string;
  stakingSystem: string;
  developerPayouts: string;
  nftManager: string;
  tournamentHub: string;
  adminApplications: string;
}

interface ERC20Addresses {
  dai: string;
  usdt: string;
  usdc: string;
  gmxhub: string;
}

interface GasConfig {
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  feeMultiplier: number;
  priorityFeeMultiplier: number;
}

interface ApiOptimizationConfig {
  tokenCacheTime: number;
  lazyLoadTokens: boolean;
  maxTokenRefreshes: number;
  enableCaching: boolean;
  debugLogs: boolean;
}

// Environment-specific configurations
export const TESTNET_CONFIG: {
  chain: ChainConfig;
  aaPlatform: AAPlatformConfig;
  contracts: ContractAddresses;
  smartContracts: SmartContracts; // Optional for testnet
  erc20: ERC20Addresses;
} = {
  chain: {
    chainId: 2052,
    chainName: 'NERO Chain Testnet',
    rpcUrl: 'https://rpc-testnet.nerochain.io',
    currency: 'NERO',
    explorer: 'https://testnet.neroscan.io',
  },
  aaPlatform: {
    platformUrl: 'https://api-testnet.nerochain.io',
    platformApiUrl: 'https://api-aa-platform.nerochain.io',
    paymasterRpc: 'https://paymaster-testnet.nerochain.io',
    bundlerRpc: 'https://bundler-testnet.nerochain.io',
    priceServiceUrl: 'https://price-service.nerochain.io',
  },
  contracts: {
    paymaster: '0x5a6680dFd4a77FEea0A7be291147768EaA2414ad',
    entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
    accountFactory: '0x9406Cc6185a346906296840746125a0E44976454',
    multiCall: '0x343A0DdD8e58bEaf29d69936c82F1516C6677B0E',
  },
  smartContracts: {
    gameRegistry: '0xF7D8fb9eA82A14cBb190bBB80Cd65C3EcE67C3E2',
    arcadeNFT: '0xc079c8e4779f5B01A2678236849577FB22Ec5079',
    arcadeToken: '0x150E812D3443699e8b829EF6978057Ed7CB47AE6',
    pointsSystem: '0x499D4Bae5ab00c597b833cD39912945f70223fBA',
    stakingSystem: '0x48c3d13633b00C95CFa763bA2293F31f0b8448Eb',
    developerPayouts: '0xF27a858EC52Cc789F87e93A87D6E854ec103B2AF',
    nftManager: '0x92CD16b242D30451e6e53B93cB8C641A678dbc74',
    tournamentHub: '0x26Cc56D8f02598895d5052d9298DCd9F2f784E71',
    adminApplications: '0x0797FE7109Ec3E711b7445036051409e2bB7d558',
  },
  erc20: {
    dai: '0x5d0E342cCD1aD86a16BfBa26f404486940DBE345',
    usdt: '0x1dA998CfaA0C044d7205A17308B20C7de1bdCf74',
    usdc: '0xC86Fed58edF0981e927160C50ecB8a8B05B32fed',
    gmxhub: '0xe4f95D88f440F138e525E658D984F08De3b5f1EC',
  },
};

// Mainnet configuration (placeholder)
const MAINNET_CONFIG: {
  chain: ChainConfig;
  aaPlatform: AAPlatformConfig;
  contracts: ContractAddresses;
  erc20: ERC20Addresses;
} = {
  chain: {
    chainId: 1, // Replace with actual mainnet chain ID
    chainName: 'NERO Chain Mainnet',
    rpcUrl: 'https://rpc-mainnet.nerochain.io',
    currency: 'NERO',
    explorer: 'https://neroscan.io',
  },
  aaPlatform: {
    platformUrl: 'https://aa-platform.nerochain.io/',
    platformApiUrl: 'https://api-aa-platform.nerochain.io/',
    paymasterRpc: 'https://paymaster-mainnet.nerochain.io',
    bundlerRpc: 'https://bundler-mainnet.nerochain.io/',
    priceServiceUrl: 'https://price-service.nerochain.io',
  },
  contracts: {
    paymaster: '0x...',
    entryPoint: '0x...',
    accountFactory: '0x...',
    multiCall: '0x...',
  },
  erc20: {
    dai: '0x...',
    usdt: '0x...',
    usdc: '0x...',
    gmxhub: '0x...',
  },
};

// Select configuration based on environment
export const CONFIG = isProduction ? MAINNET_CONFIG : TESTNET_CONFIG;

// Sample NFT Metadata URI
export const SAMPLE_NFT_METADATA = 'https://ipfs.io/ipfs/QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1';

// API Optimization settings
export const API_OPTIMIZATION: ApiOptimizationConfig = {
  tokenCacheTime: 30000, // 30 seconds
  lazyLoadTokens: true,
  maxTokenRefreshes: 5,
  enableCaching: true,
  debugLogs: !isProduction, // Disable debug logs in production
};

export const GAS_CONFIG: GasConfig = {
  callGasLimit: BigInt(250000), // Standard transaction gas limit
  verificationGasLimit: BigInt(210000), // Reasonable verification limit
  preVerificationGas: BigInt(51770), // Minimum required
  maxFeePerGas: BigInt(2500000000), // ~8 Gwei
  maxPriorityFeePerGas: BigInt(2500000000), // ~0.6 Gwei
  feeMultiplier: 100,
  priorityFeeMultiplier: 100,
};

// Get current gas parameters with optional multipliers
export const getGasParameters = (options?: {
  feeMultiplier?: number;
  priorityFeeMultiplier?: number;
}): {
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
} => {
  const feeMultiplier = options?.feeMultiplier ?? GAS_CONFIG.feeMultiplier;
  const priorityFeeMultiplier = options?.priorityFeeMultiplier ?? GAS_CONFIG.priorityFeeMultiplier;

  if (feeMultiplier < 50 || feeMultiplier > 500) {
    throw new Error('Fee multiplier must be between 50% and 500%');
  }
  if (priorityFeeMultiplier < 50 || priorityFeeMultiplier > 500) {
    throw new Error('Priority fee multiplier must be between 50% and 500%');
  }

  const maxFeePerGas = (GAS_CONFIG.maxFeePerGas * BigInt(feeMultiplier)) / BigInt(100);
  const maxPriorityFeePerGas =
    (GAS_CONFIG.maxPriorityFeePerGas * BigInt(priorityFeeMultiplier)) / BigInt(100);

  return {
    callGasLimit: ethers.toBeHex(GAS_CONFIG.callGasLimit),
    verificationGasLimit: ethers.toBeHex(GAS_CONFIG.verificationGasLimit),
    preVerificationGas: ethers.toBeHex(GAS_CONFIG.preVerificationGas),
    maxFeePerGas: ethers.toBeHex(maxFeePerGas),
    maxPriorityFeePerGas: ethers.toBeHex(maxPriorityFeePerGas),
  };
};

// API key management (loaded from environment variables)
export const getApiKey = (): string => {
  const apiKey = import.meta.env.VITE_NEROCHAIN_API_KEY;
  if (!apiKey) {
    console.warn('API key not found in environment variables');
    return '';
  }
  return apiKey;
};