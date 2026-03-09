# Cloud Build + Cloud Run Trigger (GitHub)

Replace placeholders and run the commands below.

```bash
PROJECT_ID="YOUR_PROJECT_ID"
REGION="us-central1"
REPO_OWNER="YOUR_GITHUB_ORG_OR_USER"
REPO_NAME="YOUR_NEW_REPO"
BRANCH="^main$"
SERVICE="medsim-beta"
AR_REPO="simmit-images"
TRIGGER_NAME="${SERVICE}-main"

SECRET_GEMINI="simmit-gemini-api-key"
SECRET_SUPABASE_URL="simmit-supabase-url"
SECRET_SUPABASE_ANON="simmit-supabase-anon-key"

gcloud config set project "${PROJECT_ID}"

# 1) Create Artifact Registry repo (one-time)
gcloud artifacts repositories create "${AR_REPO}" \
  --repository-format=docker \
  --location="${REGION}" \
  --description="Docker images for ${SERVICE}" || true

# 2) Grant Cloud Build permissions
PROJECT_NUMBER="$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')"
CLOUDBUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/iam.serviceAccountUser"

# 3) Create secrets (one-time) and add values
printf 'REPLACE_ME' | gcloud secrets create "${SECRET_GEMINI}" --data-file=- || true
printf 'REPLACE_ME' | gcloud secrets create "${SECRET_SUPABASE_URL}" --data-file=- || true
printf 'REPLACE_ME' | gcloud secrets create "${SECRET_SUPABASE_ANON}" --data-file=- || true

# If secrets already exist, add a new version instead:
# printf 'REAL_VALUE' | gcloud secrets versions add "${SECRET_GEMINI}" --data-file=-
# printf 'REAL_VALUE' | gcloud secrets versions add "${SECRET_SUPABASE_URL}" --data-file=-
# printf 'REAL_VALUE' | gcloud secrets versions add "${SECRET_SUPABASE_ANON}" --data-file=-

# 4) Create GitHub trigger
gcloud builds triggers create github \
  --name="${TRIGGER_NAME}" \
  --repo-owner="${REPO_OWNER}" \
  --repo-name="${REPO_NAME}" \
  --branch-pattern="${BRANCH}" \
  --build-config="cloudbuild.yaml" \
  --substitutions="_SERVICE=${SERVICE},_REGION=${REGION},_AR_REPO=${AR_REPO},_SECRET_GEMINI_API_KEY=${SECRET_GEMINI},_SECRET_SUPABASE_URL=${SECRET_SUPABASE_URL},_SECRET_SUPABASE_ANON_KEY=${SECRET_SUPABASE_ANON}"
```

## Notes
- Cloud Run receives env vars via `--set-secrets`; no `VITE_*` values are hardcoded in the image.
- `docker-entrypoint.d/99-env.sh` writes `/usr/share/nginx/html/env.js` at runtime.
- For a private repo, make sure Cloud Build GitHub app access is authorized before creating the trigger.
