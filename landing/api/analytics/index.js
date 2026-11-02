const { put, list } = require('@vercel/blob');

const BLOB_PREFIX = 'analytics/';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { event, data } = req.body;

    if (!event) {
      return res.status(400).json({ error: 'Event name is required' });
    }

    const timestamp = new Date().toISOString();
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

    const analyticsEvent = {
      event,
      data: data || {},
      timestamp,
      ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    };

    // Store event
    const blobKey = `${BLOB_PREFIX}${Date.now()}-${id}.json`;
    await put(blobKey, JSON.stringify(analyticsEvent), {
      access: 'private',
      contentType: 'application/json'
    });

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
