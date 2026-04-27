import { Actor, HttpAgent } from "@dfinity/agent";
import type { Identity } from "@dfinity/agent";
import type { IDL } from "@dfinity/candid";

const host = import.meta.env.VITE_ICP_HOST ?? "https://icp-api.io";

export async function createIcpAgent(identity?: Identity) {
  const agent = new HttpAgent({ host, identity });

  if (import.meta.env.DEV && host.includes("localhost")) {
    await agent.fetchRootKey();
  }

  return agent;
}

export async function createTaggrActor<T>(
  canisterId: string,
  idlFactory: IDL.InterfaceFactory,
  identity?: Identity,
) {
  const agent = await createIcpAgent(identity);
  return Actor.createActor<T>(idlFactory, { agent, canisterId });
}
