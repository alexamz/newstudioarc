# Gym Voice — AI endpoint (prepared; not yet deployed)

Small stateless Azure Container App, hosting the PWA and `POST /api/interpret` on a **dedicated, same-origin HTTPS domain**. Calls the previously validated Azure OpenAI resource through **its own system-assigned managed identity**, not the Quant application's identity. JSON-schema output is validated again on the server before the PWA is allowed to review/save anything. No new database, no API key for the model, no user accounts.

Configuration on server ONLY:

- `GYM_ACCESS_TOKEN`: random >=40-character secret; configured as Container App secret and revocable by rotation. Never commit this to GitHub, print in CI logs, or serve it in static JS.
- `AZURE_OPENAI_ENDPOINT`: actual existing resource URL (not inferred from the model name).
- `AZURE_OPENAI_DEPLOYMENT`: actual existing deployment name, historically `m4b-validation` (verify live).
- Azure Container Apps injects `IDENTITY_ENDPOINT` and `IDENTITY_HEADER` when system identity enabled.
- Container app with `minReplicas=0`, `maxReplicas=1`, port 8080.

Deployment requires an Azure principal with permission to create the container and grant the new identity **Cognitive Services OpenAI User** at the model resource. The GitHub connector can edit files but cannot grant Azure RBAC or configure OIDC; do not claim this app is deployed. Do not change or restart `quant-val-api` or use its identity. Plan to use existing ACR and Container Apps environment only if resource permissions/ownership allow safely.

Local test: `node --test gym-voice/bridge/test/*.test.mjs` from repo root. Image: `docker build -f gym-voice/bridge/Dockerfile -t gym-voice:dev .`. No external npm runtime modules. Tests mock model response (not evidence of successful live calls).

Budget safety: a bearer secret and 30-requests/day **per running instance** limit are implemented; that limit resets on cold starts and **is not a reliable global spending cap**. Before opening a billable endpoint, set low Azure model quota/rate limits and budget alerts. Browser-side access token must be provisioned through a private one-time link on the *dedicated* domain, never through the shared raw.githack.com origin. Server is stateless; sessions are still stored only on the user's device. Cloud sync and backup restore remain separate future work.
