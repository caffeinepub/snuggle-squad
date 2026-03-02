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

export function useAddSibling() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      emoji,
      bio,
    }: { name: string; emoji: string; bio: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.addSibling(name, emoji, bio);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siblings"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDeleteSibling() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
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
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      author,
      content,
    }: { author: string; content: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.postMessage(author, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDeleteMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (messageId: bigint) => {
      if (!actor) throw new Error("No actor");
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
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      description,
      creator,
    }: { description: string; creator: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.addActivity(description, creator);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}
