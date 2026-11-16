# Repository migration — Gym Voice

## Agreed target
- Dedicated repo: `alexamz/gym-voice`, **private**, to prevent the project's source from living with unrelated legacy websites.
- One-user PWA; no login / users database. Dedicated Azure Container App + existing Foundry deployment via new managed identity when enabled.
- Do **not** clone/push `newstudioarc` history. Only carry the contents of `gym-voice/` and reset the paths to repository root.
- `newstudioarc/gym-voice-poc` remains **temporary** until the dedicated app is deployed and accepted.
- Do not modify `quant-research`, `autotrading`, or `boletaire` for the migration.

## Migration map (when repo exists)
| Current temporary repo | New repo |
|---|---|
| `gym-voice/index.html` | `index.html` |
| `gym-voice/manifest.webmanifest` | `manifest.webmanifest` |
| `gym-voice/sw.js` | `sw.js` |
| `gym-voice/icon.svg` | `icon.svg` |
| `gym-voice/bridge/**` | `bridge/**` |
| `gym-voice/tests/**` | `tests/**` |
| `gym-voice/docs/**` | `docs/**` |
| `gym-voice/README.md` | `README.md` |

The Dockerfile and tests currently build/run with source prefix `gym-voice/`; update those paths together when migrated. Keep a test-only workflow on default branch in the new repo, and later add deployment only after Azure OIDC permissions and specific managed-identity RBAC are configured.

## Blocking constraints and autonomy
- ChatGPT GitHub connector currently has no `create_repository` operation; only the account owner can create the empty repository using existing available tools.
- A prefilled GitHub form can request owner `alexamz`, name `gym-voice`, visibility `private`; the user must confirm **Create repository** once.
- GitHub App installation may need access to the newly created private repository; check after creation. Do not request secrets or a computer.
- The new private repository does not inherit Azure OIDC access from Quant; its immutable GitHub OIDC subject / repo ID needs separate federated identity or Azure authorization.
- No deployment CI is present here. A fast, isolated test-only check runs only for the temporary branch.

## Done criteria
1. Dedicated repository exists and its source root is independent.
2. Tests pass in the destination, including exercise interpretation cases, persistence and imported workout safety.
3. Azure deploy workflow uses its own OIDC principal; no reusable or embedded trading credentials.
4. The dedicated private-origin website serves GET/ and protected POST/api/interpret with a real model call; test in iPhone.
5. Only then retire the temporary preview.
