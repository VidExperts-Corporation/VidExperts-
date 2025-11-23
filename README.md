# VIDEXPERTS Website

This repo contains the frontend and small serverless endpoints to power the VIDEXPERTS marketing site with AI features.

Quick start (Vercel recommended)
1. Create a new GitHub repo and push the project.
2. Add env variables in Vercel: GEMINI_API_KEY, SENDGRID_API_KEY, TO_EMAIL.
3. Install dependencies and build (if using Tailwind compiled):
   - npm install
   - npm run build
4. Deploy to Vercel / Netlify (serverless functions under /api will be deployed automatically).

Files of interest
- public/index.html — main HTML (the UI you provided)
- public/js/site.js — client-side behavior (mobile menu, AI calls)
- api/generate.js — serverless proxy for Gemini
- api/contact.js — serverless contact endpoint (SendGrid)

Security notes
- Never put the GEMINI API key in client-side JS.
- Use server-side rate limiting and spam protections (reCAPTCHA / honeypot).
- Sanitize any user-generated content returned by AI before rendering.

If you want, I can:
- Generate a full repo tree with these files added to your existing HTML, and a package.json & Tailwind config.
- Or create a Vercel-friendly project scaffold and configuration you can deploy immediately.