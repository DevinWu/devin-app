const express = require('express');
const { createClient } = require('@vercel/edge-config');

const router = express.Router();
console.log('EDGE_CONFIG:', process.env.REACT_APP_EDGE_CONFIG);
console.log('REDIS_KV_REST_API_READ_ONLY_TOKEN:', process.env.REACT_APP_REDIS_KV_REST_API_READ_ONLY_TOKEN);

const edgeConfigClient = createClient(process.env.REACT_APP_EDGE_CONFIG);
console.log('edgeConfigClient:', edgeConfigClient);

router.get('/config/:key', async (req, res) => {
  try {
    console.log('req:', req);
    const { key } = req.params;
    console.log('key to fetch:', key);
    const value = await edgeConfigClient.get(key);
    console.log('value:', value);
    res.json({ value });
  } catch (error) {
    console.error('Error fetching edge config:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router; 