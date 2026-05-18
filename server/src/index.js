import app from './app.js';
import connectDB from './config/db.js';
import { info, error } from './utils/logger.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initVibSyncSocket } from './socket/vibsync.js';

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Create HTTP Server and attach Socket.io
    const httpServer = createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: '*', // Adjust for production later if needed
        methods: ['GET', 'POST']
      }
    });

    // 3. Initialize VibSync Sockets
    initVibSyncSocket(io);

    // 4. Start Server
    httpServer.listen(PORT, '0.0.0.0', () => {
      info(`🚀 VibAura Server (with VibSync) running on http://0.0.0.0:${PORT}`);
    });

  } catch (err) {
    error('Failed to start server:', err.message);
    process.exit(1);
  }
};

// Handle process-wide events
process.on('unhandledRejection', (err) => {
  error('Unhandled Rejection! Shutting down...', err.message);
  process.exit(1);
});

startServer();
