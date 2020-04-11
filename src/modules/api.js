import axios from 'axios';
import Bottleneck from 'bottleneck';

import { version } from '../../package.json';

export default class API {
  static userAgent = `ApexScrape/${version}`;
  static requestTimeoutMs = 30000;

  constructor(options = {}) {
    this.rateLimiter = new Bottleneck(options.rateLimiter);
    this.options = options;

    this.rateLimit = this.rateLimit.bind(this);
    this.request = this.request.bind(this);
  }

  async request(url) {
    return await this.rateLimit(axios, {
      method: 'GET',
      url,
      headers: {
        'User-Agent': API.userAgent
      },
      timeout: API.requestTimeoutMs
    });
  }

  async rateLimit(fn, ...args) {
    return await this.rateLimiter.schedule(fn.bind(this, ...args));
  }
}
