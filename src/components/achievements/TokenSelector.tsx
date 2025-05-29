import React, { useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useTokenStore } from '../../stores/useTokenStore';
import { useWalletStore } from '../../stores/useWalletStore';

// interface Token {
//   address: string;
//   symbol: string;
//   balance: string;
// }

interface TokenSelectorProps {
  selectedToken: string;
  onTokenSelect: (tokenAddress: string) => void;
}

// Mock tokens for demo
// const mockTokens: Token[] = [
//   { address: '0x1234...', symbol: 'USDC', balance: '100.0' },
//   { address: '0x5678...', symbol: 'DAI', balance: '250.5' },
//   { address: '0x9abc...', symbol: 'WETH', balance: '0.5' },
// ];

const TokenSelector: React.FC<TokenSelectorProps> = ({ selectedToken, onTokenSelect }) => {
   const { supportedTokens, tokenBalances,loadTokenBalances} = useTokenStore();
   const { aaWalletAddress } = useWalletStore();


  //  const { supportedTokens, tokenBalances, loadSupportedTokens, loadTokenBalances } = useTokenStore();


   useEffect(() => {
     if (aaWalletAddress && supportedTokens.length > 0) {
       loadTokenBalances(aaWalletAddress, supportedTokens);
     }
   }, [aaWalletAddress, supportedTokens]);

  //  log supportedtokens and tokenbalances to console usinf useeffect
  useEffect(() => {
    console.log('Supported Tokens:', supportedTokens);
    console.log('Token Balances:', tokenBalances);
  }
, [supportedTokens, tokenBalances]);
  

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (isNaN(num)) return '0';
    if (num === 0) return '0';
    if (num < 0.001) return '<0.001';
    return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-300">
        Token to Use for Gas:
      </label>
      <Select value={selectedToken} onValueChange={onTokenSelect}>
        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
          <SelectValue placeholder="Select a token" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600">
          {supportedTokens.map((token) => (
            <SelectItem key={token.address} value={token.address} className="text-white hover:bg-gray-700">
              {token.symbol} - {formatBalance(tokenBalances[token.address])} available
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-gray-400">
        * Balances shown are from your AA wallet address
      </p>
    </div>
  );
};

export default TokenSelector;
