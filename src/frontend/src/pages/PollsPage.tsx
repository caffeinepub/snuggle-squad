import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart2, CheckCircle2, Plus, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "snuggle-polls";

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface LocalPoll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  createdAt: string;
}

export function loadPolls(): LocalPoll[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LocalPoll[];
  } catch {
    return [];
  }
}

function savePolls(polls: LocalPoll[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(polls));
}

const OPTION_COLORS = [
  "bg-primary",
  "bg-purple-500",
  "bg-amber-500",
  "bg-green-500",
  "bg-rose-500",
];

interface FormOption {
  id: string;
  text: string;
}

interface AddPollForm {
  question: string;
  options: FormOption[];
  createdBy: string;
}

function makeOption(text = ""): FormOption {
  return { id: `${Date.now()}_${Math.random()}`, text };
}

function makeEmptyForm(): AddPollForm {
  return {
    question: "",
    options: [makeOption(), makeOption()],
    createdBy: "",
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("default", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PollsPage() {
  const [polls, setPolls] = useState<LocalPoll[]>(() => loadPolls());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddPollForm>(makeEmptyForm);
  const [votedOptions, setVotedOptions] = useState<Record<string, string>>({});

  const handleAddOption = () => {
    if (form.options.length < 4) {
      setForm((f) => ({ ...f, options: [...f.options, makeOption()] }));
    }
  };

  const handleRemoveOption = (optId: string) => {
    if (form.options.length <= 2) return;
    setForm((f) => ({
      ...f,
      options: f.options.filter((o) => o.id !== optId),
    }));
  };

  const handleOptionChange = (optId: string, value: string) => {
    setForm((f) => ({
      ...f,
      options: f.options.map((o) =>
        o.id === optId ? { ...o, text: value } : o,
      ),
    }));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question.trim()) {
      toast.error("What's the question?");
      return;
    }
    const validOptions = form.options.filter((o) => o.text.trim());
    if (validOptions.length < 2) {
      toast.error("Need at least 2 options!");
      return;
    }
    if (!form.createdBy.trim()) {
      toast.error("Who's creating this poll?");
      return;
    }

    const newPoll: LocalPoll = {
      id: Date.now().toString(),
      question: form.question.trim(),
      options: validOptions.map((fo) => ({
        id: fo.id,
        text: fo.text.trim(),
        votes: 0,
      })),
      createdBy: form.createdBy.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newPoll, ...polls];
    savePolls(updated);
    setPolls(updated);
    setForm(makeEmptyForm());
    setShowForm(false);
    toast.success("Poll created! 📊");
  };

  const handleVote = (pollId: string, optionId: string) => {
    if (votedOptions[pollId]) {
      toast("You already voted in this poll!", { icon: "🗳️" });
      return;
    }

    const updated = polls.map((p) => {
      if (p.id !== pollId) return p;
      return {
        ...p,
        options: p.options.map((o) =>
          o.id === optionId ? { ...o, votes: o.votes + 1 } : o,
        ),
      };
    });

    savePolls(updated);
    setPolls(updated);
    setVotedOptions((prev) => ({ ...prev, [pollId]: optionId }));
    toast.success("Vote cast! 🗳️");
  };

  const handleDeletePoll = (id: string) => {
    const updated = polls.filter((p) => p.id !== id);
    savePolls(updated);
    setPolls(updated);
    setVotedOptions((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    toast.success("Poll deleted");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-3xl text-foreground tracking-tight">
            Polls
          </h1>
          <p className="font-body text-muted-foreground text-sm mt-1">
            Let the squad decide! 📊
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="rounded-2xl font-body font-semibold gap-2 shadow-cozy"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Poll</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* Create Poll Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.97 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <form
              onSubmit={handleCreate}
              className="bg-card rounded-3xl border border-border shadow-cozy p-5 space-y-4"
            >
              <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary" />
                Create a Poll
              </h2>

              <div className="space-y-2">
                <Label className="font-body font-semibold text-sm">
                  Question *
                </Label>
                <Input
                  placeholder="What should we do this weekend?"
                  value={form.question}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, question: e.target.value }))
                  }
                  className="rounded-2xl font-body"
                  maxLength={150}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="font-body font-semibold text-sm">
                  Options * (2–4)
                </Label>
                <div className="space-y-2">
                  {form.options.map((opt, idx) => (
                    <div key={opt.id} className="flex gap-2 items-center">
                      <div
                        className={`w-3 h-3 rounded-full flex-shrink-0 ${OPTION_COLORS[idx % OPTION_COLORS.length]}`}
                      />
                      <Input
                        placeholder={`Option ${idx + 1}...`}
                        value={opt.text}
                        onChange={(e) =>
                          handleOptionChange(opt.id, e.target.value)
                        }
                        className="rounded-2xl font-body flex-1"
                        maxLength={80}
                      />
                      {form.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(opt.id)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex-shrink-0"
                          aria-label="Remove option"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {form.options.length < 4 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="font-body text-sm text-primary font-semibold hover:underline flex items-center gap-1 mt-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add option
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <Label className="font-body font-semibold text-sm">
                  Created by *
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
                  <BarChart2 className="w-4 h-4" />
                  Create Poll!
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setForm(makeEmptyForm());
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

      {/* Polls list */}
      {polls.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl border border-dashed border-border shadow-cozy p-10 text-center"
        >
          <div className="text-5xl mb-3">📊</div>
          <h3 className="font-display font-bold text-lg text-foreground mb-2">
            No polls yet!
          </h3>
          <p className="font-body text-muted-foreground text-sm mb-4">
            Create a poll and let the squad vote on what to do
          </p>
          <Button
            onClick={() => setShowForm(true)}
            className="rounded-2xl font-body font-semibold shadow-cozy gap-2"
          >
            <BarChart2 className="w-4 h-4" />
            Create First Poll
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {polls.map((poll, pIdx) => {
              const totalVotes = poll.options.reduce(
                (acc, o) => acc + o.votes,
                0,
              );
              const votedOptionId = votedOptions[poll.id];
              const hasVoted = !!votedOptionId;

              return (
                <motion.article
                  key={poll.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    delay: pIdx * 0.05,
                    duration: 0.35,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                  className="bg-card rounded-3xl border border-border shadow-cozy p-5 hover:shadow-cozy-lg transition-all duration-200"
                >
                  {/* Poll header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-base text-foreground leading-snug">
                        {poll.question}
                      </h3>
                      <p className="font-body text-xs text-muted-foreground mt-1">
                        By{" "}
                        <span className="font-semibold text-foreground">
                          {poll.createdBy}
                        </span>{" "}
                        · {formatDate(poll.createdAt)} ·{" "}
                        <span className="font-semibold">
                          {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeletePoll(poll.id)}
                      className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="Delete poll"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    {poll.options.map((option, oIdx) => {
                      const pct =
                        totalVotes > 0
                          ? Math.round((option.votes / totalVotes) * 100)
                          : 0;
                      const isVoted = votedOptionId === option.id;
                      const barColor =
                        OPTION_COLORS[oIdx % OPTION_COLORS.length];

                      return (
                        <div key={option.id}>
                          {hasVoted ? (
                            // Results view
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  {isVoted && (
                                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                                  )}
                                  <span
                                    className={`font-body text-sm ${isVoted ? "font-semibold text-primary" : "text-foreground"} truncate`}
                                  >
                                    {option.text}
                                  </span>
                                </div>
                                <span className="font-body text-xs font-bold text-muted-foreground flex-shrink-0">
                                  {pct}% ({option.votes})
                                </span>
                              </div>
                              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  className={`h-full ${barColor} rounded-full`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{
                                    duration: 0.6,
                                    ease: "easeOut",
                                    delay: oIdx * 0.1,
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            // Vote button
                            <button
                              type="button"
                              onClick={() => handleVote(poll.id, option.id)}
                              className={`w-full text-left px-4 py-3 rounded-2xl border-2 font-body text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center gap-2
                                border-border bg-muted/50 hover:border-primary/60 hover:bg-primary/5 hover:text-primary
                              `}
                            >
                              <div
                                className={`w-3 h-3 rounded-full flex-shrink-0 ${barColor}`}
                              />
                              {option.text}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {!hasVoted && (
                    <p className="font-body text-xs text-muted-foreground mt-3 text-center">
                      Click an option to vote 🗳️
                    </p>
                  )}
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
