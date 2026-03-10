import { resolveAuthHasherBinding } from "@cloudflare-auth-hasher/client";

export interface BetterAuthFallback {
  hashPassword(password: string): Promise<string>;
  verifyPassword(hash: string, password: string): Promise<boolean>;
}

export interface BetterAuthCloudflareEvent {
  platform?: {
    env?: Record<string, unknown>;
  };
}

export interface BetterAuthHasher {
  hash(password: string): Promise<string>;
  verify(data: { hash: string; password: string }): Promise<boolean>;
}

export interface BetterAuthAdapterOptions {
  bindingName?: string;
  fallback: BetterAuthFallback;
}

export const createAuthPasswordHasher = (
  event: BetterAuthCloudflareEvent,
  options: BetterAuthAdapterOptions
): BetterAuthHasher => {
  const binding = resolveAuthHasherBinding(event.platform?.env, options.bindingName ?? "AUTH_HASHER");

  if (!binding) {
    return {
      hash: (password) => options.fallback.hashPassword(password),
      verify: ({ hash, password }) => options.fallback.verifyPassword(hash, password)
    };
  }

  return {
    hash: (password) => binding.hashPassword(password),
    verify: ({ hash, password }) => binding.verifyPassword(hash, password)
  };
};
