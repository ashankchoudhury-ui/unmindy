const { list, get } = require('@vercel/blob');

const BLOB_PREFIX = 'signups/';

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const listResult = await list({ prefix: BLOB_PREFIX, limit: 100 });
    const blobs = listResult.blobs || [];
    
    console.log('Found', blobs.length, 'signups');
    
    // Read each signup
    const signups = [];
    for (const blob of blobs) {
      try {
        const result = await get(blob.pathname, { access: 'private' });
        if (result && result.stream) {
          const chunks = [];
          for await (const chunk of result.stream) {
            chunks.push(chunk);
          }
          const text = Buffer.concat(chunks).toString('utf8');
          signups.push(JSON.parse(text));
        }
      } catch (e) {
        console.error('Error reading', blob.pathname, e.message);
      }
    }
    
    // Sort by timestamp
    signups.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    return res.status(200).json({
      total: signups.length,
      signups
    });

  } catch (error) {
    console.error('List error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
