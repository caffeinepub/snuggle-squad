import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageCircle, Send, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useDeleteMessage,
  useListMessages,
  usePostMessage,
} from "../hooks/useQueries";

function formatTimestamp(timestamp: bigint): string {
  // Timestamp is in nanoseconds from Motoko
  const ms = Number(timestamp) / 1_000_000;
  const date = new Date(ms);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const EMOJI_AVATARS = [
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

function getEmojiForName(name: string): string {
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return EMOJI_AVATARS[hash % EMOJI_AVATARS.length];
}

export default function MessageBoardPage() {
  const { data: messages, isLoading } = useListMessages();
  const { mutate: postMessage, isPending: isPosting } = usePostMessage();
  const { mutate: deleteMessage, isPending: isDeleting } = useDeleteMessage();
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [form, setForm] = useState({ author: "", content: "" });

  const sortedMessages = messages
    ? [...messages].sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    : [];

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author.trim()) {
      toast.error("Who's sending this message?");
      return;
    }
    if (!form.content.trim()) {
      toast.error("Write something first!");
      return;
    }
    postMessage(
      { author: form.author.trim(), content: form.content.trim() },
      {
        onSuccess: () => {
          toast.success("Message posted! 💬");
          setForm((f) => ({ ...f, content: "" }));
        },
        onError: () => toast.error("Couldn't post message, try again!"),
      },
    );
  };

  const handleDelete = (id: bigint) => {
    setDeletingId(id);
    deleteMessage(id, {
      onSuccess: () => {
        toast.success("Message deleted");
        setDeletingId(null);
      },
      onError: () => {
        toast.error("Couldn't delete message!");
        setDeletingId(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-black text-3xl text-foreground tracking-tight">
          Message Board
        </h1>
        <p className="font-body text-muted-foreground text-sm mt-1">
          Share what's on your heart 💕
        </p>
      </div>

      {/* Post Form */}
      <form
        onSubmit={handlePost}
        className="bg-card rounded-3xl border border-border shadow-cozy p-5 space-y-3"
      >
        <div className="space-y-2">
          <Label className="font-body font-semibold text-sm">Your Name</Label>
          <Input
            placeholder="Who are you?"
            value={form.author}
            onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
            className="rounded-2xl font-body"
            maxLength={50}
          />
        </div>
        <div className="space-y-2">
          <Label className="font-body font-semibold text-sm">
            Your Message
          </Label>
          <Textarea
            placeholder="What's on your mind? Share a joke, a memory, or just say hi! 😊"
            value={form.content}
            onChange={(e) =>
              setForm((f) => ({ ...f, content: e.target.value }))
            }
            className="rounded-2xl font-body resize-none"
            rows={3}
            maxLength={500}
          />
        </div>
        <Button
          type="submit"
          disabled={isPosting}
          className="w-full rounded-2xl font-body font-semibold shadow-cozy gap-2"
        >
          {isPosting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Post Message
            </>
          )}
        </Button>
      </form>

      {/* Messages */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-3xl" />
          ))}
        </div>
      ) : sortedMessages.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {sortedMessages.map((message, idx) => (
              <motion.article
                key={String(message.id)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ delay: idx * 0.04, duration: 0.3 }}
                className="bg-card rounded-3xl border border-border shadow-cozy p-4 hover:shadow-cozy-lg transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-xl">
                    {getEmojiForName(message.author)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display font-bold text-sm text-foreground">
                        {message.author}
                      </span>
                      <span className="font-body text-xs text-muted-foreground">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                    <p className="font-body text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(message.id)}
                    disabled={isDeleting && deletingId === message.id}
                    className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Delete message"
                  >
                    {isDeleting && deletingId === message.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
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
          <div className="text-5xl mb-3">💬</div>
          <h3 className="font-display font-bold text-lg text-foreground mb-2">
            No messages yet!
          </h3>
          <p className="font-body text-muted-foreground text-sm">
            Be the first to leave a message for the squad
          </p>
          <div className="flex justify-center gap-2 mt-3 text-2xl">
            <MessageCircle className="w-5 h-5 text-muted-foreground/40 mt-0.5" />
          </div>
        </motion.div>
      )}
    </div>
  );
}
