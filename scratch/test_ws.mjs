import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3100/api/master-trace/ws');

ws.on('open', () => {
  console.log('Connected to Master Trace WebSocket');
  setTimeout(() => {
    console.log('Closing connection');
    ws.close();
    process.exit(0);
  }, 2000);
});

ws.on('error', (err) => {
  console.error('WebSocket Error:', err);
  process.exit(1);
});

ws.on('close', () => {
  console.log('Connection closed');
});
