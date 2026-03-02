import { HttpAgent } from "@icp-sdk/core/agent";
import { useQuery } from "@tanstack/react-query";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";

export function useStorageClient() {
  const query = useQuery<StorageClient>({
    queryKey: ["storageClient"],
    queryFn: async () => {
      const config = await loadConfig();
      const agent = new HttpAgent({ host: config.backend_host });
      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey().catch(() => {
          console.warn("Unable to fetch root key for storage client.");
        });
      }
      return new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );
    },
    staleTime: Number.POSITIVE_INFINITY,
  });

  return {
    storageClient: query.data ?? null,
    isLoading: query.isLoading,
  };
}
