import React from 'react';
import { useGasPriceStore } from '../../stores/useGasPriceStore';
import { useWalletStore } from '../../stores/useWalletStore';
import './GasPrice.css';

interface GasPriceProps {
  showRefreshButton?: boolean;
}

/**
 * Component to display current gas prices
 */
const GasPrice: React.FC<GasPriceProps> = ({ showRefreshButton = true }) => {
  const { gasPriceInfo, fetchGasPrice, formatLastUpdated } = useGasPriceStore();
  const { walletState } = useWalletStore();

  const handleRefresh = () => {
    if (walletState.signer) {
      fetchGasPrice(walletState.signer);
    }
  };

  return (
    <div className="gas-price-section">
      <div className="gas-price-header">
        <h3>Network Gas Price</h3>
        {showRefreshButton && (
          <button
            onClick={handleRefresh}
            className="btn btn-small"
            disabled={gasPriceInfo.isLoading || !walletState.signer}
          >
            {gasPriceInfo.isLoading ? 'Updating...' : 'Refresh'}
          </button>
        )}
      </div>

      <div className="gas-price-info">
        <div className="gas-price-value">
          <span className="gas-price-label">Current Gas Price:</span>
          {gasPriceInfo.gasPriceGwei === '0' ? (
            <span className="gas-price-unavailable">
              Not available
              <button
                onClick={handleRefresh}
                className="btn btn-small btn-inline"
                disabled={gasPriceInfo.isLoading || !walletState.signer}
              >
                Try again
              </button>
            </span>
          ) : (
            <span className="gas-price">{gasPriceInfo.gasPriceGwei} Gwei</span>
          )}
        </div>
        <div className="gas-price-updated">
          {gasPriceInfo.gasPriceGwei !== '0'
            ? `Last updated: ${formatLastUpdated(gasPriceInfo.lastUpdated)}`
            : 'Gas price information not available. Try refreshing after connecting your wallet.'}
        </div>
        <div className="gas-price-note">
          <p>Note: Actual gas costs may vary based on transaction complexity and network conditions.</p>
        </div>
      </div>
    </div>
  );
};

export default GasPrice;