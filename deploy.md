# Deployment Instructions

## Quick Deploy to Vercel

### Step 1: Set Up Environment Variables

Go to your Vercel dashboard and add these environment variables:

1. **REACT_APP_SUPABASE_URL**: `https://gefrieuzuosbewltdbzq.supabase.co`
2. **REACT_APP_SUPABASE_ANON_KEY**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlZnJpZXV6dW9zYmV3bHRkYnpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NzI1MzcsImV4cCI6MjA2ODE0ODUzN30.ltvNOVqHrrPEPlFqUCGzs5IdjIWw_OqhTYAIC5XG4r0`

### Step 2: Deploy

The project is already connected to Vercel. Simply:

1. Go to [vercel.com](https://vercel.com)
2. Find your `yale-knowledge-graph` project
3. Add the environment variables in Settings → Environment Variables
4. Redeploy from the Deployments tab

### Step 3: Enable Auto-Deployment

1. In Vercel dashboard, go to your project
2. Go to Settings → Git
3. Ensure "Automatically deploy" is enabled for the main branch

## Manual CLI Deployment

If you prefer CLI deployment:

```bash
# Set environment variables first in Vercel dashboard
# Then redeploy
npx vercel --prod
```

## GitHub Auto-Deployment

Once environment variables are set, every push to main branch will automatically trigger a deployment.

## Current Status

- ✅ Application built and tested locally
- ✅ Production build successful
- ✅ Vercel project created
- ⏳ Environment variables need to be set in Vercel dashboard
- ⏳ Redeploy after environment variables are configured

## Next Steps

1. Set environment variables in Vercel dashboard
2. Redeploy the project
3. Test the live application
4. Verify auto-deployment works on next commit