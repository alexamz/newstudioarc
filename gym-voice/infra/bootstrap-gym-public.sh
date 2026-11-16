#!/usr/bin/env bash
# Public sanitized copy of Gym Voice bootstrap source 0738369861c8007c487dae7a28ba370322aa65d3.
# ONE-TIME, INTERACTIVE and potentially billable. Run only after explicit owner authorization.
# The subscription and tenant are discovered from the Azure Cloud Shell session.
# Do not use this for any unrelated Azure subscription.
# Required: Azure Cloud Shell logged into the existing subscription with RG, Entra and RBAC privileges.
set -Eeuo pipefail
umask 077
for cmd in az openssl jq sha256sum; do command -v "$cmd" >/dev/null || { echo "Missing $cmd" >&2; exit 1; }; done
SUB="$(az account show --query id -o tsv)"
TENANT="$(az account show --query tenantId -o tsv)"
RG="rg-gym-voice"
REGION="northeurope"
ACR="gymvoice1459695502"
ENV="gym-voice-env"
APP="gym-voice"
SOURCE_RG="rg-quant-research-validation"
DEPLOYMENT="m4b-validation"
OIDC_SUB="repo:alexamz@16043606/gym-voice@1459695502:ref:refs/heads/master"
PRINCIPAL_NAME="gym-voice-github-deploy"
OPENAI_NAME="quantvaloa-$(printf '%s' "$SUB|$SOURCE_RG" | sha256sum | cut -c1-12)"

az account show --output none || { echo "Azure Cloud Shell is not authenticated" >&2; exit 1; }
az account set --subscription "$SUB"
test "$(az account show --query tenantId -o tsv)" = "$TENANT" || { echo "Wrong tenant" >&2; exit 1; }
echo "Verifying pre-existing model (read only)..."
MODEL_JSON="$(az cognitiveservices account show -g "$SOURCE_RG" -n "$OPENAI_NAME" -o json)"
test "$(jq -r .kind <<<"$MODEL_JSON")" = "OpenAI"
MODEL_ID="$(jq -r .id <<<"$MODEL_JSON")"
MODEL_ENDPOINT="$(jq -r .properties.endpoint <<<"$MODEL_JSON")"
test -n "$MODEL_ID"
test -n "$MODEL_ENDPOINT"
az cognitiveservices account deployment show -g "$SOURCE_RG" -n "$OPENAI_NAME" --deployment-name "$DEPLOYMENT" --output none
echo "Model is present: $DEPLOYMENT"

# Create non-billable Entra application/federation BEFORE provisioning paid Azure services.
CLIENT_ID="$(az ad app list --filter "displayName eq '$PRINCIPAL_NAME'" --query '[0].appId' -o tsv)"
if [ -z "$CLIENT_ID" ] || [ "$CLIENT_ID" = "None" ]; then
  CLIENT_ID="$(az ad app create --display-name "$PRINCIPAL_NAME" --query appId -o tsv)"
fi
az ad sp show --id "$CLIENT_ID" --output none >/dev/null 2>&1 || az ad sp create --id "$CLIENT_ID" --output none
SP_OBJECT_ID="$(az ad sp show --id "$CLIENT_ID" --query id -o tsv)"
test -n "$SP_OBJECT_ID"
FC_COUNT="$(az ad app federated-credential list --id "$CLIENT_ID" --query "[?name=='gym-master'].name | length(@)" -o tsv)"
if [ "$FC_COUNT" = 0 ]; then
  FED_JSON="$(printf '{"name":"gym-master","issuer":"https://token.actions.githubusercontent.com","subject":"%s","description":"Immutable gym repo master only","audiences":["api://AzureADTokenExchange"]}' "$OIDC_SUB")"
  az ad app federated-credential create --id "$CLIENT_ID" --parameters "$FED_JSON" --output none
fi

az extension add --name containerapp --upgrade --yes >/dev/null
az provider register --namespace Microsoft.App --wait >/dev/null
az provider register --namespace Microsoft.ContainerRegistry --wait >/dev/null
az group show -g "$RG" --output none >/dev/null 2>&1 || az group create -g "$RG" -l "$REGION" --output none
az acr show -g "$RG" -n "$ACR" --output none >/dev/null 2>&1 || az acr create -g "$RG" -n "$ACR" --sku Basic --admin-enabled false --output none
REGISTRY_ID="$(az acr show -g "$RG" -n "$ACR" --query id -o tsv)"
GROUP_ID="$(az group show -g "$RG" --query id -o tsv)"

if ! az containerapp env show -g "$RG" -n "$ENV" --output none >/dev/null 2>&1; then
  if ! az containerapp env create -g "$RG" -n "$ENV" -l "$REGION" --logs-destination none --output none; then
    echo "No-logs mode rejected by Azure; enabling default Log Analytics workspace (may incur extra costs)." >&2
    az containerapp env create -g "$RG" -n "$ENV" -l "$REGION" --output none
  fi
fi

if ! az containerapp show -g "$RG" -n "$APP" --output none >/dev/null 2>&1; then
  PERSONAL_TOKEN="$(openssl rand -base64 48 | tr '+/' '-_' | tr -d '=')"
  az containerapp create -g "$RG" -n "$APP" --environment "$ENV" \
    --image "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest" \
    --ingress external --target-port 8080 --cpu 0.25 --memory 0.5Gi \
    --min-replicas 0 --max-replicas 1 \
    --secrets "gym-access-token=$PERSONAL_TOKEN" \
    --env-vars "GYM_ACCESS_TOKEN=secretref:gym-access-token" "AZURE_OPENAI_ENDPOINT=$MODEL_ENDPOINT" "AZURE_OPENAI_DEPLOYMENT=$DEPLOYMENT" \
    --output none
  FQDN="$(az containerapp show -g "$RG" -n "$APP" --query properties.configuration.ingress.fqdn -o tsv)"
  echo ""
  echo "PRIVATE ACTIVATION LINK FOR YOUR IPHONE (never paste this link into ChatGPT or GitHub):"
  echo "https://$FQDN/#activate=$PERSONAL_TOKEN"
  unset PERSONAL_TOKEN
fi

az containerapp identity assign -g "$RG" -n "$APP" --system-assigned --output none
GYM_PRINCIPAL="$(az containerapp show -g "$RG" -n "$APP" --query identity.principalId -o tsv)"
test -n "$GYM_PRINCIPAL"

ensure_role() {
  local role="$1" scope="$2" principal="$3" count
  count="$(az role assignment list --assignee "$principal" --scope "$scope" --all --query "[?roleDefinitionName=='$role'] | length(@)" -o tsv 2>/dev/null || echo 0)"
  if [ "$count" = 0 ]; then
    az role assignment create --assignee-object-id "$principal" --assignee-principal-type ServicePrincipal \
      --role "$role" --scope "$scope" --output none
  fi
}
ensure_role "Cognitive Services OpenAI User" "$MODEL_ID" "$GYM_PRINCIPAL"
ensure_role "AcrPull" "$REGISTRY_ID" "$GYM_PRINCIPAL"
az containerapp registry set -g "$RG" -n "$APP" --server "$ACR.azurecr.io" --identity system --output none

ensure_role "Contributor" "$GROUP_ID" "$SP_OBJECT_ID"
ensure_role "AcrPush" "$REGISTRY_ID" "$SP_OBJECT_ID"
echo ""
echo "AZURE_GYM_BOOTSTRAP=PASS"
echo "AZURE_GYM_CLIENT_ID=$CLIENT_ID"
echo "Share ONLY this public client ID in chat; never share the activation link."
echo "No Quant application, registry or runtime identity has been modified."
