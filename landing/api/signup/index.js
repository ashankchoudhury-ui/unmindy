const { put, list, get } = require('@vercel/blob');

const BLOB_PREFIX = 'signups/';

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
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

    const registration = {
      email: normalizedEmail,
      referred_by: referred_by || null,
      timestamp,
      source: 'landing-page',
      verified: false
    };

    try {
      // Check for duplicates using list
      console.log('Checking for duplicates...');
      let existing = [];
      try {
        const listResult = await list({ prefix: BLOB_PREFIX, limit: 100 });
        existing = listResult.blobs || [];
        console.log('List result:', existing.length, 'blobs found');
      } catch (listError) {
        console.log('List error:', listError.message);
        // Continue with empty list
      }

      // Check each existing signup for duplicates
      let isDuplicate = false;
      if (existing.length > 0) {
        for (const blob of existing) {
          try {
            const result = await get(blob.pathname, { access: 'private' });
            if (result && result.stream) {
              const chunks = [];
              for await (const chunk of result.stream) {
                chunks.push(chunk);
              }
              const text = Buffer.concat(chunks).toString('utf8');
              const data = JSON.parse(text);
              if (data.email === normalizedEmail) {
                isDuplicate = true;
                break;
              }
            }
          } catch (e) {
            // Skip this blob if we can't read it
          }
        }
      }

      if (isDuplicate) {
        console.log('Duplicate found');
        return res.status(200).json({ ok: true, message: 'Already registered' });
      }

      // Save new registration
      const blobKey = `${BLOB_PREFIX}${id}.json`;
      console.log('Saving to:', blobKey);
      
      await put(blobKey, JSON.stringify(registration), {
        access: 'private',
        contentType: 'application/json'
      });

      return res.status(200).json({ 
        ok: true, 
        code: 'sprint-' + Math.random().toString(36).substr(2, 5),
        message: 'Registration successful',
        total: existing.length + 1
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
