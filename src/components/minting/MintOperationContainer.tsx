import React, { useEffect, useState } from 'react';
import { useWalletStore } from '../../stores/useWalletStore';
import { useGasPriceStore } from '../../stores/useGasPriceStore';
import { useTokenStore } from '../../stores/useTokenStore';
import PaymentTypeSelector from './PaymentTypeSelector';
import RecipientInput from './RecipientInput';
import TokenSelector from './TokenSelector';
import TokenApproval from './TokenApproval';
import MintButton from './MintButton';
import NFTGallery from './NFTGallery';
import AdvancedSettings from './AdvancedSettings';
import { toast } from 'react-toastify';
import './MintOperationContainer.css';

/**
 * Main container component that orchestrates the NFT minting flow
 */
const MintOperationContainer: React.FC = () => {
  const { walletState } = useWalletStore();
  const { gasPriceInfo, tokenGasPrices } = useGasPriceStore();
  const { supportedTokens } = useTokenStore();

  useEffect(() => {
    if (walletState.isConnected) {
      useGasPriceStore.getState().fetchGasPrice(walletState.signer);
      
      // Set up interval to refresh gas price every 30 seconds
      const interval = setInterval(() => {
        useGasPriceStore.getState().fetchGasPrice(walletState.signer);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [walletState.isConnected]);
  
  // Fetch token gas prices when tokens are loaded or payment type changes
  useEffect(() => {
    if (supportedTokens.length > 0 && paymentType !== 'SPONSORED') {
      useGasPriceStore.getState().fetchTokenGasPrices(supportedTokens, walletState.signer);
    }
  }, [supportedTokens]);


  // Form state
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [paymentType, setPaymentType] = useState<string>('SPONSORED');
  const [gasMultiplier, setGasMultiplier] = useState<number>(100); // Default to 100%

  // Transaction state
  const [requiredAllowance, setRequiredAllowance] = useState<string>('0');
  const [approvalComplete, setApprovalComplete] = useState<boolean>(false);
  const [latestTxHash, setLatestTxHash] = useState<string>('');

  // Handle recipient address change
  const handleRecipientChange = (address: string) => {
    setRecipientAddress(address);
  };

  // Handle token selection
  const handleTokenSelect = (tokenAddress: string) => {
    setSelectedToken(tokenAddress);
    setApprovalComplete(false);
  };

  // Handle payment type selection
  const handlePaymentTypeChange = (type: string) => {
    setPaymentType(type);
    if (type === 'SPONSORED') {
      setSelectedToken('');
    }
  };

  // Handle gas multiplier change
  const handleGasMultiplierChange = (multiplier: number) => {
    // Convert multiplier to percentage (1 = 100%)
    const percentage = multiplier * 100;
    
    // Validate multiplier range (50-500)
    if (percentage < 50) {
      setGasMultiplier(0.5);
      toast.warning('Gas multiplier must be at least 50%');
      return;
    }
    if (percentage > 500) {
      setGasMultiplier(5);
      toast.warning('Gas multiplier cannot exceed 500%');
      return;
    }
    
    setGasMultiplier(multiplier);
  };

  // Handle approval completion
  const handleApprovalComplete = () => {
    setApprovalComplete(true);
  };

  // Handle successful mint
  const handleMintSuccess = (txHash: string) => {
    setLatestTxHash(txHash);
    toast.success('NFT minted successfully!');
  };

  // Handle mint error
  const handleMintError = (error: Error) => {
    console.error('Mint operation failed:', error);
    toast.error(`Mint operation failed: ${error.message}`);
  };

  // Format the last updated time
  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) {
      return `${diffSeconds} seconds ago`;
    }

    return date.toLocaleTimeString();
  };

  return (
    <div className="mint-operation-container">
      <h2 className="section-title">Mint Your NFT</h2>

      {!walletState.isConnected ? (
        <div className="wallet-warning">
          <p>Please connect your wallet using the button in the header to mint NFTs</p>
        </div>
      ) : (
        <>

          {/* Gas Price Information */}
          <div className="gas-price-section">
            <div className="gas-price-header">
              <h3>Network Gas Price</h3>
              <button
                onClick={() => useGasPriceStore.getState().fetchGasPrice(walletState.signer)}
                className="btn btn-small refresh-btn"
                disabled={gasPriceInfo.isLoading}
              >
                {gasPriceInfo.isLoading ? 'Updating...' : 'Refresh'}
              </button>
            </div>

            <div className="gas-price-info">
              <div className="gas-price-value">
                <span className="gas-price-label">Current Gas Price:</span>
                {gasPriceInfo.gasPrice === '0' ? (
                  <span className="gas-price-unavailable">
                    Not available
                    <button
                      onClick={() => useGasPriceStore.getState().fetchGasPrice(walletState.signer)}
                      className="btn btn-small btn-inline"
                      disabled={gasPriceInfo.isLoading}
                    >
                      Try again
                    </button>
                  </span>
                ) : (
                  <span className="gas-price">{gasPriceInfo.gasPriceGwei} Gwei</span>
                )}
              </div>

              {/* Token-specific gas price information */}
              {paymentType !== 'SPONSORED' && selectedToken && tokenGasPrices[selectedToken] && (
                <div className="token-gas-price">
                  <span className="token-gas-label">Estimated gas cost with selected token:</span>
                  <span className="token-gas-value">
                    {tokenGasPrices[selectedToken].priceInToken}{' '}
                    {supportedTokens.find((token) => token.address === selectedToken)?.symbol}
                  </span>
                  <p className="token-gas-note">
                    This is an estimate based on current gas prices and may vary based on network
                    conditions.
                  </p>
                </div>
              )}

              <div className="gas-price-updated">
                {gasPriceInfo.gasPrice !== '0'
                  ? `Last updated: ${formatLastUpdated(gasPriceInfo.lastUpdated)}`
                  : 'Gas price information not available. Try refreshing after connecting your wallet.'}
              </div>
              <div className="gas-price-note">
                <p>Note: Actual gas costs may vary based on transaction complexity and network conditions.</p>
              </div>
            </div>
          </div>

          <div className="mint-form">
            {/* Recipient Input */}
            <RecipientInput recipientAddress={recipientAddress} onRecipientChange={handleRecipientChange} />

            {/* Payment Options */}
            <div className="payment-options">
              <h3 className="subsection-title">Payment Options</h3>

              <PaymentTypeSelector
                selectedPaymentType={paymentType}
                onPaymentTypeChange={handlePaymentTypeChange}
              />

              {paymentType !== 'SPONSORED' && (
                <>
                  <TokenSelector selectedToken={selectedToken} onTokenSelect={handleTokenSelect} />

                  {selectedToken && (
                    <TokenApproval
                      selectedToken={selectedToken}
                      tokenAmount={'0.01'} // Placeholder amount
                      requiredAllowance={requiredAllowance}
                      onApprovalComplete={handleApprovalComplete}
                    />
                  )}
                </>
              )}
            </div>

            {/* Advanced Settings */}
            <AdvancedSettings
              gasMultiplier={gasMultiplier}
              onGasMultiplierChange={handleGasMultiplierChange}
            />

            {/* Mint Button */}
            <MintButton
              recipientAddress={recipientAddress}
              selectedToken={selectedToken}
              paymentType={paymentType === 'SPONSORED' ? 0 : paymentType === 'PREPAY' ? 1 : 2}
              gasMultiplier={gasMultiplier}
              onMintSuccess={handleMintSuccess}
              onMintError={handleMintError}
              disabled={!!(paymentType === 'PREPAY' && selectedToken && !approvalComplete)}
            />

            {/* Transaction Result Section */}
            {latestTxHash && (
              <div className="transaction-result">
                <h4>Transaction Successful!</h4>
                <div className="transaction-info">
                  <p>Transaction Hash:</p>
                  <div className="hash-container">
                    <code className="transaction-hash">{latestTxHash}</code>
                    <button
                      onClick={() => navigator.clipboard.writeText(latestTxHash)}
                      className="copy-hash-btn"
                      title="Copy transaction hash"
                    >
                      Copy
                    </button>
                  </div>
                  <a
                    href={`https://testnet.neroscan.io/tx/${latestTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-tx-link"
                  >
                    View on Explorer
                  </a>
                </div>
              </div>
            )}

            {/* NFT Gallery */}
            <NFTGallery latestTxHash={latestTxHash} />
          </div>
        </>
      )}
    </div>
  );
};

export default MintOperationContainer;