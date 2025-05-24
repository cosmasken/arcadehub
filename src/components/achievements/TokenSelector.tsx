import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Token {
  address: string;
  symbol: string;
  balance: string;
}

interface TokenSelectorProps {
  selectedToken: string;
  onTokenSelect: (tokenAddress: string) => void;
}

// Mock tokens for demo
const mockTokens: Token[] = [
  { address: '0x1234...', symbol: 'USDC', balance: '100.0' },
  { address: '0x5678...', symbol: 'DAI', balance: '250.5' },
  { address: '0x9abc...', symbol: 'WETH', balance: '0.5' },
];

const TokenSelector: React.FC<TokenSelectorProps> = ({ selectedToken, onTokenSelect }) => {
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
          {mockTokens.map((token) => (
            <SelectItem key={token.address} value={token.address} className="text-white hover:bg-gray-700">
              {token.symbol} - {formatBalance(token.balance)} available
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-gray-400">
        * Balances shown are from your wallet address
      </p>
    </div>
  );
};

export default TokenSelector;
