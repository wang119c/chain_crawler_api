'use strict';

const Controller = require('egg').Controller;
const cheerio = require('cheerio');

class HomeController extends Controller {
  async index() {
    // const { ctx } = this;
    // ctx.body = 'hi, egg';
    const { ctx } = this;

    // const result = await ctx.curl('https://coinmarketcap.com/new/', {
    //   method: 'get',
    //   headers: {
    //     'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
    //   },
    // });
    // const htmlData = result.data.toString();
    // const $ = cheerio.load(htmlData);
    // const tr = $('.cmc-table tbody')
    //   .find('tr');
    // tr.each(function(i, elem) {
    //   // console.log('==================', i, elem);
    //   let a = $(this)
    //     .find('td')
    //     .eq(2)
    //     .find('.cmc-link>div>div>p')
    //     .text();
    //   console.log('======', a);
    // });
    ctx.body = {
      status: 200,
    };
  }
}

module.exports = HomeController;
