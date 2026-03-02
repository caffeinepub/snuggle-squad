import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Message {
    id: bigint;
    content: string;
    author: string;
    timestamp: bigint;
}
export interface Activity {
    id: bigint;
    creator: string;
    description: string;
}
export interface SiblingProfile {
    id: bigint;
    bio: string;
    name: string;
    emoji: string;
}
export interface backendInterface {
    addActivity(description: string, creator: string): Promise<bigint>;
    addSibling(name: string, emoji: string, bio: string): Promise<bigint>;
    deleteMessage(messageId: bigint): Promise<void>;
    deleteSibling(id: bigint): Promise<void>;
    getActivity(id: bigint): Promise<Activity>;
    getMessage(id: bigint): Promise<Message>;
    getRecentMessages(limit: bigint): Promise<Array<Message>>;
    getSiblingProfile(id: bigint): Promise<SiblingProfile>;
    getStats(): Promise<{
        totalActivities: bigint;
        totalMessages: bigint;
        totalSiblings: bigint;
    }>;
    init(): Promise<void>;
    listActivities(): Promise<Array<Activity>>;
    listMessages(): Promise<Array<Message>>;
    listSiblings(): Promise<Array<SiblingProfile>>;
    postMessage(author: string, content: string): Promise<bigint>;
}
