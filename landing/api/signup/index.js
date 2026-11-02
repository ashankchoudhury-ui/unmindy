const { put, get } = require('@vercel/blob');

const BLOB_KEY = 'signups.json';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, referred_by } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const timestamp = new Date().toISOString();

    const registration = {
      email: normalizedEmail,
      referred_by: referred_by || null,
      timestamp,
      source: 'landing-page',
      verified: false
    };

    try {
      // Get existing signups
      let signups = [];
      try {
        const existing = await get(BLOB_KEY);
        if (existing && existing.blob) {
          const text = await existing.blob.text();
          signups = JSON.parse(text);
          if (!Array.isArray(signups)) signups = [];
        }
      } catch (e) {
        // File doesn't exist yet, start fresh
        signups = [];
      }

      // Check for duplicates
      const isDuplicate = signups.some(s => s.email === normalizedEmail);
      if (isDuplicate) {
        return res.status(200).json({ ok: true, message: 'Already registered' });
      }

      // Add new signup
      signups.push(registration);

      // Save back to Blob
      await put(BLOB_KEY, JSON.stringify(signups, null, 2), {
        access: 'private',
        contentType: 'application/json'
      });

      return res.status(200).json({ 
        ok: true, 
        code: 'sprint-' + Math.random().toString(36).substr(2, 5),
        message: 'Registration successful'
      });

    } catch (blobError) {
      console.error('Blob storage error:', blobError);
      return res.status(500).json({ error: 'Storage error' });
    }

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
