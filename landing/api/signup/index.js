const { put, list } = require('@vercel/blob');

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
      // Store each registration as a separate file to avoid race conditions
      const filename = `signup-${Date.now()}-${Math.random().toString(36).substr(2, 5)}.json`;
      
      await put(filename, JSON.stringify(registration), {
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
