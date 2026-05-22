# 🚀 Deploying motheomasole.com — Step by Step

## What you have
A complete 6-page website that automatically pulls your ConvertKit articles.
Pages: Home, Blog, Article viewer, About, Freebies, Newsletter.

---

## Step 1 — Upload to GitHub (5 mins)

1. Go to **github.com** and sign in
2. Click the **+** icon (top right) → **New repository**
3. Name it: `motheomasole-site`
4. Set to **Public**, click **Create repository**
5. On the next screen, click **uploading an existing file**
6. Unzip the `motheomasole-site.zip` I gave you
7. Drag the entire **contents** of the `motheomasole` folder into GitHub (not the folder itself — the files inside it)
8. Scroll down, click **Commit changes**

---

## Step 2 — Deploy on Netlify (3 mins)

1. Go to **netlify.com** and sign in
2. Click **Add new site** → **Import an existing project**
3. Choose **GitHub** → authorise → select `motheomasole-site`
4. Leave all settings as default
5. Click **Deploy site**

Your site will be live in ~30 seconds at a random Netlify URL (e.g. `happy-cat-123.netlify.app`). Test it works first.

---

## Step 3 — Connect your domain (5 mins)

### In Netlify:
1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Type `motheomasole.com` → click **Verify**
4. Netlify will show you DNS records to add

### In your domain registrar (wherever you bought motheomasole.com):
Add these DNS records:
- **Type:** A — **Name:** @ — **Value:** `75.2.60.5`
- **Type:** CNAME — **Name:** www — **Value:** `[your-netlify-site].netlify.app`

DNS can take up to 24 hours to propagate but is usually live within 1 hour.

---

## Step 4 — Update your ConvertKit newsletter form link

In `js/main.js`, find this line:
```
window.open(`https://app.convertkit.com/landing_pages`, '_blank');
```
Replace it with the direct URL of your ConvertKit subscribe form/landing page.
You can find this in ConvertKit → Landing Pages & Forms → your form → Share.

---

## That's it! ✅

Your site will now:
- Show your latest articles automatically from ConvertKit
- Update every time you publish a new broadcast
- Work on any device
- Cost $0/month forever

---

## Future upgrades
- **Podcast**: When you launch, add a Podcast page and embed Spotify player
- **Digital products**: Update the Freebies page with real Carrd landing page links
- **Custom email**: Add a professional email via Cloudflare Email Routing (free)
