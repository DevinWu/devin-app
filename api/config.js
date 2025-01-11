const { createClient } = require('@vercel/edge-config');

module.exports = async (req, res) => {
  const edgeConfigClient = createClient(process.env.REACT_APP_EDGE_CONFIG);

  if (req.method === 'GET') {
    try {
      const { key } = req.query;
      const value = await edgeConfigClient.get(key);
      res.status(200).json({ value });
    } catch (error) {
      console.error('Error fetching edge config:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}; 