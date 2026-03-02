import { Toaster } from "@/components/ui/sonner";
import {
  BarChart2,
  Calendar,
  Home,
  Image,
  MessageCircle,
  Users,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useActor } from "./hooks/useActor";
import { useInit } from "./hooks/useQueries";
import ActivitiesPage from "./pages/ActivitiesPage";
import EventsPage from "./pages/EventsPage";
import HomePage from "./pages/HomePage";
import JoinPage from "./pages/JoinPage";
import MembersPage from "./pages/MembersPage";
import MessageBoardPage from "./pages/MessageBoardPage";
import PhotosPage from "./pages/PhotosPage";
import PollsPage from "./pages/PollsPage";
import type { Page } from "./types";

const navItems: {
  id: Page;
  label: string;
  icon: typeof Home;
  emoji: string;
}[] = [
  { id: "home", label: "Home", icon: Home, emoji: "🏠" },
  { id: "members", label: "Members", icon: Users, emoji: "👨‍👩‍👧‍👦" },
  { id: "messages", label: "Messages", icon: MessageCircle, emoji: "💬" },
  { id: "activities", label: "Fun", icon: Zap, emoji: "🎉" },
  { id: "photos", label: "Photos", icon: Image, emoji: "📸" },
  { id: "events", label: "Events", icon: Calendar, emoji: "📅" },
  { id: "polls", label: "Polls", icon: BarChart2, emoji: "📊" },
];

export default function App() {
  const [activePage, setActivePage] = useState<Page>("home");
  const { actor } = useActor();
  const { mutate: init } = useInit();

  // Detect invite code in URL
  const [inviteCode] = useState<string | null>(() =>
    new URLSearchParams(window.location.search).get("code"),
  );

  useEffect(() => {
    if (actor) {
      init();
    }
  }, [actor, init]);

  // If invite code present, show join page instead of main app
  if (inviteCode) {
    return (
      <>
        <JoinPage code={inviteCode} onJoined={() => setActivePage("home")} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-pattern flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-float">🐾</span>
            <h1 className="font-display font-bold text-xl text-foreground tracking-tight">
              Snuggle Squad
            </h1>
          </div>
          {/* Desktop nav */}
          <nav
            className="hidden sm:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {navItems.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`
                  relative px-4 py-2 rounded-2xl font-body font-medium text-sm transition-all duration-200
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                  ${
                    activePage === item.id
                      ? "bg-primary text-primary-foreground shadow-cozy"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }
                `}
                aria-current={activePage === item.id ? "page" : undefined}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activePage === "home" && <HomePage onNavigate={setActivePage} />}
            {activePage === "members" && <MembersPage />}
            {activePage === "messages" && <MessageBoardPage />}
            {activePage === "activities" && <ActivitiesPage />}
            {activePage === "photos" && <PhotosPage />}
            {activePage === "events" && <EventsPage />}
            {activePage === "polls" && <PollsPage />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="sm:hidden sticky bottom-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center overflow-x-auto scrollbar-none px-1 py-1 gap-0.5">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`
                flex-shrink-0 flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-2xl transition-all duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                ${
                  activePage === item.id
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground"
                }
              `}
              aria-current={activePage === item.id ? "page" : undefined}
            >
              <span className="text-lg">{item.emoji}</span>
              <span className="text-[10px] font-medium font-body leading-none">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <footer className="hidden sm:block text-center py-4 text-xs text-muted-foreground font-body">
        © {new Date().getFullYear()}. Built with{" "}
        <span className="text-rose-500">♥</span> using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
            typeof window !== "undefined" ? window.location.hostname : "",
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>

      <Toaster />
    </div>
  );
}
