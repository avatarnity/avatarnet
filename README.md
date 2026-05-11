# Avatarnet

> The Immortal Internet: A post-quantum and decentralized network for digital immortality.

Avatarnet is a new internet built around people instead of pages. Each avatar
is a cryptographic identity carrying a signed Merkle DAG of a person's
knowledge and memories, replicated across a peer-to-peer network.

**Live site:** <https://avatarnet.tech>

---

## The Five Pillars

Every protocol operation upholds these five cryptographic guarantees.

| Pillar | Promise | Algorithm |
|---|---|---|
| 🏠🔑 **Estate Ownership** | Your estate is yours | SLH-DSA-SHA2-256f keypair |
| 👤🪪 **Avatar Identity** | Your avatar is you | SLH-DSA-SHA2-256f keypair |
| 🧠✍️ **Mind Authorship** | Your avatar signed this | SLH-DSA-SHA2-256f signature |
| 🧠🔗 **Mind Integrity** | Your avatar is immutable | SHA-512 content hash |
| 🧠🔐 **Mind Privacy** | Your avatar, your rules | AES-256-GCM with ML-KEM-1024 key exchange |

## What's in this repo

```
learn/    Long-form articles explaining the protocol (CC-BY-SA-4.0)
site/     The avatarnet.tech website, built with Rspress (AGPL-3.0)
```

The `site/` package symlinks pages from `learn/` so the site renders directly
from the source-of-truth content. Edit a learn page once, the site updates
everywhere. The protocol specification will land in this repository at
`spec/` once the draft stabilizes.

## Building the site locally

Requires Node.js 18+.

```bash
cd site
npm install
npm run dev      # http://localhost:3000
npm run build    # production build into site/build
```

> On Windows: clone in WSL2, or enable Developer Mode and
> `git config --global core.symlinks true` before cloning.
> The site uses symlinks; without them, several pages will render their
> path strings instead of content.

## Licensing

| What | License |
|------|---------|
| Code | [AGPL-3.0](LICENSE) |
| Documentation | [CC-BY-SA-4.0](learn/LICENSE) |

