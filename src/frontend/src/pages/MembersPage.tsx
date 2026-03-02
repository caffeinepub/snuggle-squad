import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddSibling,
  useDeleteSibling,
  useListSiblings,
} from "../hooks/useQueries";

const SUGGESTED_EMOJIS = [
  "🐻",
  "🐱",
  "🐶",
  "🦊",
  "🐼",
  "🐨",
  "🐰",
  "🦁",
  "🐸",
  "🐯",
  "🦄",
  "🐧",
];

export default function MembersPage() {
  const { data: siblings, isLoading } = useListSiblings();
  const { mutate: addSibling, isPending: isAdding } = useAddSibling();
  const { mutate: deleteSibling, isPending: isDeleting } = useDeleteSibling();
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", emoji: "🐻", bio: "" });
  const [customEmoji, setCustomEmoji] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Please enter a name!");
      return;
    }
    addSibling(
      { name: form.name.trim(), emoji: form.emoji, bio: form.bio.trim() },
      {
        onSuccess: () => {
          toast.success(`${form.emoji} ${form.name} joined the squad!`);
          setForm({ name: "", emoji: "🐻", bio: "" });
          setShowForm(false);
        },
        onError: () => toast.error("Couldn't add sibling, try again!"),
      },
    );
  };

  const handleDelete = (id: bigint, name: string) => {
    setDeletingId(id);
    deleteSibling(id, {
      onSuccess: () => {
        toast.success(`${name} was removed from the squad`);
        setDeletingId(null);
      },
      onError: () => {
        toast.error("Couldn't remove sibling, try again!");
        setDeletingId(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-3xl text-foreground tracking-tight">
            Members
          </h1>
          <p className="font-body text-muted-foreground text-sm mt-1">
            Everyone in the Snuggle Squad 🐾
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="rounded-2xl font-body font-semibold gap-2 shadow-cozy"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Sibling</span>
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
              <h2 className="font-display font-bold text-lg text-foreground">
                Add a New Sibling
              </h2>

              <div className="space-y-2">
                <Label className="font-body font-semibold text-sm">Name</Label>
                <Input
                  placeholder="Enter sibling's name..."
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="rounded-2xl font-body"
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label className="font-body font-semibold text-sm">
                  Choose an Emoji
                </Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {SUGGESTED_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ ...f, emoji }));
                        setCustomEmoji(false);
                      }}
                      className={`
                        w-10 h-10 text-xl rounded-2xl border-2 transition-all duration-150
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                        ${
                          form.emoji === emoji && !customEmoji
                            ? "border-primary bg-primary/10 scale-110"
                            : "border-border bg-muted hover:border-primary/40 hover:bg-primary/5"
                        }
                      `}
                    >
                      {emoji}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCustomEmoji(true)}
                    className={`
                      w-10 h-10 text-xs rounded-2xl border-2 transition-all duration-150 font-body font-bold
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                      ${customEmoji ? "border-primary bg-primary/10" : "border-border bg-muted hover:border-primary/40"}
                    `}
                  >
                    ✏️
                  </button>
                </div>
                {customEmoji && (
                  <Input
                    placeholder="Type any emoji..."
                    value={form.emoji}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, emoji: e.target.value }))
                    }
                    className="rounded-2xl font-body w-32 text-lg"
                    maxLength={4}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label className="font-body font-semibold text-sm">Bio</Label>
                <Textarea
                  placeholder="A little something about them..."
                  value={form.bio}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bio: e.target.value }))
                  }
                  className="rounded-2xl font-body resize-none"
                  rows={2}
                  maxLength={200}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  type="submit"
                  disabled={isAdding}
                  className="rounded-2xl font-body font-semibold flex-1 shadow-cozy"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>Join the Squad ✨</>
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

      {/* Members grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      ) : siblings && siblings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {siblings.map((sibling, idx) => (
              <motion.article
                key={String(sibling.id)}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  delay: idx * 0.05,
                  duration: 0.35,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                className="bg-card rounded-3xl border border-border shadow-cozy p-5 flex items-start gap-4 hover:shadow-cozy-lg transition-all duration-200 card-bubble-hover"
              >
                <div className="flex-shrink-0 w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                  {sibling.emoji || "😊"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-base text-foreground truncate">
                    {sibling.name}
                  </h3>
                  {sibling.bio ? (
                    <p className="font-body text-sm text-muted-foreground mt-1 line-clamp-2">
                      {sibling.bio}
                    </p>
                  ) : (
                    <p className="font-body text-sm text-muted-foreground/50 mt-1 italic">
                      No bio yet...
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(sibling.id, sibling.name)}
                  disabled={isDeleting && deletingId === sibling.id}
                  className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Remove ${sibling.name}`}
                >
                  {isDeleting && deletingId === sibling.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl border border-dashed border-border shadow-cozy p-10 text-center"
        >
          <div className="text-5xl mb-3">👨‍👩‍👧‍👦</div>
          <h3 className="font-display font-bold text-lg text-foreground mb-2">
            No siblings yet!
          </h3>
          <p className="font-body text-muted-foreground text-sm mb-4">
            Be the first to join the Snuggle Squad
          </p>
          <Button
            onClick={() => setShowForm(true)}
            className="rounded-2xl font-body font-semibold shadow-cozy"
          >
            <Users className="w-4 h-4 mr-2" />
            Add the First Member
          </Button>
        </motion.div>
      )}
    </div>
  );
}
