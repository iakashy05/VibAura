/**
 * A simple centralized logger for the VibAura server.
 * In a real-world production app, this would use a library like Winston or Pino.
 */

export const info = (...args) => {
  console.log('✅ [INFO]:', ...args);
};

export const warn = (...args) => {
  console.warn('⚠️ [WARN]:', ...args);
};

export const error = (...args) => {
  console.error('❌ [ERROR]:', ...args);
};

export const debug = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.debug('🐛 [DEBUG]:', ...args);
  }
};
