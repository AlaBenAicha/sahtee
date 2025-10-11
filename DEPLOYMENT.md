# GitHub Pages Deployment Guide

This guide will help you deploy the SAHTEE platform to GitHub Pages.

## Prerequisites

- GitHub repository: `https://github.com/AlaBenAicha/sahtee`
- GitHub Actions workflow file already created (`.github/workflows/deploy.yml`)

## Steps to Enable GitHub Pages

### 1. Enable GitHub Pages in Repository Settings

1. Go to your repository: https://github.com/AlaBenAicha/sahtee
2. Click on **Settings** (top menu)
3. In the left sidebar, click on **Pages** (under "Code and automation")
4. Under **Source**, select:
   - Source: **GitHub Actions**
5. Click **Save**

### 2. Trigger the Deployment

The deployment will automatically trigger when you push to the `main` branch. Since we just pushed the workflow file, it should already be running.

To check the deployment status:
1. Go to the **Actions** tab in your repository
2. You should see a workflow run called "Deploy to GitHub Pages"
3. Click on it to see the progress

### 3. Access Your Deployed Site

Once the deployment is complete (usually takes 2-3 minutes), your site will be available at:

**https://alabenaicha.github.io/sahtee/**

## Automatic Deployments

Every time you push changes to the `main` branch, GitHub Actions will automatically:
1. Install dependencies
2. Build the project
3. Deploy to GitHub Pages

## Manual Deployment

You can also trigger a deployment manually:
1. Go to the **Actions** tab
2. Click on "Deploy to GitHub Pages" workflow
3. Click **Run workflow** button
4. Select the `main` branch
5. Click **Run workflow**

## Troubleshooting

### Deployment Failed

If the deployment fails:
1. Check the Actions tab for error messages
2. Common issues:
   - Build errors: Check the build logs
   - Permission errors: Ensure GitHub Pages is enabled in settings
   - Node version: The workflow uses Node 20

### Site Not Loading

If the site doesn't load after deployment:
1. Check that the base path in `vite.config.ts` is set to `/sahtee/`
2. Clear your browser cache
3. Wait a few minutes for DNS propagation

### 404 Errors on Routes

If you get 404 errors when navigating:
1. This is expected with client-side routing on GitHub Pages
2. Users should always start from the home page
3. For a production app, consider using hash routing or a custom 404.html

## Local Development

To run the project locally:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Configuration Files

- **`.github/workflows/deploy.yml`**: GitHub Actions workflow for deployment
- **`vite.config.ts`**: Vite configuration with base path set to `/sahtee/`

## Support

For issues or questions:
- Check the Actions tab for deployment logs
- Review the GitHub Pages documentation: https://docs.github.com/en/pages

