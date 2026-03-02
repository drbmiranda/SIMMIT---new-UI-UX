# Cloud Build Trigger (CLI)

Replace placeholders and run:

```bash
PROJECT_ID="YOUR_PROJECT_ID"
REGION="us-central1"
REPO_OWNER="drbmiranda"
REPO_NAME="medsim-beta"
BRANCH="^main$"
SERVICE="medsim-beta"
IMAGE="gcr.io/${PROJECT_ID}/medsim-beta"

gcloud config set project "${PROJECT_ID}"

gcloud builds triggers create github \
  --name="medsim-beta-main" \
  --repo-owner="${REPO_OWNER}" \
  --repo-name="${REPO_NAME}" \
  --branch-pattern="${BRANCH}" \
  --build-config="cloudbuild.yaml" \
  --substitutions="_VITE_GEMINI_API_KEY=REPLACE_ME,_VITE_SUPABASE_URL=REPLACE_ME,_VITE_SUPABASE_ANON_KEY=REPLACE_ME,_SERVICE=${SERVICE},_REGION=${REGION},_IMAGE=${IMAGE}"
```
