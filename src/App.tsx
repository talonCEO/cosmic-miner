import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import React from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { GameProvider, useGame } from "@/context/GameContext";
import { AdProvider } from "@/context/AdContext";
import { AudioProvider } from "@/context/AudioContext";
import UnlockNotificationWrapper from "@/components/UnlockNotification";

const queryClient = new QueryClient();

// Ensure a flash root exists in the DOM
const ensureFlashRoot = () => {
  let flashRoot = document.getElementById("flash-root");
  if (!flashRoot) {
    flashRoot = document.createElement("div");
    flashRoot.id = "flash-root";
    flashRoot.style.position = "fixed";
    flashRoot.style.top = "0";
    flashRoot.style.left = "0";
    flashRoot.style.width = "100%";
    flashRoot.style.height = "100%";
    flashRoot.style.zIndex = "10000000"; // Higher than popup's 999999
    document.body.appendChild(flashRoot);
  }
  return flashRoot;
};

const FlashAnimation: React.FC<{ trigger: boolean; onComplete: () => void }> = ({ trigger, onComplete }) => {
  return createPortal(
    <AnimatePresence>
      {trigger && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-white pointer-events-none"
          onAnimationComplete={onComplete}
        />
      )}
    </AnimatePresence>,
    ensureFlashRoot()
  );
};

const AppContent = () => {
  const { state, dispatch } = useGame();
  const [showFlash, setShowFlash] = React.useState(false);
  const [lastFlashTrigger, setLastFlashTrigger] = React.useState<number | null>(null);
  const location = useLocation();

  React.useEffect(() => {
    const timeWarpBoosts = state.activeBoosts.filter(b => b.id === "boost-time-warp");
    const latestActivation = timeWarpBoosts.reduce(
      (max, boost) => Math.max(max, boost.activatedAt || 0),
      0
    );

    if (latestActivation > (lastFlashTrigger || 0)) {
      setShowFlash(true);
      setLastFlashTrigger(latestActivation);
      // Reset flash after animation duration to allow retriggering
      setTimeout(() => setShowFlash(false), 200);
    }
  }, [state.activeBoosts, lastFlashTrigger]);

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
