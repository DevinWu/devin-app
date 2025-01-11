import React, { useEffect, useState } from 'react';
import { createClient } from '@vercel/edge-config';

console.log('EDGE_CONFIG:', process.env.REACT_APP_EDGE_CONFIG);
console.log('REDIS_KV_REST_API_READ_ONLY_TOKEN:', process.env.REACT_APP_REDIS_KV_REST_API_READ_ONLY_TOKEN);

const edgeConfigClient = createClient(process.env.REACT_APP_EDGE_CONFIG);
console.log('edgeConfigClient:', edgeConfigClient);

const MessageBoard = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('EDGE_CONFIG:', process.env.REACT_APP_EDGE_CONFIG);
  }

  const [greeting, setGreeting] = useState('');
  const [dashboard, setDashboard] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const greetingValue = await edgeConfigClient.get('greeting');
        const dashboardValue = await edgeConfigClient.get('dashboard');
        setGreeting(greetingValue);
        setDashboard(dashboardValue);
      } catch (error) {
        console.error('Error fetching edge config:', error);
      }
    };

    fetchConfig();
  }, []);

  return (
    <div>
      <h2>留言板</h2>
      <div style={{ marginBottom: '20px' }}>
        <h3>Greeting</h3>
        <p style={{ maxHeight: '4em', overflow: 'hidden' }}>{greeting}</p>
      </div>
      <div>
        <h3>Dashboard</h3>
        <p>{dashboard}</p>
      </div>
    </div>
  );
};

export default MessageBoard; 