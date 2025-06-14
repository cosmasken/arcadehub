/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from 'ethers';
import { Client, Presets } from 'userop';
import { 
  TESTNET_CONFIG,
  getGasParameters,
  API_OPTIMIZATION,
} from '../config';

const API_KEY = import.meta.env.VITE_NEROCHAIN_API_KEY;

// Cache variables to prevent redundant initialization
let cachedClient: any = null;
let cachedBuilder: any = null;
let cachedWalletAddress: string | null = null;
let tokenRequestCount = 0;

// Cache for operation results to prevent duplicate transactions
const pendingOperations = new Map<string, Promise<any>>();

// Cache for API responses
const responseCache = new Map<string, { data: any, timestamp: number }>();

// Simple request throttling utility
const throttledRequests = new Map<string, { timestamp: number, promise: Promise<any> }>();

// Cache for NFT data to avoid repeated fetching
const nftCache = new Map<string, { timestamp: number, data: any[] }>();
const NFT_CACHE_DURATION = 60000; // 1 minute cache

export const throttledRequest = async (key: string, requestFn: () => Promise<any>, timeWindow: number = 5000) => {
  const now = Date.now();
  const existing = throttledRequests.get(key);
  
  if (existing && now - existing.timestamp < timeWindow) {
    console.log(`Using cached request for ${key}`);
    return existing.promise;
  }
  
  console.log(`Making new request for ${key}`);
  const promise = requestFn();
  throttledRequests.set(key, { timestamp: now, promise });
  
  promise.finally(() => {
    if (throttledRequests.get(key)?.promise === promise) {
      setTimeout(() => {
        if (throttledRequests.get(key)?.promise === promise) {
          throttledRequests.delete(key);
        }
      }, timeWindow);
    }
  });
  
  return promise;
};

// Initialize Ethereum provider
export const getProvider = () => {
  return new ethers.JsonRpcProvider(TESTNET_CONFIG.chain.rpcUrl);
};

// Get a signer from user's wallet
export const getSigner = async () => {
  if (!window.ethereum) {
    throw new Error("No Ethereum provider found. Please install MetaMask or a compatible wallet.");
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
};

// Initialize Account Abstraction Client with caching
export const initAAClient = async (accountSigner: ethers.Signer) => {
  if (!accountSigner.provider) {
    throw new Error("Signer must be connected to a provider");
  }
  if (cachedClient && API_OPTIMIZATION.enableCaching) {
    console.log("Using cached AA client");
    return cachedClient;
  }
  console.log("Initializing new AA client");
  cachedClient = await Client.init(TESTNET_CONFIG.chain.rpcUrl, {
    overrideBundlerRpc: TESTNET_CONFIG.aaPlatform.bundlerRpc,
    entryPoint: TESTNET_CONFIG.contracts.entryPoint,
  });
  return cachedClient;
};

// Initialize SimpleAccount Builder with caching
export const initAABuilder = async (accountSigner: ethers.Signer) => {
  if (API_OPTIMIZATION.enableCaching) {
    const signerAddress = await accountSigner.getAddress();
    if (cachedBuilder && cachedWalletAddress === signerAddress) {
      console.log("Using cached AA builder with updated API key");
      const currentApiKey = API_KEY;
      cachedBuilder.setPaymasterOptions({
        apikey: currentApiKey,
        rpc: TESTNET_CONFIG.aaPlatform.paymasterRpc,
        type: 0
      });
      return cachedBuilder;
    }
  }
  console.log("Initializing new AA builder");
  const builder = await Presets.Builder.SimpleAccount.init(
    accountSigner,
    TESTNET_CONFIG.chain.rpcUrl,
    {
      overrideBundlerRpc: TESTNET_CONFIG.aaPlatform.bundlerRpc,
      entryPoint: TESTNET_CONFIG.contracts.entryPoint,
      factory: TESTNET_CONFIG.contracts.accountFactory,
    }
  );
  const gasParams = getGasParameters();
  const currentApiKey = API_KEY;
  builder.setPaymasterOptions({
    apikey: currentApiKey,
    rpc: TESTNET_CONFIG.aaPlatform.paymasterRpc,
    type: 0
  });
  builder.setCallGasLimit(gasParams.callGasLimit);
  builder.setVerificationGasLimit(gasParams.verificationGasLimit);
  builder.setPreVerificationGas(gasParams.preVerificationGas);
  builder.setMaxFeePerGas(gasParams.maxFeePerGas);
  builder.setMaxPriorityFeePerGas(gasParams.maxPriorityFeePerGas);
  if (API_OPTIMIZATION.enableCaching) {
    cachedBuilder = builder;
    cachedWalletAddress = await accountSigner.getAddress();
  }
  return builder;
};

// Get the AA wallet address with caching
export const getAAWalletAddress = async (accountSigner: ethers.Signer) => {
  if (API_OPTIMIZATION.enableCaching) {
    const signerAddress = await accountSigner.getAddress();
    if (cachedWalletAddress === signerAddress && cachedBuilder) {
      console.log("Using cached AA wallet address");
      return cachedBuilder.getSender();
    }
  }
  console.log("Getting fresh AA wallet address");
  const builder = await initAABuilder(accountSigner);
  return builder.getSender();
};

// Set the payment type for the paymaster
export const setPaymentType = (builder: any, paymentType: number, tokenAddress: string = '') => {
  const paymasterOptions: any = { 
    type: paymentType,
    apikey: API_KEY,
    rpc: TESTNET_CONFIG.aaPlatform.paymasterRpc
  };
  if (paymentType > 0 && tokenAddress) {
    paymasterOptions.token = tokenAddress;
  }
  builder.setPaymasterOptions(paymasterOptions);
  return builder;
};

// Create a minimal UserOp for pm_supported_tokens
const createMinimalUserOp = (sender: string) => {
  return {
    sender,
    nonce: "0x0",
    initCode: "0x",
    callData: "0x",
    callGasLimit: "0x0",
    verificationGasLimit: "0x0",
    preVerificationGas: "0x0",
    maxFeePerGas: "0x0",
    maxPriorityFeePerGas: "0x0",
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
const transformTokensResponse = (response: any) => {
  if (!response) return [];
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
  } else if (typeof response === 'object') {
    const possibleTokensArray = Object.values(response).find(val => Array.isArray(val));
    if (possibleTokensArray && Array.isArray(possibleTokensArray)) {
      tokens = possibleTokensArray.map((token: any) => ({
        address: token.address || token.token,
        symbol: token.symbol,
        decimal: token.decimal || token.decimals,
        type: token.type || 1,
        price: token.price
      }));
    }
  }
  if (API_OPTIMIZATION.debugLogs) {
    console.log("Transformed tokens response:", tokens);
  }
  return tokens;
};

// Get token balance
export const getTokenBalance = async (address: string, tokenAddress: string) => {
  try {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      [
        'function balanceOf(address) view returns (uint256)',
        'function decimals() view returns (uint8)',
        'function symbol() view returns (string)'
      ],
      getProvider()
    );
    const code = await getProvider().getCode(tokenAddress);
    if (code === '0x') {
      console.warn(`Token contract at ${tokenAddress} is not deployed`);
      return '0';
    }
    const balance = await tokenContract.balanceOf(address);
    let decimals = 18;
    try {
      decimals = await tokenContract.decimals();
    } catch (err) {
      console.warn(`Could not get decimals for token ${tokenAddress}, using default 18`, err);
    }
    return ethers.formatUnits(balance, decimals);
  } catch (err) {
    console.error(`Error getting token balance for ${tokenAddress}:`, err);
    return '0';
  }
};

// Direct RPC call to pm_supported_tokens
export const directGetSupportedTokens = async (sender: string, apiKey: string) => {
  try {
    const provider = new ethers.JsonRpcProvider(TESTNET_CONFIG.aaPlatform.paymasterRpc);
    const minimalUserOp = createMinimalUserOp(sender);
    if (API_OPTIMIZATION.debugLogs) console.log("Making direct RPC call to pm_supported_tokens");
    const result = await provider.send("pm_supported_tokens", [
      minimalUserOp, 
      apiKey,
      TESTNET_CONFIG.contracts.entryPoint
    ]);
    if (API_OPTIMIZATION.debugLogs) {
      console.log("Direct pm_supported_tokens response:", result);
    }
    return result;
  } catch (error) {
    console.error("Error in direct RPC call to pm_supported_tokens:", error);
    console.log("Falling back to SDK method for getting supported tokens");
    return null;
  }
};

// Get all token balances for a list of tokens
export const getAllTokenBalances = async (userAddress: string, tokens: any[]) => {
  const balances: { [key: string]: string } = {};
  await Promise.all(
    tokens.map(async (token) => {
      balances[token.address] = await getTokenBalance(userAddress, token.address);
    })
  );
  return balances;
};

// Get supported tokens from Paymaster API
export const getSupportedTokens = async (client: any, builder: any) => {
  if (tokenRequestCount >= API_OPTIMIZATION.maxTokenRefreshes) {
    console.log("Reached maximum token refresh limit, using cached data");
    const cacheKey = "supportedTokens";
    const cached = responseCache.get(cacheKey);
    if (cached) {
      return cached.data;
    }
    return [];
  }
  tokenRequestCount++;
  const sender = await builder.getSender();
  const key = `getSupportedTokens-${sender}`;
  return throttledRequest(key, async () => {
    const cacheKey = "supportedTokens";
    const cached = responseCache.get(cacheKey);
    const now = Date.now();
    if (cached && (now - cached.timestamp < API_OPTIMIZATION.tokenCacheTime)) {
      console.log("Using cached supported tokens");
      return cached.data;
    }
    try {
      console.log("Fetching supported tokens from API");
      const apiKeyToUse = API_KEY;
      let response = await directGetSupportedTokens(sender, apiKeyToUse);
      if (!response) {
        response = await getSupportedTokensFromSDK(client, builder);
      }
      const supportedTokens = transformTokensResponse(response);
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

// Reset token request count
export const resetTokenRequestCount = () => {
  tokenRequestCount = 0;
};

// Apply gas price settings and other options to a builder
const applyBuilderSettings = (builder: any, paymentType: number = 0, selectedToken: string = '', options?: any) => {
  const gasParams = options?.gasMultiplier ? 
    getGasParameters({ feeMultiplier: options.gasMultiplier }) : 
    getGasParameters();
  setPaymentType(builder, paymentType, selectedToken);
  builder.setCallGasLimit(gasParams.callGasLimit);
  builder.setVerificationGasLimit(gasParams.verificationGasLimit);
  builder.setPreVerificationGas(gasParams.preVerificationGas);
  builder.setMaxFeePerGas(gasParams.maxFeePerGas);
  builder.setMaxPriorityFeePerGas(gasParams.maxPriorityFeePerGas);
  return builder;
};

// Generic operation executor
const executeOperation = async (
  operationKey: string,
  accountSigner: ethers.Signer,
  executeFn: (client: any, builder: any) => Promise<any>,
  paymentType: number,
  selectedToken: string,
  options?: any
) => {
  if (API_OPTIMIZATION.enableCaching && pendingOperations.has(operationKey)) {
    console.log(`Using pending operation result for ${operationKey}`);
    return pendingOperations.get(operationKey);
  }
  const executePromise = (async () => {
    try {
      const client = await initAAClient(accountSigner);
      const builder = await initAABuilder(accountSigner);
      applyBuilderSettings(builder, paymentType, selectedToken, options);
      return await executeFn(client, builder);
    } catch (error) {
      console.error(`Error executing operation ${operationKey}:`, error);
      pendingOperations.delete(operationKey);
      throw error;
    } finally {
      setTimeout(() => {
        pendingOperations.delete(operationKey);
      }, 5000);
    }
  })();
  if (API_OPTIMIZATION.enableCaching) {
    pendingOperations.set(operationKey, executePromise);
  }
  return executePromise;
};

// Generate a unique operation key
const generateOperationKey = (functionName: string, params: any[]) => {
  return `${functionName}-${JSON.stringify(params)}`;
};

// Mint ERC20 test tokens using Account Abstraction
export const mintERC20Token = async (
  accountSigner: ethers.Signer, 
  recipientAddress: string,
  amount: bigint,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: { apiKey?: string; gasMultiplier?: number }
) => {
  const opKey = generateOperationKey('mintERC20', [
    await accountSigner.getAddress(),
    recipientAddress,
    amount.toString(),
    paymentType,
    selectedToken,
    options?.gasMultiplier || 100
  ]);
  return executeOperation(
    opKey,
    accountSigner,
    async (client, builder) => {
      const erc20Contract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.arcadeToken,
        [
          'function mint(address, uint256) returns (bool)',
          'function balanceOf(address) view returns (uint256)',
          'function decimals() view returns (uint8)'
        ],
        getProvider()
      );
      const callData = erc20Contract.interface.encodeFunctionData('mint', [
        recipientAddress,
        amount
      ]);
      const userOp = await builder.execute(TESTNET_CONFIG.smartContracts.arcadeToken, 0, callData);
      if (API_OPTIMIZATION.debugLogs) console.log(`Sending mint ERC20 operation to paymaster`);
      const res = await client.sendUserOperation(userOp);
      console.log("UserOperation sent with hash:", res.userOpHash);
      const receipt = await res.wait();
      let transactionHash = '';
      try {
        if (receipt && receipt.transactionHash) {
          transactionHash = receipt.transactionHash;
        } else if (Presets && Presets.SimpleAccount) {
          const simpleAccountInstance = await Presets.SimpleAccount.init(
            accountSigner,
            TESTNET_CONFIG.chain.rpcUrl,
            {
              overrideBundlerRpc: TESTNET_CONFIG.aaPlatform.bundlerRpc,
              entryPoint: TESTNET_CONFIG.contracts.entryPoint,
              factory: TESTNET_CONFIG.contracts.accountFactory,
            }
          );
          const userOpResult = await simpleAccountInstance.checkUserOp(res.userOpHash);
          transactionHash = userOpResult.receipt?.transactionHash || '';
          return {
            userOpHash: res.userOpHash,
            transactionHash,
            receipt: userOpResult
          };
        }
      } catch (error) {
        console.warn("Error getting transaction details:", error);
      }
      return {
        userOpHash: res.userOpHash,
        transactionHash,
        receipt: null
      };
    },
    paymentType,
    selectedToken,
    options
  );
};

// Approve token for a specific contract using AA
export const approveTokenForContractAA = async (
  accountSigner: ethers.Signer,
  tokenAddress: string,
  amount: bigint,
  contractAddress: string,
  options?: { apiKey?: string; gasMultiplier?: number }
) => {
  const opKey = generateOperationKey('approveTokenForContractAA', [
    await accountSigner.getAddress(),
    tokenAddress,
    amount.toString(),
    contractAddress
  ]);
  return executeOperation(
    opKey,
    accountSigner,
    async (client, builder) => {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function approve(address spender, uint256 amount) returns (bool)'],
        getProvider()
      );
      const callData = tokenContract.interface.encodeFunctionData('approve', [contractAddress, amount]);
      builder.setPaymasterOptions({
        apikey: API_KEY,
        rpc: TESTNET_CONFIG.aaPlatform.paymasterRpc,
        type: 0 // Sponsored
      });
      const userOp = await builder.execute(tokenAddress, 0, callData);
      const res = await client.sendUserOperation(userOp);
      const receipt = await res.wait();
      return {
        success: true,
        userOpHash: res.userOpHash,
        transactionHash: receipt?.transactionHash,
        receipt
      };
    },
    0,
    '',
    options
  );
};

// Approve NFT for a specific contract using AA
export const approveNFTForContractAA = async (
  accountSigner: ethers.Signer,
  nftContractAddress: string,
  operatorAddress: string,
  options?: { apiKey?: string; gasMultiplier?: number }
) => {
  const opKey = generateOperationKey('approveNFTForContractAA', [
    await accountSigner.getAddress(),
    nftContractAddress,
    operatorAddress
  ]);
  return executeOperation(
    opKey,
    accountSigner,
    async (client, builder) => {
      const nftContract = new ethers.Contract(
        nftContractAddress,
        ["function setApprovalForAll(address operator, bool approved) external"],
        getProvider()
      );
      const callData = nftContract.interface.encodeFunctionData('setApprovalForAll', [operatorAddress, true]);
      builder.setPaymasterOptions({
        apikey: API_KEY,
        rpc: TESTNET_CONFIG.aaPlatform.paymasterRpc,
        type: 0 // Sponsored
      });
      const userOp = await builder.execute(nftContractAddress, 0, callData);
      const res = await client.sendUserOperation(userOp);
      const receipt = await res.wait();
      return {
        success: true,
        userOpHash: res.userOpHash,
        transactionHash: receipt?.transactionHash,
        receipt
      };
    },
    0,
    '',
    options
  );
};

// Mint NFT using Account Abstraction
export const mintNFT = async (
  accountSigner: ethers.Signer, 
  recipientAddress: string,
  metadataUri: string,
  paymentType: number,
  selectedToken: string = '',
  options?: { apiKey?: string; gasMultiplier?: number }
) => {
  const opKey = generateOperationKey('mintNFT', [
    await accountSigner.getAddress(),
    recipientAddress,
    metadataUri,
    paymentType,
    selectedToken,
    options?.gasMultiplier || 100
  ]);
  return executeOperation(
    opKey,
    accountSigner,
    async (client, builder) => {
      const nftContract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.arcadeNFT,
        [
          'function mint(address, string) returns (uint256)',
          'function balanceOf(address) view returns (uint256)',
          'function tokenURI(uint256) view returns (string)'
        ],
        getProvider()
      );
      const callData = nftContract.interface.encodeFunctionData('mint', [
        recipientAddress,
        metadataUri
      ]);
      const userOp = await builder.execute(TESTNET_CONFIG.smartContracts.arcadeNFT, 0, callData);
      if (API_OPTIMIZATION.debugLogs) console.log(`Sending mint NFT operation to paymaster`);
      let res;
      let retryCount = 0;
      const maxRetries = 3;
      while (retryCount < maxRetries) {
        try {
          res = await client.sendUserOperation(userOp);
          break;
        } catch (error) {
          if (retryCount === maxRetries - 1) {
            throw error;
          }
          retryCount++;
          console.warn(`Attempt ${retryCount} failed. Retrying in 1s...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      console.log("UserOperation sent with hash:", res.userOpHash);
      const receipt = await res.wait();
      let transactionHash = '';
      try {
        if (receipt && receipt.transactionHash) {
          transactionHash = receipt.transactionHash;
        } else if (Presets && Presets.SimpleAccount) {
          const simpleAccountInstance = await Presets.SimpleAccount.init(
            accountSigner,
            TESTNET_CONFIG.chain.rpcUrl,
            {
              overrideBundlerRpc: TESTNET_CONFIG.aaPlatform.bundlerRpc,
              entryPoint: TESTNET_CONFIG.contracts.entryPoint,
              factory: TESTNET_CONFIG.contracts.accountFactory,
            }
          );
          const userOpResult = await simpleAccountInstance.checkUserOp(res.userOpHash);
          transactionHash = userOpResult.receipt?.transactionHash || '';
          return {
            userOpHash: res.userOpHash,
            transactionHash,
            receipt: userOpResult
          };
        }
      } catch (error) {
        console.warn("Error getting transaction details:", error);
      }
      return {
        userOpHash: res.userOpHash,
        transactionHash,
        receipt: null
      };
    },
    paymentType,
    selectedToken,
    options
  );
};

// Fetch NFTs owned by an address
export const getNFTsForAddress = async (address: string) => {
  if (!address) return [];
  const cacheKey = `nfts-${address.toLowerCase()}`;
  const cachedData = nftCache.get(cacheKey);
  const now = Date.now();
  if (cachedData && (now - cachedData.timestamp < NFT_CACHE_DURATION)) {
    console.log("Using cached NFT data");
    return cachedData.data;
  }
  try {
    const nftContract = new ethers.Contract(
      TESTNET_CONFIG.smartContracts.arcadeNFT,
      [
        'function balanceOf(address owner) view returns (uint256)',
        'function tokenURI(uint256 tokenId) view returns (string)',
        'function ownerOf(uint256 tokenId) view returns (address)',
        'function totalSupply() view returns (uint256)'
      ],
      getProvider()
    );
    let totalSupply = 100;
    try {
      totalSupply = (await nftContract.totalSupply()).toNumber();
      totalSupply = Math.min(totalSupply, 500);
    } catch (err) {
      console.log("Contract doesn't support totalSupply, using default range", err);
    }
    const batchSize = 10;
    const nfts = [];
    for (let batchStart = 1; batchStart <= totalSupply; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize - 1, totalSupply);
      console.log(`Processing NFT batch ${batchStart}-${batchEnd}`);
      const ownerPromises = [];
      for (let tokenId = batchStart; tokenId <= batchEnd; tokenId++) {
        const ownerPromise = nftContract.ownerOf(tokenId)
          .then(owner => ({ tokenId, owner, exists: true }))
          .catch(() => ({ tokenId, owner: null, exists: false }));
        ownerPromises.push(ownerPromise);
      }
      const ownerResults = await Promise.all(ownerPromises);
      const ownedTokens = ownerResults
        .filter(result => result.exists && result.owner?.toLowerCase() === address.toLowerCase())
        .map(result => result.tokenId);
      if (ownedTokens.length > 0) {
        const uriPromises = ownedTokens.map(tokenId => 
          nftContract.tokenURI(tokenId)
            .then(uri => ({ tokenId: tokenId.toString(), tokenURI: uri }))
            .catch(err => {
              console.warn(`Error fetching URI for token #${tokenId}:`, err);
              return { tokenId: tokenId.toString(), tokenURI: '' };
            })
        );
        const uriResults = await Promise.all(uriPromises);
        nfts.push(...uriResults.filter(token => token.tokenURI));
      }
    }
    nftCache.set(cacheKey, { timestamp: now, data: nfts });
    return nfts;
  } catch (err) {
    console.error("Error fetching NFTs:", err);
    return [];
  }
};

// Get test token balance
export const getTestTokenBalance = async (address: string) => {
  try {
    const balance = await getTokenBalance(address, TESTNET_CONFIG.smartContracts.arcadeToken);
    if (balance !== '0') {
      return balance;
    }
    if (import.meta.env.DEV || API_OPTIMIZATION.debugLogs) {
      console.log("Using mock test token balance for development");
      return '1000.0';
    }
    return '0';
  } catch (err) {
    console.error("Error fetching test token balance:", err);
    if (import.meta.env.DEV || API_OPTIMIZATION.debugLogs) {
      return '1000.0';
    }
    return '0';
  }
};

// Check token allowance for a spender
export const checkTokenAllowance = async (provider: ethers.BrowserProvider, tokenAddress: string, ownerAddress: string, spenderAddress: string = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789') => {
  try {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      [
        'function allowance(address owner, address spender) view returns (uint256)',
        'function decimals() view returns (uint8)'
      ],
      provider
    );
    const allowance = await tokenContract.allowance(ownerAddress, spenderAddress);
    let decimals = 18;
    try {
      decimals = await tokenContract.decimals();
    } catch (err) {
      console.warn(`Could not get decimals for token ${tokenAddress}, using default 18`, err);
    }
    return ethers.formatUnits(allowance, decimals);
  } catch (error) {
    console.error("Error checking token allowance:", error);
    return '0';
  }
};

// Approve token spending
export const approveToken = async (provider: ethers.BrowserProvider, tokenAddress: string, amount: bigint, spenderAddress: string = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789') => {
  try {
    const signer = await provider.getSigner();
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ['function approve(address spender, uint256 amount) returns (bool)'],
      signer
    );
    const tx = await tokenContract.approve(
      spenderAddress,
      amount,
      {
        maxPriorityFeePerGas: ethers.parseUnits('1', 'gwei'),
        maxFeePerGas: ethers.parseUnits('2', 'gwei'),
      }
    );
    const receipt = await tx.wait();
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("Error approving token:", error);
    return {
      success: false,
      error
    };
  }
};

// Approve NFT for a contract (non-AA)
export const approveNFTForContract = async (
  accountSigner: ethers.Signer,
  nftContractAddress: string,
  operatorAddress: string
) => {
  try {
    const nftContract = new ethers.Contract(
      nftContractAddress,
      [
        "function setApprovalForAll(address operator, bool approved) external",
        "function isApprovedForAll(address owner, address operator) view returns (bool)"
      ],
      accountSigner
    );
    const owner = await accountSigner.getAddress();
    const isApproved = await nftContract.isApprovedForAll(owner, operatorAddress);
    if (isApproved) {
      return { success: true };
    }
    const tx = await nftContract.setApprovalForAll(
      operatorAddress,
      true,
      {
        maxPriorityFeePerGas: ethers.parseUnits('1', 'gwei'),
        maxFeePerGas: ethers.parseUnits('2', 'gwei'),
      }
    );
    const receipt = await tx.wait();
    return { success: true, transactionHash: receipt.transactionHash };
  } catch (error) {
    console.error("Error approving NFT for contract:", error);
    return { success: false, error };
  }
};

// Transfer tokens to an AA wallet
export const transferTokenToAAWallet = async (provider: ethers.JsonRpcProvider, tokenAddress: string, amount: bigint, recipientAddress: string) => {
  try {
    const signer = await provider.getSigner();
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ['function transfer(address to, uint256 amount) returns (bool)'],
      signer
    );
    const tx = await tokenContract.transfer(recipientAddress, amount);
    const receipt = await tx.wait();
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("Error transferring token:", error);
    return {
      success: false,
      error
    };
  }
};

// Get NFTs
export const getNFTs = async (ownerAddress: string) => {
  if (!ownerAddress) return [];
  try {
    const nftMetadata = await getNFTsForAddress(ownerAddress);
    console.log("Fetched NFT metadata:", nftMetadata);
    const formattedNFTs = await Promise.all(
      nftMetadata.map(async (nft: any) => {
        try {
          let metadata = nft.tokenURI;
          let imageUrl = '';
          let name = `NFT #${nft.tokenId}`;
          let description = '';
          if (typeof metadata === 'string') {
            if (metadata.startsWith('ipfs://')) {
              metadata = metadata.replace('ipfs://', 'https://ipfs.io/ipfs/');
            }
            const isDirectImage = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(metadata);
            if (isDirectImage) {
              imageUrl = metadata;
            } else if (metadata.startsWith('http')) {
              try {
                const response = await fetch(metadata);
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                  const jsonData = await response.json();
                  metadata = jsonData;
                } else if (contentType && contentType.includes('image/')) {
                  imageUrl = metadata;
                } else {
                  try {
                    const jsonData = await response.json();
                    metadata = jsonData;
                  } catch (parseError) {
                    console.warn(`Could not parse response as JSON from ${metadata}`, parseError);
                    imageUrl = metadata;
                  }
                }
              } catch (e) {
                console.warn(`Failed to fetch metadata from ${metadata}`, e);
                imageUrl = metadata;
              }
            }
          }
          if (typeof metadata === 'object' && metadata !== null) {
            imageUrl = metadata.image || imageUrl;
            if (imageUrl.startsWith('ipfs://')) {
              imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
            }
            name = metadata.name || name;
            description = metadata.description || '';
          }
          return {
            id: nft.tokenId,
            tokenId: parseInt(nft.tokenId),
            name,
            description,
            image: imageUrl
          };
        } catch (err) {
          console.error(`Error processing NFT metadata for token ID ${nft.tokenId}:`, err);
          return {
            id: nft.tokenId,
            tokenId: parseInt(nft.tokenId),
            name: `NFT #${nft.tokenId}`,
            description: 'Metadata unavailable',
            image: ''
          };
        }
      })
    );
    return formattedNFTs;
  } catch (error) {
    console.error("Error fetching and processing NFTs:", error);
    return [];
  }
};

// Transfer ERC20 tokens using Account Abstraction
export const transferERC20Token = async (
  accountSigner: ethers.Signer, 
  recipientAddress: string,
  amount: bigint,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: { apiKey?: string; gasMultiplier?: number }
) => {
  const opKey = generateOperationKey('transferERC20', [
    await accountSigner.getAddress(),
    recipientAddress,
    amount.toString(),
    paymentType,
    selectedToken,
    options?.gasMultiplier || 100
  ]);
  return executeOperation(
    opKey,
    accountSigner,
    async (client, builder) => {
      const erc20Contract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.arcadeToken,
        [
          'function transfer(address, uint256) returns (bool)',
          'function balanceOf(address) view returns (uint256)',
          'function decimals() view returns (uint8)'
        ],
        getProvider()
      );
      const callData = erc20Contract.interface.encodeFunctionData('transfer', [
        recipientAddress,
        amount
      ]);
      const userOp = await builder.execute(TESTNET_CONFIG.smartContracts.arcadeToken, 0, callData);
      if (API_OPTIMIZATION.debugLogs) console.log(`Sending transfer ERC20 operation to paymaster`);
      const res = await client.sendUserOperation(userOp);
      console.log("UserOperation sent with hash:", res.userOpHash);
      const receipt = await res.wait();
      let transactionHash = '';
      try {
        if (receipt && receipt.transactionHash) {
          transactionHash = receipt.transactionHash;
        } else if (Presets && Presets.SimpleAccount) {
          const simpleAccountInstance = await Presets.SimpleAccount.init(
            accountSigner,
            TESTNET_CONFIG.chain.rpcUrl,
            {
              overrideBundlerRpc: TESTNET_CONFIG.aaPlatform.bundlerRpc,
              entryPoint: TESTNET_CONFIG.contracts.entryPoint,
              factory: TESTNET_CONFIG.contracts.accountFactory,
            }
          );
          const userOpResult = await simpleAccountInstance.checkUserOp(res.userOpHash);
          transactionHash = userOpResult.receipt?.transactionHash || '';
          return {
            userOpHash: res.userOpHash,
            transactionHash,
            receipt: userOpResult
          };
        }
      } catch (error) {
        console.warn("Error getting transaction details:", error);
      }
      return {
        userOpHash: res.userOpHash,
        transactionHash,
        receipt: null
      };
    },
    paymentType,
    selectedToken,
    options
  );
};

// Check token allowance from AA wallet
export const checkAAWalletTokenAllowance = async (
  accountSigner: ethers.Signer,
  tokenAddress: string,
  spenderAddress: string = TESTNET_CONFIG.contracts.paymaster
) => {
  try {
    const aaWalletAddress = await getAAWalletAddress(accountSigner);
    const tokenContract = new ethers.Contract(
      tokenAddress,
      [
        'function allowance(address owner, address spender) view returns (uint256)',
        'function decimals() view returns (uint8)'
      ],
      getProvider()
    );
    const allowance = await tokenContract.allowance(aaWalletAddress, spenderAddress);
    let decimals = 18;
    try {
      decimals = await tokenContract.decimals();
    } catch (err) {
      console.warn(`Could not get decimals for token ${tokenAddress}, using default 18`, err);
    }
    return ethers.formatUnits(allowance, decimals);
  } catch (error) {
    console.error("Error checking AA wallet token allowance:", error);
    return '0';
  }
};

// Approve token for paymaster from AA wallet
export const approveAAWalletToken = async (
  accountSigner: ethers.Signer,
  tokenAddress: string,
  amount: bigint,
  spenderAddress: string = TESTNET_CONFIG.contracts.paymaster,
  options?: { apiKey?: string; gasMultiplier?: number }
) => {
  const opKey = generateOperationKey('approveAAWalletToken', [
    await accountSigner.getAddress(),
    tokenAddress,
    amount.toString(),
    spenderAddress
  ]);
  return executeOperation(
    opKey,
    accountSigner,
    async (client, builder) => {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function approve(address spender, uint256 amount) returns (bool)'],
        getProvider()
      );
      const callData = tokenContract.interface.encodeFunctionData('approve', [spenderAddress, amount]);
      builder.setPaymasterOptions({
        apikey: API_KEY,
        rpc: TESTNET_CONFIG.aaPlatform.paymasterRpc,
        type: 0 // Sponsored
      });
      const userOp = await builder.execute(tokenAddress, 0, callData);
      console.log(`Sending AA wallet token approval operation`);
      const res = await client.sendUserOperation(userOp);
      console.log("UserOperation sent with hash:", res.userOpHash);
      const receipt = await res.wait();
      let transactionHash = '';
      if (receipt && receipt.transactionHash) {
        transactionHash = receipt.transactionHash;
      }
      return {
        success: true,
        userOpHash: res.userOpHash,
        transactionHash,
        receipt
      };
    },
    0,
    '',
    options
  );
};

// Submit game to GameRegistry
export const submitGameAA = async (
  accountSigner: ethers.Signer,
  gameId: string,
  name: string,
  ipfsHash: string,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: { apiKey?: string; gasMultiplier?: number }
) => {
  const opKey = generateOperationKey('submitGameAA', [
    await accountSigner.getAddress(),
    gameId,
    name,
    ipfsHash,
    paymentType,
    selectedToken,
    options?.gasMultiplier || 100
  ]);
  return executeOperation(
    opKey,
    accountSigner,
    async (client, builder) => {
      let gameIdBigInt: bigint;
      try {
        if (typeof gameId === "string" && gameId.startsWith('0x')) {
          gameIdBigInt = ethers.toBigInt(gameId);
        } else {
          gameIdBigInt = BigInt(gameId);
        }
      } catch {
        gameIdBigInt = ethers.toBigInt(
          ethers.keccak256(ethers.toUtf8Bytes(gameId))
        );
      }
      const contract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.gameRegistry,
        [
          "event GameSubmitted(uint256 indexed gameId, address indexed developer, string name, string ipfsHash)",
          "function submitGame(uint256 gameId, string name, string ipfsHash) external"
        ],
        getProvider()
      );
      const callData = contract.interface.encodeFunctionData('submitGame', [
        gameIdBigInt,
        name,
        ipfsHash
      ]);
      const userOp = await builder.execute(TESTNET_CONFIG.smartContracts.gameRegistry, 0, callData);
      const res = await client.sendUserOperation(userOp);
      const receipt = await res.wait();
      const abi = [
        "event GameSubmitted(uint256 indexed gameId, address indexed developer, string name, string ipfsHash)"
      ];
      const iface = new ethers.Interface(abi);
      let returnedGameId = null;
      if (receipt && receipt.logs) {
        for (const log of receipt.logs) {
          try {
            const parsed = iface.parseLog(log);
            if (parsed && parsed.name === "GameSubmitted") {
              returnedGameId = parsed.args.gameId.toString();
              break;
            }
          } catch {
            continue;
          }
        }
      }
      return {
        userOpHash: res.userOpHash,
        transactionHash: receipt?.transactionHash,
        gameId: returnedGameId,
        receipt
      };
    },
    paymentType,
    selectedToken,
    options
  );
};


// Submit points claim to PointsSystem
export const submitPointsClaimAA = async (
  accountSigner: ethers.Signer,
  points: number,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: { apiKey?: string; gasMultiplier?: number }
) => {
  const opKey = generateOperationKey('submitPointsClaimAA', [
    await accountSigner.getAddress(),
    points,
    paymentType,
    selectedToken,
    options?.gasMultiplier || 100
  ]);
  return executeOperation(
    opKey,
    accountSigner,
    async (client, builder) => {
      const contract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.pointsSystem,
        ["function submitPointsClaim(uint256 points) external"],
        getProvider()
      );
      const callData = contract.interface.encodeFunctionData('submitPointsClaim', [points]);
      const userOp = await builder.execute(TESTNET_CONFIG.smartContracts.pointsSystem, 0, callData);
      const res = await client.sendUserOperation(userOp);
      const receipt = await res.wait();
      return {
        userOpHash: res.userOpHash,
        transactionHash: receipt?.transactionHash,
        receipt
      };
    },
    paymentType,
    selectedToken,
    options
  );
};


// Apply for admin to AdminApplications
export const applyForAdminAA = async (
  accountSigner: ethers.Signer,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: { apiKey?: string; gasMultiplier?: number }
) => {
  const opKey = generateOperationKey('applyForAdminAA', [
    await accountSigner.getAddress(),
    paymentType,
    selectedToken,
    options?.gasMultiplier || 100
  ]);
  return executeOperation(
    opKey,
    accountSigner,
    async (client, builder) => {
      const contract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.adminApplications,
        ["function applyForAdmin() external"],
        getProvider()
      );
      const callData = contract.interface.encodeFunctionData('applyForAdmin', []);
      const userOp = await builder.execute(TESTNET_CONFIG.smartContracts.adminApplications, 0, callData);
      const res = await client.sendUserOperation(userOp);
      const receipt = await res.wait();
      return {
        userOpHash: res.userOpHash,
        transactionHash: receipt?.transactionHash,
        receipt
      };
    },
    paymentType,
    selectedToken,
    options
  );
};

// Stake tokens to StakingSystem
export const stakeTokensAA = async (
  accountSigner: ethers.Signer,
  amount: bigint,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: { apiKey?: string; gasMultiplier?: number }
) => {
  const opKey = generateOperationKey('stakeTokensAA', [
    await accountSigner.getAddress(),
    amount.toString(),
    paymentType,
    selectedToken,
    options?.gasMultiplier || 100
  ]);
  return executeOperation(
    opKey,
    accountSigner,
    async (client, builder) => {
      const contract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.stakingSystem,
        ["function stakeTokens(uint256 amount) external"],
        getProvider()
      );
      const callData = contract.interface.encodeFunctionData('stakeTokens', [amount]);
      const userOp = await builder.execute(TESTNET_CONFIG.smartContracts.stakingSystem, 0, callData);
      const res = await client.sendUserOperation(userOp);
      const receipt = await res.wait();
      return {
        userOpHash: res.userOpHash,
        transactionHash: receipt?.transactionHash,
        receipt
      };
    },
    paymentType,
    selectedToken,
    options
  );
};

// Unstake tokens from StakingSystem
export const unstakeTokensAA = async (
  accountSigner: ethers.Signer,
  amount: bigint,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: { apiKey?: string; gasMultiplier?: number }
) => {
  const opKey = generateOperationKey('unstakeTokensAA', [
    await accountSigner.getAddress(),
    amount.toString(),
    paymentType,
    selectedToken,
    options?.gasMultiplier || 100
  ]);
  return executeOperation(
    opKey,
    accountSigner,
    async (client, builder) => {
      const contract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.stakingSystem,
        ["function unstakeTokens(uint256 amount) external"],
        getProvider()
      );
      const callData = contract.interface.encodeFunctionData('unstakeTokens', [amount]);
      const userOp = await builder.execute(TESTNET_CONFIG.smartContracts.stakingSystem, 0, callData);
      const res = await client.sendUserOperation(userOp);
      const receipt = await res.wait();
      return {
        userOpHash: res.userOpHash,
        transactionHash: receipt?.transactionHash,
        receipt
      };
    },
    paymentType,
    selectedToken,
    options
  );
};

// Submit points claim (sponsored) to PointsSystem
export const submitPointsClaimSponsored = async (
  accountSigner: ethers.Signer,
  points: number,
  options?: { apiKey?: string; gasMultiplier?: number }
) => {
  const paymentType = 0;
  const selectedToken = '';
  const opKey = `submitPointsClaimSponsored-${await accountSigner.getAddress()}-${points}`;
  return executeOperation(
    opKey,
    accountSigner,
    async (client, builder) => {
      const contract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.pointsSystem,
        [
          "function submitPointsClaim(uint256 points) external",
          "event PointsClaimSubmitted(address indexed player, uint256 indexed claimIndex, uint256 points)",
        ],
        getProvider()
      );
      const callData = contract.interface.encodeFunctionData('submitPointsClaim', [points]);
      const userOp = await builder.execute(TESTNET_CONFIG.smartContracts.pointsSystem, 0, callData);
      const res = await client.sendUserOperation(userOp);
      const receipt = await res.wait();
      return {
        userOpHash: res.userOpHash,
        transactionHash: receipt?.transactionHash,
        receipt
      };
    },
    paymentType,
    selectedToken,
    options
  );
};

export const approvePointsClaimAA = async (
  accountSigner: ethers.Signer,
  player: string,
  claimIndex: number,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: { apiKey?: string; gasMultiplier?: number }
) => {
  const aaWalletAddress = await getAAWalletAddress(accountSigner);
  const contract = new ethers.Contract(
    TESTNET_CONFIG.smartContracts.pointsSystem,
    [
      "function isAdmin(address) view returns (bool)",
      "function getClaim(address player, uint256 claimIndex) view returns (uint256 points, bool approved, bool rejected)",
    ],
    getProvider()
  );
  if (!(await contract.isAdmin(aaWalletAddress))) {
    throw new Error(`AA wallet ${aaWalletAddress} is not an admin`);
  }
  if (!ethers.isAddress(player)) {
    throw new Error(`Invalid player address: ${player}`);
  }
  try {
    const [points, approved, rejected] = await contract.getClaim(player, claimIndex);
    if (approved || rejected) {
      throw new Error(`Claim at index ${claimIndex} for ${player} is already processed`);
    }
    if (points === 0) {
      throw new Error(`Invalid claim at index ${claimIndex} for ${player}`);
    }
  } catch (err) {
    throw new Error(`Failed to validate claim: ${err.message}`);
  }

  const opKey = generateOperationKey('approvePointsClaimAA', [
    await accountSigner.getAddress(),
    player,
    claimIndex,
    paymentType,
    selectedToken,
    options?.gasMultiplier || 100,
  ]);
  return executeOperation(
    opKey,
    accountSigner,
    async (client, builder) => {
      if (API_OPTIMIZATION.debugLogs) {
        console.log(`Approving claim ${claimIndex} for ${player}`);
      }
      const contract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.pointsSystem,
        [
          "function approvePointsClaim(address player, uint256 claimIndex) external",
          "event PointsClaimApproved(address indexed player, uint256 indexed claimIndex, uint256 points)",
        ],
        getProvider()
      );
      const callData = contract.interface.encodeFunctionData('approvePointsClaim', [player, claimIndex]);
      const userOp = await builder.execute(TESTNET_CONFIG.smartContracts.pointsSystem, 0, callData);
      const res = await client.sendUserOperation(userOp);
      if (API_OPTIMIZATION.debugLogs) {
        console.log(`UserOperation sent: ${res.userOpHash}`);
      }
      const receipt = await res.wait();
      let approvedPoints = null;
      let approvedClaimIndex = null;
      if (receipt && receipt.logs) {
        const iface = new ethers.Interface([
          "event PointsClaimApproved(address indexed player, uint256 indexed claimIndex, uint256 points)",
        ]);
        for (const log of receipt.logs) {
          try {
            const parsed = iface.parseLog(log);
            if (parsed && parsed.name === "PointsClaimApproved") {
              approvedPoints = parsed.args.points.toString();
              approvedClaimIndex = parsed.args.claimIndex.toString();
              break;
            }
          } catch {
            continue;
          }
        }
      }
      return {
        userOpHash: res.userOpHash,
        transactionHash: receipt?.transactionHash,
        approvedPoints,
        approvedClaimIndex,
        receipt,
      };
    },
    paymentType,
    selectedToken,
    options
  );
};

export const rejectPointsClaimAA = async (
  accountSigner: ethers.Signer,
  player: string,
  claimIndex: number,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: { apiKey?: string; gasMultiplier?: number }
) => {
  const aaWalletAddress = await getAAWalletAddress(accountSigner);
  const contract = new ethers.Contract(
    TESTNET_CONFIG.smartContracts.pointsSystem,
    [
      "function isAdmin(address) view returns (bool)",
      "function getClaim(address player, uint256 claimIndex) view returns (uint256 points, bool approved, bool rejected)",
    ],
    getProvider()
  );
  if (!(await contract.isAdmin(aaWalletAddress))) {
    throw new Error(`AA wallet ${aaWalletAddress} is not an admin`);
  }
  if (!ethers.isAddress(player)) {
    throw new Error(`Invalid player address: ${player}`);
  }
  try {
    const [points, approved, rejected] = await contract.getClaim(player, claimIndex);
    if (approved || rejected) {
      throw new Error(`Claim at index ${claimIndex} for ${player} is already processed`);
    }
    if (points === 0) {
      throw new Error(`Invalid claim at index ${claimIndex} for ${player}`);
    }
  } catch (err) {
    throw new Error(`Failed to validate claim: ${err.message}`);
  }

  const opKey = generateOperationKey('rejectPointsClaimAA', [
    await accountSigner.getAddress(),
    player,
    claimIndex,
    paymentType,
    selectedToken,
    options?.gasMultiplier || 100,
  ]);
  return executeOperation(
    opKey,
    accountSigner,
    async (client, builder) => {
      if (API_OPTIMIZATION.debugLogs) {
        console.log(`Rejecting claim ${claimIndex} for ${player}`);
      }
      const contract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.pointsSystem,
        [
          "function rejectPointsClaim(address player, uint256 claimIndex) external",
          "event PointsClaimRejected(address indexed player, uint256 indexed claimIndex)",
        ],
        getProvider()
      );
      const callData = contract.interface.encodeFunctionData('rejectPointsClaim', [player, claimIndex]);
      const userOp = await builder.execute(TESTNET_CONFIG.smartContracts.pointsSystem, 0, callData);
      const res = await client.sendUserOperation(userOp);
      if (API_OPTIMIZATION.debugLogs) {
        console.log(`UserOperation sent: ${res.userOpHash}`);
      }
      const receipt = await res.wait();
      let rejectedClaimIndex = null;
      if (receipt && receipt.logs) {
        const iface = new ethers.Interface([
          "event PointsClaimRejected(address indexed player, uint256 indexed claimIndex)",
        ]);
        for (const log of receipt.logs) {
          try {
            const parsed = iface.parseLog(log);
            if (parsed && parsed.name === "PointsClaimRejected") {
              rejectedClaimIndex = parsed.args.claimIndex.toString();
              break;
            }
          } catch {
            continue;
          }
        }
      }
      return {
        userOpHash: res.userOpHash,
        transactionHash: receipt?.transactionHash,
        rejectedClaimIndex,
        receipt,
      };
    },
    paymentType,
    selectedToken,
    options
  );
};

export const claimTokensAA = async (
  accountSigner: ethers.Signer,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: { apiKey?: string; gasMultiplier?: number }
) => {
  const contract = new ethers.Contract(
    TESTNET_CONFIG.smartContracts.pointsSystem,
    [
      "function userPoints(address) view returns (uint256)",
      "function pointsToTokensRate() view returns (uint256)",
      "function arcToken() view returns (address)",
      "function getContractTokenBalance() view returns (uint256)",
    ],
    getProvider()
  );
  const userAddress = await accountSigner.getAddress();
  const points = await contract.userPoints(userAddress);
  if (points === 0) {
    throw new Error(`No points to claim for ${userAddress}`);
  }
  const rate = await contract.pointsToTokensRate();
  const tokensNeeded = points.mul(rate);
  const balance = await contract.getContractTokenBalance();
  if (balance.lt(tokensNeeded)) {
    throw new Error(`Insufficient contract balance: ${ethers.formatUnits(balance)} < ${ethers.formatUnits(tokensNeeded)} ARC`);
  }

  const opKey = generateOperationKey('claimTokensAA', [
    await accountSigner.getAddress(),
    paymentType,
    selectedToken,
    options?.gasMultiplier || 100,
  ]);
  return executeOperation(
    opKey,
    accountSigner,
    async (client, builder) => {
      if (API_OPTIMIZATION.debugLogs) {
        console.log(`Claiming ${points} points for ${ethers.formatUnits(tokensNeeded)} ARC`);
      }
      const contract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.pointsSystem,
        [
          "function claimTokens() external",
          "event TokensClaimed(address indexed player, uint256 amount)",
        ],
        getProvider()
      );
      const callData = contract.interface.encodeFunctionData('claimTokens', []);
      const userOp = await builder.execute(TESTNET_CONFIG.smartContracts.pointsSystem, 0, callData);
      const res = await client.sendUserOperation(userOp);
      if (API_OPTIMIZATION.debugLogs) {
        console.log(`UserOperation sent: ${res.userOpHash}`);
      }
      const receipt = await res.wait();
      let claimedAmount = null;
      if (receipt && receipt.logs) {
        const iface = new ethers.Interface(["event TokensClaimed(address indexed player, uint256 amount)"]);
        for (const log of receipt.logs) {
          try {
            const parsed = iface.parseLog(log);
            if (parsed && parsed.name === "TokensClaimed") {
              claimedAmount = ethers.formatUnits(parsed.args.amount);
              break;
            }
          } catch {
            continue;
          }
        }
      }
      return {
        userOpHash: res.userOpHash,
        transactionHash: receipt?.transactionHash,
        claimedAmount,
        receipt,
      };
    },
    paymentType,
    selectedToken,
    options
  );
};

// Accept admin application (admin only) in AdminApplications
export const acceptAdminApplicationAA = async (
  accountSigner: ethers.Signer,
  applicant: string,
  paymentType: number = 1,
  selectedToken: string = '',
  options?: { apiKey?: string; gasMultiplier?: number }
) => {
  const opKey = generateOperationKey('acceptAdminApplicationAA', [
    await accountSigner.getAddress(),
    paymentType,
    selectedToken,
    options?.gasMultiplier || 100
  ]);
  return executeOperation(
    opKey,
    accountSigner,
    async (client, builder) => {
      const contract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.adminApplications,
        ["function acceptAdminApplication(address applicant) external"],
        getProvider()
      );
      const callData = contract.interface.encodeFunctionData('acceptAdminApplication', [applicant]);
      const userOp = await builder.execute(TESTNET_CONFIG.smartContracts.adminApplications, 0, callData);
      const res = await client.sendUserOperation(userOp);
      const receipt = await res.wait();
      return {
        userOpHash: res.userOpHash,
        transactionHash: receipt?.transactionHash,
        receipt
      };
    },
    paymentType,
    selectedToken,
    options
  );
};

// Reject admin application (admin only) in AdminApplications
export const rejectAdminApplicationAA = async (
  accountSigner: ethers.Signer,
  applicant: string,
  paymentType: number = 1,
  selectedToken: string = '',
  options?: { apiKey?: string; gasMultiplier?: number }
) => {
  const opKey = generateOperationKey('rejectAdminApplicationAA', [
    await accountSigner.getAddress(),
    paymentType,
    selectedToken,
    options?.gasMultiplier || 100
  ]);
  return executeOperation(
    opKey,
    accountSigner,
    async (client, builder) => {
      const contract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.adminApplications,
        ["function rejectAdminApplication(address applicant) external"],
        getProvider()
      );
      const callData = contract.interface.encodeFunctionData('rejectAdminApplication', [applicant]);
      const userOp = await builder.execute(TESTNET_CONFIG.smartContracts.adminApplications, 0, callData);
      const res = await client.sendUserOperation(userOp);
      const receipt = await res.wait();
      return {
        userOpHash: res.userOpHash,
        transactionHash: receipt?.transactionHash,
        receipt
      };
    },
    paymentType,
    selectedToken,
    options
  );
};

// Allocate developer revenue (admin only) in DeveloperPayouts
export const allocateDeveloperRevenueAA = async (
  accountSigner: ethers.Signer,
  developer: string,
  amount: bigint,
  paymentType: number = 1,
  selectedToken: string = '',
  options?: { apiKey?: string; gasMultiplier?: number }
) => {
  const opKey = generateOperationKey('allocateDeveloperRevenueAA', [
    await accountSigner.getAddress(),
    paymentType,
    selectedToken,
    options?.gasMultiplier || 100
  ]);
  return executeOperation(
    opKey,
    accountSigner,
    async (client, builder) => {
      const contract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.developerPayouts,
        ["function allocateDeveloperRevenue(address developer, uint256 amount) external"],
        getProvider()
      );
      const callData = contract.interface.encodeFunctionData('allocateDeveloperRevenue', [developer, amount]);
      const userOp = await builder.execute(TESTNET_CONFIG.smartContracts.developerPayouts, 0, callData);
      const res = await client.sendUserOperation(userOp);
      const receipt = await res.wait();
      return {
        userOpHash: res.userOpHash,
        transactionHash: receipt?.transactionHash,
        receipt
      };
    },
    paymentType,
    selectedToken,
    options
  );
};

// Transfer NFT via NFTManager
export const transferNFTAA = async (
  accountSigner: ethers.Signer,
  to: string,
  tokenId: bigint,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: { apiKey?: string; gasMultiplier?: number }
) => {
  const opKey = generateOperationKey('transferNFTAA', [
    await accountSigner.getAddress(),
    paymentType,
    selectedToken,
    options?.gasMultiplier || 100
  ]);
  return executeOperation(
    opKey,
    accountSigner,
    async (client, builder) => {
      const contract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.nftManager,
        ["function transferNFT(address to, uint256 tokenId) external"],
        getProvider()
      );
      const callData = contract.interface.encodeFunctionData('transferNFT', [to, tokenId]);
      builder.setPaymasterOptions({
        apikey: API_KEY || options?.apiKey || '',
        rpc: TESTNET_CONFIG.aaPlatform.paymasterRpc,
        type: 0
      });
      const userOp = await builder.execute(TESTNET_CONFIG.smartContracts.nftManager, 0, callData);
      if (API_OPTIMIZATION.debugLogs) console.log(`Sending NFT transfer operation for token ID ${tokenId} to ${to}`);
      const res = await client.sendUserOperation(userOp);
      console.log("UserOperation sent with hash:", res.userOpHash);
      const receipt = await res.wait();
      let transactionHash = '';
      if (receipt && receipt.transactionHash) {
        transactionHash = receipt.transactionHash;
      }
      return {
        success: true,
        userOpHash: res.userOpHash,
        transactionHash,
        receipt
      };
    },
    paymentType,
    selectedToken,
    options
  );
};

// Create tournament in TournamentHub
export const createTournamentAA = async (
  accountSigner: ethers.Signer,
  name: string,
  prizePool: bigint,
  startTime: number,
  endTime: number,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: { apiKey?: string; gasMultiplier?: number }
) => {
  const opKey = generateOperationKey('createTournamentAA', [
    await accountSigner.getAddress(),
    name,
    prizePool.toString(),
    startTime,
    endTime,
    paymentType,
    selectedToken,
    options?.gasMultiplier || 100
  ]);
  return executeOperation(
    opKey,
    accountSigner,
    async (client, builder) => {
      const contract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.tournamentHub,
        ["function createTournament(string name, uint256 prizePool, uint256 startTime, uint256 endTime) external"],
        getProvider()
      );
      const callData = contract.interface.encodeFunctionData('createTournament', [
        name,
        prizePool,
        startTime,
        endTime
      ]);
      const userOp = await builder.execute(TESTNET_CONFIG.smartContracts.tournamentHub, 0, callData);
      const res = await client.sendUserOperation(userOp);
      const receipt = await res.wait();
      return {
        userOpHash: res.userOpHash,
        transactionHash: receipt?.transactionHash,
        receipt
      };
    },
    paymentType,
    selectedToken,
    options
  );
};

// Join a tournament in TournamentHub
export const joinTournamentAA = async (
  accountSigner: ethers.Signer,
  tournamentId: number,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: { apiKey?: string; gasMultiplier?: number }
) => {
  const opKey = generateOperationKey('joinTournamentAA', [
    await accountSigner.getAddress(),
    tournamentId,
    paymentType,
    selectedToken,
    options?.gasMultiplier || 100
  ]);
  return executeOperation(
    opKey,
    accountSigner,
    async (client, builder) => {
      const contract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.tournamentHub,
        ["function joinTournament(uint256 tournamentId) external"],
        getProvider()
      );
      const callData = contract.interface.encodeFunctionData('joinTournament', [tournamentId]);
      const userOp = await builder.execute(TESTNET_CONFIG.smartContracts.tournamentHub, 0, callData);
      const res = await client.sendUserOperation(userOp);
      const receipt = await res.wait();
      return {
        userOpHash: res.userOpHash,
        transactionHash: receipt?.transactionHash,
        receipt
      };
    },
    paymentType,
    selectedToken,
    options
  );
};

// Submit tournament score to TournamentHub
export const submitTournamentScoreAA = async (
  accountSigner: ethers.Signer,
  tournamentId: number,
  score: number,
  signature: string,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: { apiKey?: string; gasMultiplier?: number }
) => {
  const opKey = generateOperationKey('submitTournamentScoreAA', [
    await accountSigner.getAddress(),
    tournamentId,
    score,
    signature,
    paymentType,
    selectedToken,
    options?.gasMultiplier || 100
  ]);
  return executeOperation(
    opKey,
    accountSigner,
    async (client, builder) => {
      const contract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.tournamentHub,
        ["function submitTournamentScore(uint256 tournamentId, uint256 score, bytes signature) external"],
        getProvider()
      );
      const callData = contract.interface.encodeFunctionData('submitTournamentScore', [
        tournamentId,
        score,
        signature
      ]);
      const userOp = await builder.execute(TESTNET_CONFIG.smartContracts.tournamentHub, 0, callData);
      const res = await client.sendUserOperation(userOp);
      const receipt = await res.wait();
      return {
        userOpHash: res.userOpHash,
        transactionHash: receipt?.transactionHash,
        receipt
      };
    },
    paymentType,
    selectedToken,
    options
  );
};

// Distribute tournament prizes in TournamentHub (admin only)
export const distributeTournamentPrizesAA = async (
  accountSigner: ethers.Signer,
  tournamentId: number,
  winners: string[],
  amounts: bigint[],
  paymentType: number = 1,
  selectedToken: string = '',
  options?: { apiKey?: string; gasMultiplier?: number }
) => {
  const opKey = generateOperationKey('distributeTournamentPrizesAA', [
    await accountSigner.getAddress(),
    tournamentId,
    winners,
    amounts.map(a => a.toString()),
    paymentType,
    selectedToken,
    options?.gasMultiplier || 100
  ]);
  return executeOperation(
    opKey,
    accountSigner,
    async (client, builder) => {
      const contract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.tournamentHub,
        ["function distributeTournamentPrizes(uint256 tournamentId, address[] winners, uint256[] amounts) external"],
        getProvider()
      );
      const callData = contract.interface.encodeFunctionData('distributeTournamentPrizes', [
        tournamentId,
        winners,
        amounts
      ]);
      const userOp = await builder.execute(TESTNET_CONFIG.smartContracts.tournamentHub, 0, callData);
      const res = await client.sendUserOperation(userOp);
      const receipt = await res.wait();
      return {
        userOpHash: res.userOpHash,
        transactionHash: receipt?.transactionHash,
        receipt
      };
    },
    paymentType,
    selectedToken,
    options
  );
};

// Claim developer payout from DeveloperPayouts
export const claimDeveloperPayoutAA = async (
  accountSigner: ethers.Signer,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: { apiKey?: string; gasMultiplier?: number }
) => {
  const opKey = generateOperationKey('claimDeveloperPayoutAA', [
    await accountSigner.getAddress(),
    paymentType,
    selectedToken,
    options?.gasMultiplier || 100
  ]);
  return executeOperation(
    opKey,
    accountSigner,
    async (client, builder) => {
      const contract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.developerPayouts,
        ["function claimDeveloperPayout() external"],
        getProvider()
      );
      const callData = contract.interface.encodeFunctionData('claimDeveloperPayout', []);
      const userOp = await builder.execute(TESTNET_CONFIG.smartContracts.developerPayouts, 0, callData);
      const res = await client.sendUserOperation(userOp);
      const receipt = await res.wait();
      return {
        userOpHash: res.userOpHash,
        transactionHash: receipt?.transactionHash,
        receipt
      };
    },
    paymentType,
    selectedToken,
    options
  );
};

export const addAdminAA = async (
  accountSigner: ethers.Signer,
  admin: string,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: { apiKey?: string; gasMultiplier?: number }
) => {
  const aaWalletAddress = await getAAWalletAddress(accountSigner);
  const contract = new ethers.Contract(
    TESTNET_CONFIG.smartContracts.pointsSystem,
    ["function isOwner() view returns (bool)"],
    getProvider()
  );
  // const isOwner = await contract.connect(accountSigner).isOwner();
  // if (!isOwner) {
  //   throw new Error(`AA wallet ${aaWalletAddress} is not the owner`);
  // }
  // if (!ethers.isAddress(admin)) {
  //   throw new Error(`Invalid admin address: ${admin}`);
  // }

  const opKey = generateOperationKey('addAdminAA', [
    await accountSigner.getAddress(),
    admin,
    paymentType,
    selectedToken,
    options?.gasMultiplier || 100,
  ]);
  return executeOperation(
    opKey,
    accountSigner,
    async (client, builder) => {
      if (API_OPTIMIZATION.debugLogs) {
        console.log(`Adding admin ${admin}`);
      }
      const contract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.pointsSystem,
        [
          "function addAdmin(address admin) external",
          "event AdminAdded(address indexed admin)",
        ],
        getProvider()
      );
      const callData = contract.interface.encodeFunctionData('addAdmin', [admin]);
      const userOp = await builder.execute(TESTNET_CONFIG.smartContracts.pointsSystem, 0, callData);
      const res = await client.sendUserOperation(userOp);
      if (API_OPTIMIZATION.debugLogs) {
        console.log(`UserOperation sent: ${res.userOpHash}`);
      }
      const receipt = await res.wait();
      let addedAdmin = null;
      if (receipt && receipt.logs) {
        const iface = new ethers.Interface(["event AdminAdded(address indexed admin)"]);
        for (const log of receipt.logs) {
          try {
            const parsed = iface.parseLog(log);
            if (parsed && parsed.name === "AdminAdded") {
              addedAdmin = parsed.args.admin;
              break;
            }
          } catch {
            continue;
          }
        }
      }
      return {
        userOpHash: res.userOpHash,
        transactionHash: receipt?.transactionHash,
        addedAdmin,
        receipt,
      };
    },
    paymentType,
    selectedToken,
    options
  );
};

export const removeAdminAA = async (
  accountSigner: ethers.Signer,
  admin: string,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: { apiKey?: string; gasMultiplier?: number }
) => {
  const aaWalletAddress = await getAAWalletAddress(accountSigner);
  const contract = new ethers.Contract(
    TESTNET_CONFIG.smartContracts.pointsSystem,
    ["function isOwner() view returns (bool)"],
    getProvider()
  );
  // const isOwner = await contract.connect(accountSigner).isOwner();
  // if (!isOwner) {
  //   throw new Error(`AA wallet ${aaWalletAddress} is not the owner`);
  // }
  // if (!ethers.isAddress(admin)) {
  //   throw new Error(`Invalid admin address: ${admin}`);
  // }

  const opKey = generateOperationKey('removeAdminAA', [
    await accountSigner.getAddress(),
    admin,
    paymentType,
    selectedToken,
    options?.gasMultiplier || 100,
  ]);
  return executeOperation(
    opKey,
    accountSigner,
    async (client, builder) => {
      if (API_OPTIMIZATION.debugLogs) {
        console.log(`Removing admin ${admin}`);
      }
      const contract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.pointsSystem,
        [
          "function removeAdmin(address admin) external",
          "event AdminRemoved(address indexed admin)",
        ],
        getProvider()
      );
      const callData = contract.interface.encodeFunctionData('removeAdmin', [admin]);
      const userOp = await builder.execute(TESTNET_CONFIG.smartContracts.pointsSystem, 0, callData);
      const res = await client.sendUserOperation(userOp);
      if (API_OPTIMIZATION.debugLogs) {
        console.log(`UserOperation sent: ${res.userOpHash}`);
      }
      const receipt = await res.wait();
      let removedAdmin = null;
      if (receipt && receipt.logs) {
        const iface = new ethers.Interface(["event AdminRemoved(address indexed admin)"]);
        for (const log of receipt.logs) {
          try {
            const parsed = iface.parseLog(log);
            if (parsed && parsed.name === "AdminRemoved") {
              removedAdmin = parsed.args.admin;
              break;
            }
          } catch {
            continue;
          }
        }
      }
      return {
        userOpHash: res.userOpHash,
        transactionHash: receipt?.transactionHash,
        removedAdmin,
        receipt,
      };
    },
    paymentType,
    selectedToken,
    options
  );
};

export const setPointsToTokensRateAA = async (
  accountSigner: ethers.Signer,
  newRate: number,
  paymentType: number = 0,
  selectedToken: string = '',
  options?: { apiKey?: string; gasMultiplier?: number }
) => {
  const aaWalletAddress = await getAAWalletAddress(accountSigner);
  const contract = new ethers.Contract(
    TESTNET_CONFIG.smartContracts.pointsSystem,
    ["function isAdmin(address) view returns (bool)"],
    getProvider()
  );
  if (!(await contract.isAdmin(aaWalletAddress))) {
    throw new Error(`AA wallet ${aaWalletAddress} is not an admin`);
  }
  if (newRate <= 0) {
    throw new Error(`Invalid rate: ${newRate}`);
  }

  const opKey = generateOperationKey('setPointsToTokensRateAA', [
    await accountSigner.getAddress(),
    newRate,
    paymentType,
    selectedToken,
    options?.gasMultiplier || 100,
  ]);
  return executeOperation(
    opKey,
    accountSigner,
    async (client, builder) => {
      if (API_OPTIMIZATION.debugLogs) {
        console.log(`Setting points to tokens rate to ${newRate}`);
      }
      const contract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.pointsSystem,
        ["function setPointsToTokensRate(uint256 _newRate) external"],
        getProvider()
      );
      const callData = contract.interface.encodeFunctionData('setPointsToTokensRate', [newRate]);
      const userOp = await builder.execute(TESTNET_CONFIG.smartContracts.pointsSystem, 0, callData);
      const res = await client.sendUserOperation(userOp);
      if (API_OPTIMIZATION.debugLogs) {
        console.log(`UserOperation sent: ${res.userOpHash}`);
      }
      const receipt = await res.wait();
      return {
        userOpHash: res.userOpHash,
        transactionHash: receipt?.transactionHash,
        receipt,
      };
    },
    paymentType,
    selectedToken,
    options
  );
};