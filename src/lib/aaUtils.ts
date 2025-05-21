/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from 'ethers';
import { Client, Presets } from 'userop';
import { 
  NERO_CHAIN_CONFIG, 
  AA_PLATFORM_CONFIG, 
  CONTRACT_ADDRESSES, 
  API_KEY,
  getGasParameters,
  API_OPTIMIZATION
} from '../config';

// Cache variables to prevent redundant initialization
let cachedClient: any = null;
let cachedBuilder: any = null;
let cachedWalletAddress: string | null = null;
let tokenRequestCount = 0;

// Cache for operation results to prevent duplicate transactions
const pendingOperations = new Map<string, Promise<any>>();

// Cache for API responses
const responseCache = new Map<string, {data: any, timestamp: number}>();

// Simple request throttling/debouncing utility
const throttledRequests = new Map<string, {timestamp: number, promise: Promise<any>}>();

// Cache for NFT data to avoid repeated fetching
const nftCache = new Map<string, {timestamp: number, data: any[]}>();
const NFT_CACHE_DURATION = 60000; // 1 minute cache

export const throttledRequest = async (key: string, requestFn: () => Promise<any>, timeWindow: number = 5000) => {
  const now = Date.now();
  const existing = throttledRequests.get(key);
  
  if (existing && now - existing.timestamp < timeWindow) {
    console.log(`Using cached request for ${key}`);
    // Return the cached promise if request was recent
    return existing.promise;
  }
  
  // Otherwise, make a new request
  console.log(`Making new request for ${key}`);
  const promise = requestFn();
  throttledRequests.set(key, { timestamp: now, promise });
  
  // Clean up after promise resolves
  promise.finally(() => {
    // Only clean if it's the same promise (not replaced by a newer one)
    if (throttledRequests.get(key)?.promise === promise) {
      setTimeout(() => {
        // Only delete if it's still the same promise
        if (throttledRequests.get(key)?.promise === promise) {
          throttledRequests.delete(key);
        }
      }, timeWindow);
    }
  });
  
  return promise;
};

// Generic ERC20 ABI for minting tokens
const ERC20_MINT_ABI = [
  "function mint(address to, uint256 amount) returns (bool)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address account) view returns (uint256)"
];


// Initialize Account Abstraction Client with caching
export const initAAClient = async () => {
  // Return cached client if available
  if (cachedClient && API_OPTIMIZATION.enableCaching) {
    console.log("Using cached AA client");
    return cachedClient;
  }
  
  console.log("Initializing new AA client");
  cachedClient = await Client.init(NERO_CHAIN_CONFIG.rpcUrl, {
    overrideBundlerRpc: AA_PLATFORM_CONFIG.bundlerRpc,
    entryPoint: CONTRACT_ADDRESSES.entryPoint,
  });
  
  return cachedClient;
};

// Initialize SimpleAccount Builder with caching
export const initAABuilder = async (accountSigner: ethers.Signer, apiKey?: string) => {
  // Only rebuild if signer changes and caching is enabled
  if (API_OPTIMIZATION.enableCaching) {
    const signerAddress = await accountSigner.getAddress();
    if (cachedBuilder && cachedWalletAddress === signerAddress) {
      // Update API key if needed but don't reinitialize
      console.log("Using cached AA builder with updated API key");
      const currentApiKey = apiKey || API_KEY;
      cachedBuilder.setPaymasterOptions({
        apikey: currentApiKey,
        rpc: AA_PLATFORM_CONFIG.paymasterRpc,
        type: 0 // Default to free (sponsored gas)
      });
      return cachedBuilder;
    }
  }
  
  // Otherwise, create a new builder
  console.log("Initializing new AA builder");
  const builder = await Presets.Builder.SimpleAccount.init(
    accountSigner,
    NERO_CHAIN_CONFIG.rpcUrl,
    {
      overrideBundlerRpc: AA_PLATFORM_CONFIG.bundlerRpc,
      entryPoint: CONTRACT_ADDRESSES.entryPoint,
      factory: CONTRACT_ADDRESSES.accountFactory,
    }
  );
  
  // Apply gas parameters from configuration
  const gasParams = getGasParameters();
  
  // Set API key for paymaster - use provided key, global API_KEY, or none
  const currentApiKey = apiKey || API_KEY;
  
  // Set paymaster options with API key and gas parameters
  builder.setPaymasterOptions({
    apikey: currentApiKey,
    rpc: AA_PLATFORM_CONFIG.paymasterRpc,
    type: 0 // Default to free (sponsored gas)
  });
  
  // Set gas parameters for the UserOperation
  builder.setCallGasLimit(gasParams.callGasLimit);
  builder.setVerificationGasLimit(gasParams.verificationGasLimit);
  builder.setPreVerificationGas(gasParams.preVerificationGas);
  builder.setMaxFeePerGas(gasParams.maxFeePerGas);
  builder.setMaxPriorityFeePerGas(gasParams.maxPriorityFeePerGas);
  
  // Update cache variables
  if (API_OPTIMIZATION.enableCaching) {
    cachedBuilder = builder;
    cachedWalletAddress = await accountSigner.getAddress();
  }
  
  return builder;
};

// Generate a unique operation key based on parameters
const generateOperationKey = (functionName: string, params: any[]) => {
  return `${functionName}-${JSON.stringify(params)}`;
};

// Get the AA wallet address with caching
export const getAAWalletAddress = async (accountSigner: ethers.Signer, apiKey?: string) => {
  // Check if we have a cached address for this signer
  if (API_OPTIMIZATION.enableCaching) {
    const signerAddress = await accountSigner.getAddress();
    if (cachedWalletAddress === signerAddress && cachedBuilder) {
      console.log("Using cached AA wallet address");
      return cachedBuilder.getSender();
    }
  }
  
  // Otherwise, get a fresh builder and address
  console.log("Getting fresh AA wallet address");
  const builder = await initAABuilder(accountSigner, apiKey);
  return builder.getSender();
};

// Set the payment type for the paymaster (0: free, 1: prepay, 2: postpay)
export const setPaymentType = (builder: any, paymentType: number, tokenAddress: string = '') => {
  const paymasterOptions: any = { 
    type: paymentType,
    apikey: API_KEY,
    rpc: AA_PLATFORM_CONFIG.paymasterRpc
  };
  
  // Add token address if ERC20 payment is selected
  if (paymentType > 0 && tokenAddress) {
    paymasterOptions.token = tokenAddress;
  }
  
  builder.setPaymasterOptions(paymasterOptions);
  return builder;
};

// Create a minimal UserOp for pm_supported_tokens
export const createMinimalUserOp = (sender: string) => {
  // Create a minimal valid UserOp structure
  // Using simpler values that don't cause nonce validation errors
  return {
    sender: sender,
    nonce: "0x0", // Use 0x0 to avoid nonce issues
    initCode: "0x",
    callData: "0x",
    callGasLimit: "0x88b8",
    verificationGasLimit: "0x33450",
    preVerificationGas: "0xc350",
    maxFeePerGas: "0x2162553062",
    maxPriorityFeePerGas: "0x40dbcf36",
    paymasterAndData: "0x",
    signature: "0x"
  };
};

// Use the SDK's built-in method to get tokens
export const getSupportedTokensFromSDK = async (client: any, builder: any) => {
  try {
    if (API_OPTIMIZATION.debugLogs) console.log("Getting supported tokens using SDK");
    return await client.getSupportedTokens(builder);
  } catch (error) {
    console.error("Error getting supported tokens using SDK:", error);
    return { tokens: [] };
  }
};

// Transform the token response to a standardized format
export const transformTokensResponse = (response: any) => {
  if (!response) return [];
  
  // Check for tokens array in the response
  let tokens = [];
  
  if (response.tokens && Array.isArray(response.tokens)) {
    tokens = response.tokens.map((token: any) => ({
      address: token.token,
      symbol: token.symbol,
      decimal: token.decimals,
      type: token.type === 'system' ? 1 : 2,
      price: token.price
    }));
  } else if (response.result && response.result.tokens && Array.isArray(response.result.tokens)) {
    tokens = response.result.tokens.map((token: any) => ({
      address: token.token,
      symbol: token.symbol,
      decimal: token.decimals,
      type: token.type === 'system' ? 1 : 2,
      price: token.price
    }));
  } else if (Array.isArray(response)) {
    tokens = response.map((token: any) => ({
      address: token.address || token.token,
      symbol: token.symbol,
      decimal: token.decimal || token.decimals,
      type: token.type || 1,
      price: token.price
    }));
  }
  
  if (API_OPTIMIZATION.debugLogs) {
    console.log("Transformed tokens response:", tokens);
  }
  
  return tokens;
};

// Get token balance
export const getTokenBalance = async (provider: ethers.Provider, address: string, tokenAddress: string) => {
  try {
    // Expanded ERC20 ABI to cover more potential implementations
    const tokenContract = new ethers.Contract(
      tokenAddress,
      [
        'function balanceOf(address) view returns (uint256)',
        'function decimals() view returns (uint8)',
        'function symbol() view returns (string)'
      ],
      provider
    );
    
    // First check if the contract is deployed and responds
    const code = await provider.getCode(tokenAddress);
    if (code === '0x') {
      console.warn(`Token contract at ${tokenAddress} is not deployed`);
      return '0';
    }
    
    const balance = await tokenContract.balanceOf(address);
    let decimals = 18; // Default to 18 decimals
    
    try {
      decimals = await tokenContract.decimals();
    } catch (decimalErr) {
      console.warn(`Could not get decimals for token ${tokenAddress}, using default 18`);
    }
    
    return ethers.formatUnits(balance, decimals);
  } catch (err) {
    console.error(`Error getting token balance for ${tokenAddress}:`, err);
    return '0';
  }
};

// Direct RPC call to pm_supported_tokens without building a full UserOperation
export const directGetSupportedTokens = async (sender: string, apiKey: string) => {
  try {
    // Create a provider connected to the paymaster RPC
    const provider = new ethers.JsonRpcProvider(AA_PLATFORM_CONFIG.paymasterRpc);
    
    // Create minimal UserOp - avoid full UserOp creation that causes extra API calls
    const minimalUserOp = createMinimalUserOp(sender);
    
    // Make direct RPC call
    if (API_OPTIMIZATION.debugLogs) console.log("Making direct RPC call to pm_supported_tokens");
    
    const result = await provider.send("pm_supported_tokens", [
      minimalUserOp, 
      apiKey,
      CONTRACT_ADDRESSES.entryPoint
    ]);
    
    if (API_OPTIMIZATION.debugLogs) {
      console.log("Direct pm_supported_tokens response:", result);
    }
    
    return result;
  } catch (error) {
    console.error("Error in direct RPC call to pm_supported_tokens:", error);
    // Fall back to SDK method
    console.log("Falling back to SDK method for getting supported tokens");
    return null;
  }
};

// Get all token balances for a list of tokens
export const getAllTokenBalances = async (provider: ethers.Provider, userAddress: string, tokens: any[]) => {
  const balances: { [key: string]: string } = {};
  
  // Process in parallel for efficiency
  await Promise.all(
    tokens.map(async (token) => {
      balances[token.address] = await getTokenBalance(provider, userAddress, token.address);
    })
  );
  
  return balances;
};

// Get supported tokens with fallback and caching
export const getSupportedTokens = async (client: any, builder: any) => {
  // Check for token request limits
  if (tokenRequestCount >= API_OPTIMIZATION.maxTokenRefreshes) {
    console.log("Reached maximum token refresh limit, using cached data");
    // Try to use cached data
    const cacheKey = "supportedTokens";
    const cached = responseCache.get(cacheKey);
    if (cached) {
      return cached.data;
    }
    // If no cache, return empty array to avoid further calls
    return [];
  }
  
  tokenRequestCount++;
  
  // Get sender address
  const sender = await builder.getSender();
  
  // Use throttled request with a direct RPC call first, then fallback to SDK
  const key = `getSupportedTokens-${sender}`;
  return throttledRequest(key, async () => {
    // Check cache first
    const cacheKey = "supportedTokens";
    const cached = responseCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp < API_OPTIMIZATION.tokenCacheTime)) {
      console.log("Using cached supported tokens");
      return cached.data;
    }
    
    try {
      console.log("Fetching supported tokens from API");
      
      // Get API key
      const apiKeyToUse = builder.paymasterOptions.apikey || API_KEY;
      
      // Try direct method first
      let response = await directGetSupportedTokens(sender, apiKeyToUse);
      
      // If direct method fails, fall back to SDK method
      if (!response) {
        response = await getSupportedTokensFromSDK(client, builder);
      }
      
      // Transform response to standardized format
      const supportedTokens = transformTokensResponse(response);
      
      // Cache the result
      responseCache.set(cacheKey, {
        data: supportedTokens,
        timestamp: now
      });
      
      return supportedTokens;
    } catch (error) {
      console.error("Error getting supported tokens:", error);
      return [];
    }
  }, API_OPTIMIZATION.tokenCacheTime);
};

// Reset token request count (can be called when explicitly refreshing)
export const resetTokenRequestCount = () => {
  tokenRequestCount = 0;
};

// Apply gas price settings and other options to a builder
export const applyBuilderSettings = (builder: any, paymentType: number = 0, selectedToken: string = '', options?: any) => {
  // Apply gas parameters
  const gasParams = options?.gasMultiplier ? 
    getGasParameters({ feeMultiplier: options.gasMultiplier }) : 
    getGasParameters();
  
  // Set payment type and token
  setPaymentType(builder, paymentType, selectedToken);
  
  // Apply gas parameters
  builder.setCallGasLimit(gasParams.callGasLimit);
  builder.setVerificationGasLimit(gasParams.verificationGasLimit);
  builder.setPreVerificationGas(gasParams.preVerificationGas);
  builder.setMaxFeePerGas(gasParams.maxFeePerGas);
  builder.setMaxPriorityFeePerGas(gasParams.maxPriorityFeePerGas);
  
  return builder;
};

// Generic operation executor to avoid duplicate code and API calls
export const executeOperation = async (
  operationKey: string,
  accountSigner: ethers.Signer,
  executeFn: (client: any, builder: any) => Promise<any>,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: any
) => {
  // Check for pending/cached operations
  if (API_OPTIMIZATION.enableCaching && pendingOperations.has(operationKey)) {
    console.log(`Using pending operation result for ${operationKey}`);
    return pendingOperations.get(operationKey);
  }
  
  const executePromise = (async () => {
    try {
      // Initialize client and builder with caching
      const client = await initAAClient();
      const builder = await initAABuilder(accountSigner, options?.apiKey || API_KEY);
      
      // Apply settings
      applyBuilderSettings(builder, paymentType, selectedToken, options);
      
      // Execute the operation
      return await executeFn(client, builder);
    } catch (error) {
      console.error(`Error executing operation ${operationKey}:`, error);
      // Remove from pending operations on error
      pendingOperations.delete(operationKey);
      throw error;
    } finally {
      // Clean up pending operation after a delay
      setTimeout(() => {
        pendingOperations.delete(operationKey);
      }, 5000); // Remove after 5 seconds to prevent caching errors for too long
    }
  })();
  
  // Cache the promise
  if (API_OPTIMIZATION.enableCaching) {
    pendingOperations.set(operationKey, executePromise);
  }
  
  return executePromise;
};

