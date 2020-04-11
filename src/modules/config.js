import 'dotenv/config';

export const logging = {
  level: process.env.DIY_LOG_LEVEL || 'info',
  timestampFormat: process.env.DIY_LOG_TIME_FMT
};

export default {
  logging
};
