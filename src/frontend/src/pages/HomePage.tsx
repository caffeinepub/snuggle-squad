import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart2,
  Calendar,
  Heart,
  MessageCircle,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useListSiblings, useStats } from "../hooks/useQueries";
import type { Page } from "../types";
import { loadEvents } from "./EventsPage";
import { loadPolls } from "./PollsPage";

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

const statColors = [
  { bg: "bg-primary/10", text: "text-primary", icon: Users },
  { bg: "bg-lavender/20", text: "text-purple-600", icon: MessageCircle },
  { bg: "bg-sunshine/30", text: "text-amber-600", icon: Zap },
];

function formatEventDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("default", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getUpcomingEvents() {
  const all = loadEvents();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return all
    .filter((e) => new Date(`${e.date}T00:00:00`) >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 2);
}

function getActivePolls() {
  return loadPolls().slice(0, 2);
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: siblings, isLoading: siblingsLoading } = useListSiblings();
  const upcomingEvents = getUpcomingEvents();
  const activePolls = getActivePolls();

  const statItems = [
    {
      label: "Siblings",
      value: stats ? Number(stats.totalSiblings) : 0,
      emoji: "👨‍👩‍👧‍👦",
      page: "members" as Page,
      ...statColors[0],
    },
    {
      label: "Messages",
      value: stats ? Number(stats.totalMessages) : 0,
      emoji: "💬",
      page: "messages" as Page,
      ...statColors[1],
    },
    {
      label: "Activities",
      value: stats ? Number(stats.totalActivities) : 0,
      emoji: "🎉",
      page: "activities" as Page,
      ...statColors[2],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-primary/15 via-card to-lavender/20 border border-border p-8 md:p-12 text-center shadow-cozy"
      >
        {/* Floating decorative emojis */}
        <div
          className="absolute top-4 left-6 text-3xl opacity-60 animate-float"
          style={{ animationDelay: "0s" }}
        >
          🐻
        </div>
        <div
          className="absolute top-6 right-8 text-2xl opacity-50 animate-float"
          style={{ animationDelay: "1s" }}
        >
          🐱
        </div>
        <div
          className="absolute bottom-4 left-10 text-2xl opacity-40 animate-float"
          style={{ animationDelay: "2s" }}
        >
          🐶
        </div>
        <div
          className="absolute bottom-6 right-6 text-3xl opacity-50 animate-float"
          style={{ animationDelay: "0.5s" }}
        >
          🦊
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.1,
              duration: 0.5,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            className="text-6xl mb-4 inline-block"
          >
            🐾
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="font-display font-black text-4xl md:text-5xl text-foreground mb-3 tracking-tight"
          >
            Snuggle Squad
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="font-body text-muted-foreground text-lg max-w-sm mx-auto"
          >
            Our little family corner — where every sibling belongs 💕
          </motion.p>
        </div>
      </motion.section>

      {/* Member Avatars */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <h2 className="font-display font-bold text-xl text-foreground mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          The Squad
        </h2>

        {siblingsLoading ? (
          <div className="flex gap-3 flex-wrap">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-20 h-24 rounded-3xl" />
            ))}
          </div>
        ) : siblings && siblings.length > 0 ? (
          <div className="flex gap-3 flex-wrap">
            {siblings.map((sibling, idx) => (
              <motion.button
                key={String(sibling.id)}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.1 * idx,
                  duration: 0.4,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                onClick={() => onNavigate("members")}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-2 bg-card rounded-3xl p-3 border border-border shadow-cozy hover:shadow-cozy-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer min-w-[72px]"
              >
                <span className="text-3xl">{sibling.emoji || "😊"}</span>
                <span className="font-body text-xs font-semibold text-foreground leading-tight text-center max-w-[64px] truncate">
                  {sibling.name}
                </span>
              </motion.button>
            ))}
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.1 * siblings.length,
                duration: 0.4,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              onClick={() => onNavigate("members")}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-2 bg-muted rounded-3xl p-3 border border-dashed border-border hover:bg-primary/5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer min-w-[72px]"
            >
              <span className="text-3xl text-muted-foreground">+</span>
              <span className="font-body text-xs font-medium text-muted-foreground">
                Add
              </span>
            </motion.button>
          </div>
        ) : (
          <div className="bg-card rounded-3xl border border-dashed border-border p-6 text-center shadow-cozy">
            <p className="text-muted-foreground font-body text-sm mb-3">
              No siblings added yet! Be the first to join the squad.
            </p>
            <button
              type="button"
              onClick={() => onNavigate("members")}
              className="font-body font-semibold text-sm text-primary hover:underline transition-colors"
            >
              Add a sibling →
            </button>
          </div>
        )}
      </motion.section>

      {/* Stats */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <h2 className="font-display font-bold text-xl text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Squad Stats
        </h2>

        <div className="grid grid-cols-3 gap-3">
          {statItems.map((stat, idx) => {
            return (
              <motion.button
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx + 0.4, duration: 0.4 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate(stat.page)}
                className={`${stat.bg} rounded-3xl p-4 md:p-5 text-center border border-border/50 shadow-cozy hover:shadow-cozy-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
              >
                <div className="text-2xl mb-1">{stat.emoji}</div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-12 mx-auto mb-1 rounded-xl" />
                ) : (
                  <div
                    className={`font-display font-black text-2xl md:text-3xl ${stat.text}`}
                  >
                    {stat.value}
                  </div>
                )}
                <div className="font-body text-xs text-muted-foreground font-medium mt-1">
                  {stat.label}
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      {/* Quick actions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <button
          type="button"
          onClick={() => onNavigate("messages")}
          className="bg-card rounded-3xl p-4 border border-border shadow-cozy hover:shadow-cozy-lg transition-all duration-200 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="text-2xl mb-2">💬</div>
          <h3 className="font-display font-bold text-sm text-foreground group-hover:text-primary transition-colors">
            Messages
          </h3>
        </button>
        <button
          type="button"
          onClick={() => onNavigate("activities")}
          className="bg-card rounded-3xl p-4 border border-border shadow-cozy hover:shadow-cozy-lg transition-all duration-200 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="text-2xl mb-2">🎉</div>
          <h3 className="font-display font-bold text-sm text-foreground group-hover:text-primary transition-colors">
            Activities
          </h3>
        </button>
        <button
          type="button"
          onClick={() => onNavigate("photos")}
          className="bg-card rounded-3xl p-4 border border-border shadow-cozy hover:shadow-cozy-lg transition-all duration-200 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="text-2xl mb-2">📸</div>
          <h3 className="font-display font-bold text-sm text-foreground group-hover:text-primary transition-colors">
            Photos
          </h3>
        </button>
        <button
          type="button"
          onClick={() => onNavigate("polls")}
          className="bg-card rounded-3xl p-4 border border-border shadow-cozy hover:shadow-cozy-lg transition-all duration-200 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="text-2xl mb-2">📊</div>
          <h3 className="font-display font-bold text-sm text-foreground group-hover:text-primary transition-colors">
            Polls
          </h3>
        </button>
      </motion.section>

      {/* Upcoming Events */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Upcoming Events
          </h2>
          <button
            type="button"
            onClick={() => onNavigate("events")}
            className="font-body text-xs font-semibold text-primary hover:underline"
          >
            View all →
          </button>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="bg-card rounded-3xl border border-dashed border-border shadow-cozy p-5 text-center">
            <p className="font-body text-sm text-muted-foreground mb-2">
              No upcoming events yet
            </p>
            <button
              type="button"
              onClick={() => onNavigate("events")}
              className="font-body text-sm font-semibold text-primary hover:underline"
            >
              Add an event →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingEvents.map((event) => (
              <button
                type="button"
                key={event.id}
                onClick={() => onNavigate("events")}
                className="w-full bg-card rounded-3xl border border-border shadow-cozy p-4 flex items-center gap-3 hover:shadow-cozy-lg transition-all duration-200 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-sm text-foreground truncate">
                    {event.title}
                  </p>
                  <p className="font-body text-xs text-muted-foreground">
                    {formatEventDate(event.date)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </motion.section>

      {/* Active Polls */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            Active Polls
          </h2>
          <button
            type="button"
            onClick={() => onNavigate("polls")}
            className="font-body text-xs font-semibold text-primary hover:underline"
          >
            View all →
          </button>
        </div>

        {activePolls.length === 0 ? (
          <div className="bg-card rounded-3xl border border-dashed border-border shadow-cozy p-5 text-center">
            <p className="font-body text-sm text-muted-foreground mb-2">
              No polls yet — create one!
            </p>
            <button
              type="button"
              onClick={() => onNavigate("polls")}
              className="font-body text-sm font-semibold text-primary hover:underline"
            >
              Create a poll →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {activePolls.map((poll) => {
              const totalVotes = poll.options.reduce(
                (acc, o) => acc + o.votes,
                0,
              );
              return (
                <button
                  type="button"
                  key={poll.id}
                  onClick={() => onNavigate("polls")}
                  className="w-full bg-card rounded-3xl border border-border shadow-cozy p-4 flex items-center gap-3 hover:shadow-cozy-lg transition-all duration-200 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="w-12 h-12 bg-sunshine/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <BarChart2 className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sm text-foreground truncate">
                      {poll.question}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      {totalVotes} {totalVotes === 1 ? "vote" : "votes"} ·{" "}
                      {poll.options.length} options
                    </p>
                  </div>
                  <span className="font-body text-xs font-semibold text-primary flex-shrink-0">
                    Vote →
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </motion.section>
    </div>
  );
}
