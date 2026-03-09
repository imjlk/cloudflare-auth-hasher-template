import type { RequestEvent } from '@sveltejs/kit';
import { hashPassword as fallbackHashPassword, verifyPassword as fallbackVerifyPassword } from 'better-auth/crypto';

type AuthHasherBinding = {
	hashPassword(password: string): Promise<string>;
	verifyPassword(hash: string, password: string): Promise<boolean>;
};

type AuthPasswordHasher = {
	hash(password: string): Promise<string>;
	verify(data: { hash: string; password: string }): Promise<boolean>;
};

const isCloudflareRuntime = (event: RequestEvent) => !!event.platform?.env;

const isAuthHasherBinding = (value: unknown): value is AuthHasherBinding => {
	if (!value || typeof value !== 'object') return false;
	const candidate = value as Partial<AuthHasherBinding>;
	return typeof candidate.hashPassword === 'function' && typeof candidate.verifyPassword === 'function';
};

const resolveAuthHasherBinding = (event: RequestEvent): AuthHasherBinding | null => {
	const binding = event.platform?.env?.AUTH_HASHER;
	if (isAuthHasherBinding(binding)) {
		return binding;
	}

	if (isCloudflareRuntime(event)) {
		throw new Error(
			'Missing AUTH_HASHER service binding. Add AUTH_HASHER to your wrangler.jsonc services list.',
		);
	}

	return null;
};

export const createAuthPasswordHasher = (event: RequestEvent): AuthPasswordHasher => {
	const binding = resolveAuthHasherBinding(event);
	if (!binding) {
		return {
			hash: fallbackHashPassword,
			verify: fallbackVerifyPassword
		};
	}

	return {
		hash: (password) => binding.hashPassword(password),
		verify: ({ hash, password }) => binding.verifyPassword(hash, password)
	};
};

