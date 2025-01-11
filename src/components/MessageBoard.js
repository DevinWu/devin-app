import React, { useEffect, useState } from 'react';

const MessageBoard = () => {
  const [greeting, setGreeting] = useState('');
  const [dashboard, setDashboard] = useState('');

  useEffect(() => {
    const fetchConfig = async (key, setter) => {
      try {
        const response = await fetch(`/api/config/${key}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setter(data.value);
      } catch (error) {
        console.error(`Error fetching ${key}:`, error);
      }
    };

    fetchConfig('greeting', setGreeting);
    fetchConfig('dashboard', setDashboard);
  }, []);

  return (
    <div>
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