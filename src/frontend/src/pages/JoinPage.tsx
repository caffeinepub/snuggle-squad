import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddSibling, useSubmitRSVP } from "../hooks/useQueries";

interface JoinPageProps {
  code: string;
  onJoined: () => void;
}

export default function JoinPage({ code, onJoined }: JoinPageProps) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("😊");
  const { mutate: markCodeUsed } = useSubmitRSVP();
  const { mutate: addSibling, isPending } = useAddSibling();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmoji = emoji.trim() || "😊";

    if (!trimmedName) {
      toast.error("Please enter your name!");
      return;
    }

    // Mark the invite code as used in localStorage, then add sibling directly
    markCodeUsed({ name: trimmedName, attending: true, inviteCode: code });

    addSibling(
      {
        name: trimmedName,
        emoji: trimmedEmoji,
        bio: "Joined via invite",
      },
      {
        onSuccess: () => {
          toast.success(`Welcome to the Snuggle Squad, ${trimmedName}! 🎉`);
          // Clear the ?code param from URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
          onJoined();
        },
        onError: () => {
          toast.error("Couldn't add you to the squad, please try again!");
        },
      },
    );
  };

  const EMOJI_SUGGESTIONS = [
    "😊",
    "🐻",
    "🐱",
    "🐶",
    "🦊",
    "🐼",
    "🐰",
    "🦁",
    "🐸",
    "🌟",
    "🌈",
    "🎀",
  ];

  return (
    <div className="min-h-screen bg-pattern flex flex-col items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-card rounded-4xl border border-border shadow-cozy-lg overflow-hidden">
          {/* Colorful header band */}
          <div className="bg-gradient-to-br from-primary/20 via-lavender/20 to-sunshine/20 pt-10 pb-8 px-8 text-center">
            {/* Floating paw */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.2,
                duration: 0.6,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className="text-7xl mb-4 inline-block"
            >
              🐾
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="font-display font-black text-2xl sm:text-3xl text-foreground tracking-tight leading-tight"
            >
              You've been invited to join the{" "}
              <span className="text-primary">Snuggle Squad!</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="font-body text-muted-foreground text-sm mt-2"
            >
              Our cozy little family corner where siblings stay connected 💕
            </motion.p>
          </div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            onSubmit={handleJoin}
            className="p-6 sm:p-8 space-y-5"
          >
            {/* Name */}
            <div className="space-y-2">
              <Label className="font-body font-semibold text-sm">
                Your Name
              </Label>
              <Input
                placeholder="What do your siblings call you?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-2xl font-body text-base"
                maxLength={50}
                required
                autoFocus
              />
            </div>

            {/* Emoji picker */}
            <div className="space-y-2">
              <Label className="font-body font-semibold text-sm">
                Pick Your Emoji
              </Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {EMOJI_SUGGESTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`
                      w-10 h-10 text-xl rounded-2xl border-2 transition-all duration-150
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                      ${
                        emoji === e
                          ? "border-primary bg-primary/10 scale-110"
                          : "border-border bg-muted hover:border-primary/40 hover:bg-primary/5"
                      }
                    `}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <Input
                placeholder="Or type any emoji, e.g. 😊"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="rounded-2xl font-body text-lg w-40"
                maxLength={8}
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full rounded-2xl font-body font-bold text-base py-3 h-auto shadow-cozy"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Joining...
                </>
              ) : (
                "Join the Squad ✨"
              )}
            </Button>

            <p className="text-center font-body text-xs text-muted-foreground">
              You'll see all shared photos, events, and messages right away!
            </p>
          </motion.form>
        </div>

        {/* Floating decorative elements */}
        <div
          className="fixed top-8 left-8 text-3xl opacity-40 animate-float pointer-events-none"
          style={{ animationDelay: "0.3s" }}
        >
          🐻
        </div>
        <div
          className="fixed top-12 right-10 text-2xl opacity-30 animate-float pointer-events-none"
          style={{ animationDelay: "1.2s" }}
        >
          🐱
        </div>
        <div
          className="fixed bottom-10 left-12 text-2xl opacity-30 animate-float pointer-events-none"
          style={{ animationDelay: "0.7s" }}
        >
          🦊
        </div>
        <div
          className="fixed bottom-8 right-8 text-3xl opacity-40 animate-float pointer-events-none"
          style={{ animationDelay: "1.8s" }}
        >
          🐼
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-muted-foreground font-body">
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
    </div>
  );
}
