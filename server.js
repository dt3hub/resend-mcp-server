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
