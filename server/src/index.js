import app from './app.js';
import connectDB from './config/db.js';
import { info, error } from './utils/logger.js';

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Start Express Server
    app.listen(PORT, () => {
      info(`🚀 VibAura Optimized Server running on http://localhost:${PORT}`);
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
