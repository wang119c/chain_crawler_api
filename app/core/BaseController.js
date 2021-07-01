'use strict';
const { Controller } = require('egg');

const userAgent = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.11 (KHTML, like Gecko) Ubuntu/11.10 Chromium/27.0.1453.93 Chrome/27.0.1453.93 Safari/537.36',
  'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_6; en-US) AppleWebKit/533.20.25 (KHTML, like Gecko) Version/5.0.4 Safari/533.20.27',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:21.0) Gecko/20100101 Firefox/21.0'
];

class BaseController extends Controller {
  async getUserAgent() {
    const index = Math.floor(Math.random() * userAgent.length);
    return userAgent[index];
  }

  async returnService(promise) {
    const [ error, data ] = await this.wapperError(promise);
    if (error) {
      this.error(error);
    } else {
      this.success(data);
    }
  }

  success(data) {
    this.ctx.body = {
      status: 'OK',
      data,
    };
  }

  error(error) {
    this.ctx.body = {
      status: 'NG',
      error: error.message || error,
    };
  }

  wapperError(promise) {
    return promise.then(data => {
      return [ undefined, data ];
    })
      .catch(err => [ err ]);
  }
}

module.exports = BaseController;
