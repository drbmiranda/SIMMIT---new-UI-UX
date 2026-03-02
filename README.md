<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/19JjjtYNxm656FQaYBqUL5fD5yp2wCAYG

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create `.env.local` from `.env.example` and fill in:
   - `VITE_GEMINI_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Run the app:
   `npm run dev`

## Cloud Build / Run (Google Cloud)

Vite injects `VITE_*` variables at build time. Ensure these are available during the build step:

- `VITE_GEMINI_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Cloud Build + Cloud Run deploy

This repo includes `cloudbuild.yaml` that builds and deploys to Cloud Run using substitution vars:

- `_VITE_GEMINI_API_KEY`
- `_VITE_SUPABASE_URL`
- `_VITE_SUPABASE_ANON_KEY`
- `_SERVICE` (default: `medsim-beta`)
- `_REGION` (default: `us-central1`)
- `_IMAGE` (default: `gcr.io/$PROJECT_ID/medsim-beta`)

### Cloud Build trigger (GitHub)

1. In Google Cloud Console, go to Cloud Build > Triggers.
2. Connect your GitHub account and select `drbmiranda/medsim-beta`.
3. Create a trigger for the `main` branch using `cloudbuild.yaml`.
4. Add the substitutions listed above.

CLI alternative: see `cloudbuild.trigger.md`.

### Cloud Run service YAML

`cloudrun.service.yaml` is included as a minimal template. Replace `PROJECT_ID` and apply:

```bash
gcloud run services replace cloudrun.service.yaml --region us-central1
```
