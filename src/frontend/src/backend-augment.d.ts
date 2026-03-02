// Augments the Backend class and backendInterface in backend.ts with methods
// injected at runtime by Caffeine components (authorization + invite-links).
// This keeps useActor.ts compiling without modification.
// The top-level import makes this file a module, enabling module augmentation.
export {};

declare module "./backend" {
  // Extend the Backend class so createActorWithConfig's return type satisfies
  // the augmented backendInterface.
  interface Backend {
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
    generateInviteCode(): Promise<string>;
    getInviteCodes(): Promise<Array<{ code: string; used: boolean }>>;
    submitRSVP(
      name: string,
      attending: boolean,
      inviteCode: string,
    ): Promise<void>;
    getAllRSVPs(): Promise<
      Array<{
        name: string;
        attending: boolean;
        inviteCode: string;
        timestamp: bigint;
      }>
    >;
    isCurrentUserAdmin(): Promise<boolean>;
  }

  interface backendInterface {
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
    generateInviteCode(): Promise<string>;
    getInviteCodes(): Promise<Array<{ code: string; used: boolean }>>;
    submitRSVP(
      name: string,
      attending: boolean,
      inviteCode: string,
    ): Promise<void>;
    getAllRSVPs(): Promise<
      Array<{
        name: string;
        attending: boolean;
        inviteCode: string;
        timestamp: bigint;
      }>
    >;
    isCurrentUserAdmin(): Promise<boolean>;
  }
}
