import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom"; // Added for portal
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { GameProvider, useGame } from "@/context/GameContext";
import { AdProvider } from "@/context/AdContext";
import { AudioProvider } from "@/context/AudioContext";
import UnlockNotificationWrapper from "@/components/UnlockNotification";

// FlashAnimation Component
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

// AppContent to manage flash state
const AppContent = () => {
  const { dispatch } = useGame();
  const [showFlash, setShowFlash] = React.useState(false);
  const location = useLocation();

  // Listen for TRIGGER_FLASH action
  React.useEffect(() => {
    const handleFlash = () => {
      setShowFlash(true);
    };
    // Since we're using dispatch directly, we'll trigger it in Inventory.tsx
    // This effect is just a placeholder to reset flash; actual trigger comes from context
    return () => {};
  }, [dispatch]);

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
                <GameProvider>
                  <AdProvider>
                    <AudioProvider>
                      <Index />
                      <UnlockNotificationWrapper />
                    </AudioProvider>
                  </AdProvider>
                </GameProvider>
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
