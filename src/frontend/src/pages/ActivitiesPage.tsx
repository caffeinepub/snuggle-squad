import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Sparkles, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddActivity, useListActivities } from "../hooks/useQueries";

const ACTIVITY_EMOJIS = [
  "🎮",
  "🎬",
  "🍕",
  "🎲",
  "🏖️",
  "🎨",
  "🎪",
  "🌲",
  "🎭",
  "🎯",
  "🏀",
  "🎵",
  "🚴",
  "🧁",
  "🎣",
];

function getActivityEmoji(description: string): string {
  const lower = description.toLowerCase();
  if (lower.includes("game") || lower.includes("play")) return "🎮";
  if (
    lower.includes("movie") ||
    lower.includes("watch") ||
    lower.includes("film")
  )
    return "🎬";
  if (
    lower.includes("food") ||
    lower.includes("eat") ||
    lower.includes("cook") ||
    lower.includes("pizza")
  )
    return "🍕";
  if (lower.includes("board") || lower.includes("card")) return "🎲";
  if (lower.includes("beach") || lower.includes("swim")) return "🏖️";
  if (
    lower.includes("art") ||
    lower.includes("draw") ||
    lower.includes("paint")
  )
    return "🎨";
  if (
    lower.includes("hike") ||
    lower.includes("walk") ||
    lower.includes("outdoor")
  )
    return "🌲";
  if (
    lower.includes("music") ||
    lower.includes("sing") ||
    lower.includes("dance")
  )
    return "🎵";
  if (
    lower.includes("bake") ||
    lower.includes("cake") ||
    lower.includes("cookie")
  )
    return "🧁";
  if (lower.includes("bike") || lower.includes("cycle")) return "🚴";
  const hash = description.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return ACTIVITY_EMOJIS[hash % ACTIVITY_EMOJIS.length];
}

const activityColors = [
  "bg-primary/8 border-primary/20",
  "bg-lavender/15 border-purple-200",
  "bg-sunshine/20 border-amber-200",
  "bg-mint/20 border-green-200",
  "bg-rose/10 border-rose-200",
];

export default function ActivitiesPage() {
  const { data: activities, isLoading } = useListActivities();
  const { mutate: addActivity, isPending: isAdding } = useAddActivity();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: "", creator: "" });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim()) {
      toast.error("What activity do you have in mind?");
      return;
    }
    if (!form.creator.trim()) {
      toast.error("Who's suggesting this?");
      return;
    }
    addActivity(
      { description: form.description.trim(), creator: form.creator.trim() },
      {
        onSuccess: () => {
          toast.success("Activity idea added! 🎉");
          setForm({ description: "", creator: "" });
          setShowForm(false);
        },
        onError: () => toast.error("Couldn't add activity, try again!"),
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-3xl text-foreground tracking-tight">
            Activities
          </h1>
          <p className="font-body text-muted-foreground text-sm mt-1">
            Fun things to do together 🎉
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="rounded-2xl font-body font-semibold gap-2 shadow-cozy"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Idea</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.97 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <form
              onSubmit={handleAdd}
              className="bg-card rounded-3xl border border-border shadow-cozy p-5 space-y-4"
            >
              <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Suggest an Activity
              </h2>

              <div className="space-y-2">
                <Label className="font-body font-semibold text-sm">
                  Activity Idea
                </Label>
                <Textarea
                  placeholder="e.g., Movie marathon night with popcorn, Weekend hiking trip, Bake cookies together..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="rounded-2xl font-body resize-none"
                  rows={3}
                  maxLength={300}
                />
              </div>

              <div className="space-y-2">
                <Label className="font-body font-semibold text-sm">
                  Your Name
                </Label>
                <Input
                  placeholder="Who's suggesting this?"
                  value={form.creator}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, creator: e.target.value }))
                  }
                  className="rounded-2xl font-body"
                  maxLength={50}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  type="submit"
                  disabled={isAdding}
                  className="rounded-2xl font-body font-semibold flex-1 shadow-cozy gap-2"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Add Idea!
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="rounded-2xl font-body"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activities list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-3xl" />
          ))}
        </div>
      ) : activities && activities.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {activities.map((activity, idx) => {
              const colorClass = activityColors[idx % activityColors.length];
              const emoji = getActivityEmoji(activity.description);
              return (
                <motion.article
                  key={String(activity.id)}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    delay: idx * 0.04,
                    duration: 0.35,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                  className={`rounded-3xl border ${colorClass} p-4 shadow-cozy hover:shadow-cozy-lg transition-all duration-200 card-bubble-hover`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-11 h-11 bg-white/60 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                      {emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-semibold text-sm text-foreground leading-snug">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="text-xs">💡</span>
                        <span className="font-body text-xs text-muted-foreground">
                          Suggested by{" "}
                          <span className="font-semibold text-foreground">
                            {activity.creator}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl border border-dashed border-border shadow-cozy p-10 text-center"
        >
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="font-display font-bold text-lg text-foreground mb-2">
            No activities yet!
          </h3>
          <p className="font-body text-muted-foreground text-sm mb-4">
            Start planning fun things to do together
          </p>
          <Button
            onClick={() => setShowForm(true)}
            className="rounded-2xl font-body font-semibold shadow-cozy gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Suggest an Activity
          </Button>
        </motion.div>
      )}
    </div>
  );
}
