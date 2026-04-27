import { AuthClient } from "@dfinity/auth-client";
import type { Identity } from "@dfinity/agent";
import { Ed25519KeyIdentity } from "@dfinity/identity";

const TAGGR_II_URL =
  import.meta.env.VITE_II_URL ?? "https://id.ai/?feature_flag_guided_upgrade=true";
const TAGGR_MAX_TIME_TO_LIVE = BigInt(30 * 24 * 3_600_000_000_000);
const TAGGR_CANONICAL_AUTH_URL =
  import.meta.env.VITE_TAGGR_CANONICAL_AUTH_URL ??
  `https://${import.meta.env.VITE_TAGGR_CANISTER_ID ?? "6qfxa-ryaaa-aaaai-qbhsq-cai"}.icp0.io`;
const TAGGR_AUTH_MODE = import.meta.env.VITE_TAGGR_AUTH_MODE ?? "delegation";
const TAGGR_DELEGATION_DOMAIN = import.meta.env.VITE_TAGGR_DELEGATION_DOMAIN;
const LOCAL_IDENTITY_KEY = "IDENTITY";
const LEGACY_LOCAL_IDENTITY_KEY = LOCAL_IDENTITY_KEY;

let authClientPromise: Promise<AuthClient> | null = null;

async function getAuthClient() {
  if (!authClientPromise) {
    authClientPromise = AuthClient.create({
      idleOptions: { disableIdle: true },
    });
  }

  return authClientPromise;
}

function canonicalAuthHost() {
  return new URL(TAGGR_CANONICAL_AUTH_URL).host;
}

function isCanonicalOrigin() {
  return window.location.host === canonicalAuthHost();
}

function isLocalDevelopmentHost() {
  return ["localhost", "127.0.0.1", "[::1]", "::1"].includes(
    window.location.hostname,
  );
}

function isIpfsGatewayHost(hostname: string) {
  return (
    hostname.includes(".ipfs.") ||
    hostname.endsWith(".dweb.link") ||
    hostname.endsWith(".ipfs.dweb.link") ||
    hostname.startsWith("bafy")
  );
}

function getDelegationDomain() {
  return TAGGR_DELEGATION_DOMAIN || window.location.hostname;
}

function assertDelegationDomainSupported(domain: string) {
  if (!TAGGR_DELEGATION_DOMAIN && isLocalDevelopmentHost()) {
    throw new Error(
      "Taggr cannot authorize localhost with your existing Internet Identity. Taggr custom-frontend login requires a domain registered in Taggr. Public browsing still works locally.",
    );
  }

  if (!TAGGR_DELEGATION_DOMAIN && isIpfsGatewayHost(window.location.hostname)) {
    throw new Error(
      "This IPFS gateway URL can browse Taggr, but it cannot log in as your Taggr account. Taggr delegation requires a stable custom domain registered in Taggr; a CID gateway subdomain is not a registered Taggr domain. Put this CID behind a registered domain and set VITE_TAGGR_DELEGATION_DOMAIN to that domain.",
    );
  }

  if (domain.length > 40) {
    throw new Error(
      "Taggr custom-frontend login requires a registered domain no longer than 40 characters. This host is too long for Taggr's domain registry, so it can only browse publicly.",
    );
  }
}

function getLocalIdentity(): Identity | null {
  const serializedIdentity = sessionStorage.getItem(LOCAL_IDENTITY_KEY);
  if (!serializedIdentity) return null;

  try {
    return Ed25519KeyIdentity.fromJSON(serializedIdentity);
  } catch {
    sessionStorage.removeItem(LOCAL_IDENTITY_KEY);
    return null;
  }
}

function clearLegacyLocalIdentity() {
  localStorage.removeItem(LEGACY_LOCAL_IDENTITY_KEY);
}

function startTaggrDelegationLogin() {
  const domain = getDelegationDomain();
  assertDelegationDomainSupported(domain);

  const randomSeed = crypto.getRandomValues(new Uint8Array(32));
  const identity = Ed25519KeyIdentity.generate(randomSeed);
  clearLegacyLocalIdentity();
  sessionStorage.setItem(LOCAL_IDENTITY_KEY, JSON.stringify(identity.toJSON()));

  const principal = identity.getPrincipal().toString();
  window.location.href = `https://${canonicalAuthHost()}/#/delegate/${domain}/${principal}`;
}

export const identityAdapter = {
  async login(): Promise<Identity | null> {
    if (TAGGR_AUTH_MODE === "delegation" && !isCanonicalOrigin()) {
      startTaggrDelegationLogin();
      return null;
    }

    const client = await getAuthClient();

    return new Promise((resolve, reject) => {
      client.login({
        identityProvider: TAGGR_II_URL,
        maxTimeToLive: TAGGR_MAX_TIME_TO_LIVE,
        derivationOrigin: window.location.origin,
        onSuccess: () => resolve(client.getIdentity()),
        onError: reject,
      });
    });
  },

  async logout(): Promise<void> {
    const client = await getAuthClient();
    sessionStorage.removeItem(LOCAL_IDENTITY_KEY);
    clearLegacyLocalIdentity();
    await client.logout();
  },

  async getIdentity(): Promise<Identity | null> {
    clearLegacyLocalIdentity();
    const localIdentity = getLocalIdentity();
    if (localIdentity) return localIdentity;

    const client = await getAuthClient();
    return (await client.isAuthenticated()) ? client.getIdentity() : null;
  },

  async isAuthenticated(): Promise<boolean> {
    clearLegacyLocalIdentity();
    if (getLocalIdentity()) return true;

    const client = await getAuthClient();
    return client.isAuthenticated();
  },
};
