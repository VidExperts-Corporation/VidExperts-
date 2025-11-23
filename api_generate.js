// Example: serverless function (Vercel / Netlify style)
// Deploy at /api/generate
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Server not configured' });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };

    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const errBody = await r.text();
      console.error('Gemini API error', r.status, errBody);
      return res.status(502).json({ error: 'Upstream API error' });
    }

    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    // Basic sanitization server-side (strip script tags)
    const safe = text.replace(/<\s*script.*?>.*?<\s*\/\s*script\s*>/gi, '');
    return res.json({ output: safe });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}