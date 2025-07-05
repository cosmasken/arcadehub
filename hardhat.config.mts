import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const TESTNET_CONFIG = {
  rpcUrl: "https://rpc-testnet.nerochain.io",
  chainId: 2052,
  accounts: [process.env.PRIVATE_KEY!],
};

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    nero: {
      url: TESTNET_CONFIG.rpcUrl,
      chainId: TESTNET_CONFIG.chainId,
      accounts: TESTNET_CONFIG.accounts,
    },
    // Optionally add localhost or other testnets here
  },
};

export default config;
