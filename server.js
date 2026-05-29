const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/debug', (req, res) => {
  const relevant = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (k.toLowerCase().includes('resend') || k.toLowerCase().includes('api') || k.toLowerCase().includes('key')) {
      relevant[k] = v ? v.slice(0, 6) + '...' : 'EMPTY';
    }
  }
  res.json({
    keySet: !!process.env.RESEND_API_KEY,
    keyLength: (process.env.RESEND_API_KEY || '').length,
    totalEnvVars: Object.keys(process.env).length,
    resendRelatedVars: relevant
  });
});

app.get('/send', async (req, res) => {
  const subject = decodeURIComponent(req.query.subject || 'Weekly Update');
  const text = decodeURIComponent(req.query.text || '');

  if (!text) return res.status(400).json({ error: 'Missing text' });

  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">${
    text.split('\n').filter(l => l.trim()).map(l => `<p style="margin:8px 0">${l}</p>`).join('')
  }</div>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'updates@slophq.com',
        to: ['david.tobin@scale.com'],
        subject, html, text
      })
    });
    const result = await r.json();
    res.json(result.id ? { success: true, id: result.id } : { success: false, error: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => res.json({ status: 'ok' }));
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
