import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, CalendarDays, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "snuggle-events";

export interface LocalEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  createdBy: string;
}

export function loadEvents(): LocalEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LocalEvent[];
  } catch {
    return [];
  }
}

function saveEvents(events: LocalEvent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function formatDate(dateStr: string): {
  month: string;
  day: string;
  full: string;
} {
  const d = new Date(`${dateStr}T00:00:00`);
  return {
    month: d.toLocaleString("default", { month: "short" }).toUpperCase(),
    day: String(d.getDate()),
    full: d.toLocaleDateString("default", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
}

function isPast(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(`${dateStr}T00:00:00`);
  return d < today;
}

function sortByDate(events: LocalEvent[]): LocalEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = events
    .filter((e) => !isPast(e.date))
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = events
    .filter((e) => isPast(e.date))
    .sort((a, b) => b.date.localeCompare(a.date));

  return [...upcoming, ...past];
}

const EVENT_COLORS = [
  "bg-primary/8 border-primary/25",
  "bg-lavender/15 border-purple-200",
  "bg-sunshine/20 border-amber-200",
  "bg-mint/20 border-green-200",
  "bg-rose/10 border-rose-200",
];

const BADGE_COLORS = [
  "bg-primary text-primary-foreground",
  "bg-purple-500 text-white",
  "bg-amber-500 text-white",
  "bg-green-500 text-white",
  "bg-rose-500 text-white",
];

interface AddEventForm {
  title: string;
  date: string;
  description: string;
  createdBy: string;
}

const EMPTY_FORM: AddEventForm = {
  title: "",
  date: "",
  description: "",
  createdBy: "",
};

export default function EventsPage() {
  const [events, setEvents] = useState<LocalEvent[]>(() => loadEvents());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddEventForm>(EMPTY_FORM);

  const sorted = sortByDate(events);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("What's the event called?");
      return;
    }
    if (!form.date) {
      toast.error("When is it happening?");
      return;
    }
    if (!form.createdBy.trim()) {
      toast.error("Who's adding this event?");
      return;
    }

    const newEvent: LocalEvent = {
      id: Date.now().toString(),
      title: form.title.trim(),
      date: form.date,
      description: form.description.trim(),
      createdBy: form.createdBy.trim(),
    };
    const updated = [...events, newEvent];
    saveEvents(updated);
    setEvents(updated);
    setForm(EMPTY_FORM);
    setShowForm(false);
    toast.success("Event added! 📅");
  };

  const handleDelete = (id: string) => {
    const updated = events.filter((e) => e.id !== id);
    saveEvents(updated);
    setEvents(updated);
    toast.success("Event removed");
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-3xl text-foreground tracking-tight">
            Events
          </h1>
          <p className="font-body text-muted-foreground text-sm mt-1">
            Important moments to remember 📅
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="rounded-2xl font-body font-semibold gap-2 shadow-cozy"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Event</span>
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
                <CalendarDays className="w-5 h-5 text-primary" />
                Add an Important Event
              </h2>

              <div className="space-y-2">
                <Label className="font-body font-semibold text-sm">
                  Event Title *
                </Label>
                <Input
                  placeholder="e.g., Mom's Birthday, Family Reunion, Graduation..."
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="rounded-2xl font-body"
                  maxLength={80}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="font-body font-semibold text-sm">
                  Date *
                </Label>
                <Input
                  type="date"
                  value={form.date}
                  min={today}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                  className="rounded-2xl font-body"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="font-body font-semibold text-sm">
                  Description (optional)
                </Label>
                <Textarea
                  placeholder="Any details about this event..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="rounded-2xl font-body resize-none"
                  rows={2}
                  maxLength={300}
                />
              </div>

              <div className="space-y-2">
                <Label className="font-body font-semibold text-sm">
                  Added by *
                </Label>
                <Input
                  placeholder="Your name..."
                  value={form.createdBy}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, createdBy: e.target.value }))
                  }
                  className="rounded-2xl font-body"
                  maxLength={50}
                  required
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  type="submit"
                  className="rounded-2xl font-body font-semibold flex-1 shadow-cozy gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Save Event
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setForm(EMPTY_FORM);
                  }}
                  className="rounded-2xl font-body"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Events list */}
      {sorted.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl border border-dashed border-border shadow-cozy p-10 text-center"
        >
          <div className="text-5xl mb-3">📅</div>
          <h3 className="font-display font-bold text-lg text-foreground mb-2">
            No upcoming events!
          </h3>
          <p className="font-body text-muted-foreground text-sm mb-4">
            Add birthdays, hangouts, and special moments to remember
          </p>
          <Button
            onClick={() => setShowForm(true)}
            className="rounded-2xl font-body font-semibold shadow-cozy gap-2"
          >
            <CalendarDays className="w-4 h-4" />
            Add First Event
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {/* Upcoming section label */}
          {sorted.some((e) => !isPast(e.date)) && (
            <p className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Upcoming
            </p>
          )}
          <AnimatePresence>
            {sorted.map((event, idx) => {
              const colorClass = EVENT_COLORS[idx % EVENT_COLORS.length];
              const badgeColor = BADGE_COLORS[idx % BADGE_COLORS.length];
              const { month, day, full } = formatDate(event.date);
              const past = isPast(event.date);

              return (
                <motion.article
                  key={event.id}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    delay: idx * 0.04,
                    duration: 0.35,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                  className={`rounded-3xl border ${colorClass} ${past ? "opacity-60" : ""} p-4 shadow-cozy hover:shadow-cozy-lg transition-all duration-200 card-bubble-hover`}
                >
                  <div className="flex items-start gap-4">
                    {/* Date badge */}
                    <div
                      className={`flex-shrink-0 w-14 h-14 ${badgeColor} rounded-2xl flex flex-col items-center justify-center shadow-sm`}
                    >
                      <span className="font-body text-xs font-bold leading-none opacity-90">
                        {month}
                      </span>
                      <span className="font-display font-black text-xl leading-none">
                        {day}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-display font-bold text-base text-foreground leading-tight truncate">
                            {event.title}
                          </h3>
                          <p className="font-body text-xs text-muted-foreground mt-0.5">
                            {full} · by{" "}
                            <span className="font-semibold text-foreground">
                              {event.createdBy}
                            </span>
                          </p>
                          {event.description && (
                            <p className="font-body text-sm text-muted-foreground mt-2 leading-snug line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDelete(event.id)}
                          className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={`Delete ${event.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
