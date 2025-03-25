import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { GameProvider, useGame } from "@/context/GameContext";
import { AdProvider } from "@/context/AdContext";
import { AudioProvider } from "@/context/AudioContext";
import UnlockNotificationWrapper from "@/components/UnlockNotification";

const queryClient = new QueryClient();

const FlashAnimation: React.FC<{ trigger: boolean; onComplete: () => void }> = ({ trigger, onComplete }) => {
  return createPortal(
    <AnimatePresence>
      {trigger && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-white z-[2147484000]"
          onAnimationComplete={onComplete}
        />
      )}
    </AnimatePresence>,
    document.body
  );
};

const AppContent = () => {
  const { state } = useGame();
  const [showFlash, setShowFlash] = React.useState(false);
  const [prevBoosts, setPrevBoosts] = React.useState(state.activeBoosts);
  const location = useLocation();

  // Detect boost-time-warp usage
  React.useEffect(() => {
    const currentTimeWarpBoosts = state.activeBoosts.filter(b => b.id === 'boost-time-warp');
    const prevTimeWarpBoosts = prevBoosts.filter(b => b.id === 'boost-time-warp');

    if (currentTimeWarpBoosts.length > prevTimeWarpBoosts.length) {
      setShowFlash(true);
    }

    setPrevBoosts(state.activeBoosts);
  }, [state.activeBoosts]);

  const handleFlashComplete = () => {
    setShowFlash(false);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AdProvider>
                  <AudioProvider>
                    <Index />
                    <UnlockNotificationWrapper />
                  </AudioProvider>
                </AdProvider>
              </motion.div>
            }
          />
          <Route
            path="*"
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <NotFound />
              </motion.div>
            }
          />
        </Routes>
      </AnimatePresence>
      <FlashAnimation trigger={showFlash} onComplete={handleFlashComplete} />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <GameProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </GameProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
