import React, { useState } from 'react';
import { Button } from '../ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useGasPriceStore } from '../../stores/useGasPriceStore';

interface AdvancedSettingsProps {
  gasMultiplier: number;
  onGasMultiplierChange: (multiplier: number) => void;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  gasMultiplier,
  onGasMultiplierChange,
}) => {
    const { gasPriceInfo } = useGasPriceStore();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <div className="advanced-settings">
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between p-0 h-auto text-left"
      >
        <span className="text-sm font-medium">Advanced Settings</span>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>

      {isExpanded && (
        <div className="settings-panel">
          <div className="form-group">
            <label htmlFor="gasMultiplier">Gas Price Multiplier:</label>
            <div className="multiplier-control">
              <input
                type="range"
                id="gasMultiplier"
                min="0.7"
                max="2"
                step="0.1"
                value={gasMultiplier}
                onChange={(e) => onGasMultiplierChange(parseFloat(e.target.value))}
                className="range-input"
              />
              <span className="multiplier-value">{gasMultiplier}x</span>
            </div>
            <div className="gas-info">
              <p className="gas-price-info">
                Current gas price:{' '}
                {gasPriceInfo.gasPriceGwei
                  ? `${gasPriceInfo.gasPriceGwei} Gwei`
                  : 'Loading...'}
              </p>
              <p className="help-text">
                Adjust this multiplier to increase or decrease the gas price for
                faster or cheaper transactions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSettings;