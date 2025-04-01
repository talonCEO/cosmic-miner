import React from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';

interface OfflineProgressPopupProps {
  offlineCoins: number;
  onClose: () => void;
}

const OfflineProgressPopup: React.FC<OfflineProgressPopupProps> = ({ offlineCoins, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>

      {/* Popup Content */}
      <div className="relative bg-gray-900/90 border border-indigo-500/30 rounded-lg p-6 w-full max-w-md shadow-lg shadow-indigo-500/20">
        {/* Header */}
        <div className="text-center border-b border-indigo-500/20 pb-4">
          <h2 className="text-xl font-semibold text-indigo-300">Galactic Harvest</h2>
          <p className="text-sm text-slate-300 mt-1">
            Your cosmic miners worked tirelessly while you were away!
          </p>
        </div>

        {/* Earnings Display */}
        <div className="py-6 text-center">
          <p className="text-lg text-blue-300">
            Offline Earnings:
          </p>
          <p className="text-2xl font-bold text-blue-200 mt-2">
            +{formatNumber(offlineCoins)} Coins
          </p>
        </div>

        {/* Close Button */}
        <div className="border-t border-indigo-500/20 pt-4">
          <button
            onClick={onClose}
            className="w-full bg-slate-700/80 text-slate-200 py-3 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors"
          >
            Collect
          </button>
        </div>
      </div>

      {/* Inline Styles for Animations */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default OfflineProgressPopup;