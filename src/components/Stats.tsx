// stats.tsx
// ... (existing imports)

const ActiveBoost: React.FC<{ boost: BoostEffect }> = ({ boost }) => {
  const [timeLeft, setTimeLeft] = useState<number>(boost.remainingTime || 0);
  
  React.useEffect(() => {
    if (!boost.duration) return;
    
    const interval = setInterval(() => {
      if (boost.remainingTime !== undefined) {
        setTimeLeft(boost.remainingTime);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [boost]);
  
  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "Expired";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-slate-900/60 border border-slate-700/60 rounded-lg p-2 mb-2 flex justify-between items-center">
      <div className="flex items-center">
        <div className="mr-2 text-lg">
          {boost.icon}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{boost.name} (x{boost.quantity})</p>
          <p className="text-xs text-slate-400">{boost.description}</p>
        </div>
      </div>
      {boost.duration ? (
        <div className="flex items-center text-xs text-slate-300">
          <Timer size={14} className="mr-1" />
          {formatTime(timeLeft)}
        </div>
      ) : (
        <div className="text-xs text-indigo-400 font-medium">
          Permanent
        </div>
      )}
    </div>
  );
};

const Stats: React.FC = () => {
  const { state, calculatePotentialEssenceReward } = useGame();
  const { calculateTotalCPS, calculateGlobalIncomeMultiplier } = useBoostManager();
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  
  const totalCPS = calculateTotalCPS();
  const globalMultiplier = calculateGlobalIncomeMultiplier();
  const tapPower = calculateTapValue(state);
  
  // Sort activeBoosts: boosts with duration first, then permanent ones
  const sortedActiveBoosts = [...state.activeBoosts].sort((a, b) => {
    if (a.duration && !b.duration) return -1; // a has duration, b doesn't
    if (!a.duration && b.duration) return 1;  // b has duration, a doesn't
    return 0; // both have/no duration, maintain order
  });
  
  return (
    <div className="w-full max-w-md mx-auto pb-12">
      <div className="p-4 rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 relative">
        {/* ... (rest of the existing code until Active Boosts Section) */}
        
        {sortedActiveBoosts.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2 text-indigo-400">Active Boosts</h3>
            <div className="space-y-2">
              {sortedActiveBoosts.map((boost) => (
                <ActiveBoost key={boost.id} boost={boost} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md mx-auto">
          {/* ... (rest of the dialog content) */}
          {sortedActiveBoosts.length > 0 && (
            <div className="bg-slate-700/50 p-3 rounded-lg">
              <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center">
                <Sparkles size={16} className="text-indigo-400 mr-2" />
                Active Boosts
              </h3>
              <div className="space-y-2 mt-2">
                {sortedActiveBoosts.map(boost => (
                  <ActiveBoost key={boost.id} boost={boost} />
                ))}
              </div>
            </div>
          )}
          {/* ... (rest of dialog) */}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Stats;
