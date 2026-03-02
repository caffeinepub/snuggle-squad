import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Activity, Message, SiblingProfile } from "../backend.d";
import { useActor } from "./useActor";

export function useInit() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) return;
      await actor.init();
    },
  });
}

export function useStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor)
        return { totalSiblings: 0n, totalMessages: 0n, totalActivities: 0n };
      return actor.getStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListSiblings() {
  const { actor, isFetching } = useActor();
  return useQuery<SiblingProfile[]>({
    queryKey: ["siblings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSiblings();
    },
    enabled: !!actor && !isFetching,
  });
}

async function waitForActorFromCache(
  queryClient: ReturnType<typeof useQueryClient>,
  maxWaitMs = 15000,
): Promise<NonNullable<ReturnType<typeof useActor>["actor"]>> {
  const interval = 300;
  const maxRetries = Math.ceil(maxWaitMs / interval);
  let retries = 0;
  while (retries < maxRetries) {
    // Read directly from the query cache -- always fresh
    const cacheEntries = queryClient.getQueriesData<
      ReturnType<typeof useActor>["actor"]
    >({
      queryKey: ["actor"],
    });
    for (const [, data] of cacheEntries) {
      if (data)
        return data as NonNullable<ReturnType<typeof useActor>["actor"]>;
    }
    await new Promise((r) => setTimeout(r, interval));
    retries++;
  }
  throw new Error(
    "Could not connect to the app. Please refresh and try again.",
  );
}

export function useAddSibling() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      emoji,
      bio,
    }: { name: string; emoji: string; bio: string }) => {
      const actor = await waitForActorFromCache(queryClient);
      return actor.addSibling(name, emoji, bio);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siblings"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDeleteSibling() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      const actor = await waitForActorFromCache(queryClient);
      return actor.deleteSibling(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siblings"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useListMessages() {
  const { actor, isFetching } = useActor();
  return useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMessages();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePostMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      author,
      content,
    }: { author: string; content: string }) => {
      const actor = await waitForActorFromCache(queryClient);
      return actor.postMessage(author, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (messageId: bigint) => {
      const actor = await waitForActorFromCache(queryClient);
      return actor.deleteMessage(messageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useListActivities() {
  const { actor, isFetching } = useActor();
  return useQuery<Activity[]>({
    queryKey: ["activities"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listActivities();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      description,
      creator,
    }: { description: string; creator: string }) => {
      const actor = await waitForActorFromCache(queryClient);
      return actor.addActivity(description, creator);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

// ─── Invite codes — stored client-side in localStorage (instant, no backend) ───

const INVITE_CODES_KEY = "snuggle-squad-invite-codes";

function loadInviteCodes(): { code: string; used: boolean }[] {
  try {
    const raw = localStorage.getItem(INVITE_CODES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as { code: string; used: boolean }[];
  } catch {
    return [];
  }
}

function saveInviteCodes(codes: { code: string; used: boolean }[]): void {
  localStorage.setItem(INVITE_CODES_KEY, JSON.stringify(codes));
}

function generateCode(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function useGenerateInviteCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const code = generateCode();
      const existing = loadInviteCodes();
      saveInviteCodes([...existing, { code, used: false }]);
      return code;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inviteCodes"] });
    },
  });
}

export function useGetInviteCodes() {
  return useQuery<{ code: string; used: boolean }[]>({
    queryKey: ["inviteCodes"],
    queryFn: () => loadInviteCodes(),
    // Always enabled — reads from localStorage, no actor needed
    staleTime: 0,
  });
}

export function useSubmitRSVP() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      inviteCode,
    }: { name: string; attending: boolean; inviteCode: string }) => {
      const codes = loadInviteCodes();
      const updated = codes.map((c) =>
        c.code === inviteCode ? { ...c, used: true } : c,
      );
      saveInviteCodes(updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inviteCodes"] });
    },
  });
}
