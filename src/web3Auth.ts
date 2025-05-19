import { Web3Auth } from "@web3auth/modal";
import { Web3AuthOptions } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { getDefaultExternalAdapters } from "@web3auth/default-evm-adapter";
import { chainConfig } from "./config";
import { CHAIN_NAMESPACES, IAdapter, IProvider, WEB3AUTH_NETWORK, getEvmChainConfig } from "@web3auth/base";


const clientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID as string;

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

export const web3AuthOptions: Web3AuthOptions = {
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider,
};

export const web3auth = new Web3Auth(web3AuthOptions);

// Configure adapters
const adapters = getDefaultExternalAdapters({ options: web3AuthOptions });
adapters.forEach((adapter) => {
  web3auth.configureAdapter(adapter);
});