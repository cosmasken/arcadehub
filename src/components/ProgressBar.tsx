import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  color?: string; // tailwind color e.g. 'cyan'
  height?: string; // tailwind height e.g. 'h-2'
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, label, color = 'cyan', height = 'h-2' }) => {
  const percentage = total === 0 ? 0 : Math.min(100, Math.round((current / total) * 100));

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-0.5 text-xs text-gray-300">
          <span>{label}</span>
          <span>{current}/{total}</span>
        </div>
      )}
      <div className={`w-full bg-gray-700/60 rounded-full ${height}`}>
        <div
          className={`bg-${color}-500 rounded-full ${height} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
