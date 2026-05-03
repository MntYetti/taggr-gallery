# Taggr Gallery Client

A custom visual-first frontend for Taggr, the decentralized social platform running on ICP. This is not a new social network, not a backend fork, and not an alternate protocol. It is a presentation, interaction, and discovery layer designed to connect to the existing Taggr canister/API.

The MVP connects to the public Taggr mainnet canister by default and can still fall back to mock data for offline UI work.

## Run Locally

```bash
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

## Environment

Copy `.env.example` to `.env` and adjust values:

```bash
VITE_TAGGR_CANISTER_ID=6qfxa-ryaaa-aaaai-qbhsq-cai
VITE_TAGGR_API_MODE=real
VITE_TAGGR_DOMAIN=taggr-gallery.promptops.cc
VITE_TAGGR_CANONICAL_URL=https://6qfxa-ryaaa-aaaai-qbhsq-cai.icp0.io
VITE_TAGGR_CANONICAL_AUTH_URL=https://6qfxa-ryaaa-aaaai-qbhsq-cai.icp0.io
VITE_TAGGR_AUTH_MODE=delegation
VITE_TAGGR_DELEGATION_DOMAIN=taggr-gallery.promptops.cc
VITE_ICP_HOST=
VITE_II_URL=https://id.ai/?feature_flag_guided_upgrade=true
VITE_USD_PER_XDR=1.37
VITE_DEFAULT_REALM=
VITE_APP_NAME=Taggr Gallery
```

`VITE_TAGGR_API_MODE=mock` uses `src/lib/taggr/mockTaggrClient.ts`.

`VITE_TAGGR_API_MODE=real` uses `src/lib/taggr/realTaggrClient.ts`. The real adapter follows Taggr’s current frontend/API pattern: read methods are raw JSON canister queries, while post/comment creation uses the canister’s Candid `add_post` method.

`VITE_TAGGR_DOMAIN` is the registered Taggr domain whose realm/domain settings should apply to feed, search, realm, and profile queries. In normal production deployments the client uses the browser hostname automatically, so the deployed host must match the domain registered in Taggr. The env value is mainly a fallback for local development or IPFS gateway previews where the browser hostname is not the registered domain.

Authentication follows Taggr’s custom-frontend model. By default, `VITE_TAGGR_AUTH_MODE=delegation` creates a temporary local identity and redirects the user to Taggr’s canister-hosted canonical frontend, configured by `VITE_TAGGR_CANONICAL_AUTH_URL`, to authorize that identity through Taggr’s `set_delegation` flow. Set `VITE_TAGGR_AUTH_MODE=direct` only for canonical deployments or local experiments where you intentionally want direct Internet Identity against the current origin.

Important: Taggr only authorizes delegation for domains registered in Taggr’s backend domain registry. `localhost`, `127.0.0.1`, and raw IPFS gateway CID hosts cannot be authorized as your existing Taggr account. For local development and public IPFS previews, public browsing works; authenticated writes need either a registered custom domain or a canonical/canister-hosted deployment. This repo’s intended production host is `taggr-gallery.promptops.cc`, so `VITE_TAGGR_DELEGATION_DOMAIN` is set to that value in `.env.example`. That domain still needs to be registered in Taggr’s Domains settings before delegated login will work there.

Direct Internet Identity mode follows Taggr’s frontend settings: `https://id.ai/?feature_flag_guided_upgrade=true`, disabled auth-client idle timeout, 30-day max delegation lifetime, and `derivationOrigin` set to the current frontend origin.

Reward values are displayed as estimated USD in the feed and post detail views. The adapter keeps raw Taggr credits in `rewardsAmount`, converts with Taggr’s `1000 credits = 1 XDR` rule, and uses `VITE_USD_PER_XDR` for the final USD estimate. The default is `1.37`, matching Taggr’s frontend constant; override it if Taggr changes its displayed XDR rate.

## Where To Add Taggr Canister Details

Real ICP integration is prepared in:

- `src/lib/icp/agent.ts` for creating an ICP agent and actor.
- `src/lib/icp/identity.ts` for Internet Identity login/logout/getIdentity/isAuthenticated.
- `src/lib/taggr/realTaggrClient.ts` for mapping Taggr canister methods into the frontend-friendly `TaggrClient` interface.
- `src/lib/taggr/taggrTypes.ts` for the stable UI-facing data model.

Keep backend-specific response variants inside `realTaggrClient.ts` so UI components remain independent of Taggr method names. If Taggr changes its raw JSON query methods or Candid write signatures, update the mapping there.

## Product Notes

This frontend does not own the Taggr backend. The backend remains on ICP. This client only changes the UX, discovery model, branding, visual browsing, and interaction layer.

Private, paid, or permissioned features require backend-level authorization or encryption. Frontend-only gating is not secure and should not be treated as a paywall or access-control mechanism.

## Features In This MVP

- Visual masonry gallery with image-first post cards.
- Optional forum-style feed for denser, Reddit-like reading.
- Realm filtering, keyword search, images-only toggle, and sort modes.
- Post detail modal with large media, comments, reactions, copy link, and canonical Taggr link.
- Realm index with preview imagery and realm-specific gallery entry.
- Create form with image URL, realm selector, text field, and preview card.
- Profile archive view with stats and visual grid.
- Auth adapter for Internet Identity, with mock-mode session behavior for local UX testing.
- Three CSS-variable themes: Noir, Amber Terminal, and Paper Archive.
- Feed style setting: Gallery or Forum.
- Feed density settings: Compact, Comfortable, and Large Gallery.
- PWA-ready manifest.

## Deployment Options

This is a static Vite app. After `npm run build`, deploy the `dist/` directory to any static host, asset canister, or ICP frontend canister setup.

The Vite build uses relative asset paths (`base: "./"`) so the app can run from `/ipfs/<cid>/` gateway paths.

When deploying against real Taggr, set:

```bash
VITE_TAGGR_API_MODE=real
VITE_TAGGR_CANISTER_ID=<taggr-canister-id>
```

The default mainnet canister id from Taggr’s repository is already configured in `.env.example`.

## IPFS Deployment

Current local IPFS deployment:

```text
CID: bafybeidto5kkzaa2wqfxjrwvq4abpf2eqhecnammuj4i5dyjb7pl2rcxgu
Local gateway: http://127.0.0.1:8081/ipfs/bafybeidto5kkzaa2wqfxjrwvq4abpf2eqhecnammuj4i5dyjb7pl2rcxgu/
Public gateway: https://dweb.link/ipfs/bafybeidto5kkzaa2wqfxjrwvq4abpf2eqhecnammuj4i5dyjb7pl2rcxgu/
CAR artifact: taggr-gallery-client-deployed.car
```

The CID is recursively pinned in the local Kubo repo at `.ipfs-taggr`. For durable public availability, import `taggr-gallery-client-deployed.car` into a pinning service or pin the CID from another always-on IPFS node.

## GitHub IPFS Pinning

This repo includes a GitHub Actions workflow at `.github/workflows/ipfs.yml`.

On every push to `main`, the workflow:

- installs dependencies with `npm ci`
- builds the static Vite app
- uploads the `dist/` directory as a GitHub Actions artifact
- pins `dist/` to IPFS through Pinata when `PINATA_JWT` is configured

To enable automatic IPFS pinning, add a repository secret named `PINATA_JWT` with a Pinata API JWT that can call `pinFileToIPFS`.

You can also pin locally after building:

```bash
npm run build
PINATA_JWT=<pinata-jwt> npm run pin:ipfs
```

The workflow intentionally skips pinning when `PINATA_JWT` is missing, so ordinary pull requests and forks can still build without secret access.
