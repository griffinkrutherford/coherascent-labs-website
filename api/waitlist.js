/**
 * Secure Serverless Waitlist Handler for Resend
 * Path: /api/waitlist.js
 */

module.exports = async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email } = req.body;

    // Validate email presence and simple format
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      console.error('Configuration Error: RESEND_API_KEY environment variable is not set.');
      return res.status(500).json({ error: 'Server configuration error.' });
    }

    // Call Resend's Contacts API
    // We send: email, unsubscribed: false, and a custom property to mark the source
    const response = await fetch('https://api.resend.com/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: trimmedEmail,
        unsubscribed: false
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Gracefully handle duplicate emails
      if (data.message && (data.message.includes('already exists') || data.message.includes('duplicate'))) {
        return res.status(200).json({
          success: true,
          message: 'Already subscribed! You are already on the waitlist.'
        });
      }

      console.error('Resend API Error response:', data);
      return res.status(response.status).json({
        error: data.message || 'Failed to register email with Resend.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully added to waitlist!'
    });

  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
};
