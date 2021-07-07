'use strict';
const Controller = require('../core/BaseController');
const cheerio = require('cheerio');
const utility = require('utility');
const async = require('async');

class CoindiscoveryController extends Controller {
  async index() {
    const { ctx } = this;
    const { market } = ctx.service;
    const baseUrl = 'https://coindiscovery.app';
    try {
      const result = await ctx.curl(`${baseUrl}`, {
        method: 'get',
        headers: {
          'user-agent': this.getUserAgent(),
        },
        timeout: 1000 * 120,
      });
      const htmlData = result.data.toString();
      const $ = cheerio.load(htmlData);
      const trNode = $('.clickable-row.rank');
      const urls = [];
      trNode.each((i, elem) => {
        const url = $(elem)
          .attr('data-href');
        urls.push(url);
      });
      async.mapLimit(urls, urls.length, async href => {
        const parseData = await this.parseDetail(href);
        if (parseData && parseData.currencyName) {
          market.add(parseData);
        }
      });
    } catch (err) {
      // console.log(`====${baseUrl}/en/coins/recently_added?page=${i}===请求失败`);
    }
    ctx.body = {
      status: 200,
    };
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async parseDetail(needParseUrl) {
    const { ctx } = this;
    try {
      const result = await ctx.curl(needParseUrl, {
        method: 'get',
        headers: {
          'user-agent': this.getUserAgent(),
        },
        timeout: 1000 * 30,
      });
      const htmlData = result.data.toString();
      const $ = cheerio.load(htmlData);

      const currency = $('.TimeAndName .Name')
        .text();
      const currencySplit = currency.split(' ');
      const currencyName1 = currencySplit[0].trim();
      currency.match(/\((.+)\)/);
      const currencyAbbreviations1 = RegExp.$1;
      const contractAddress1 = $('.Coin_Address')
        .find('span')
        .eq(1)
        .text();

      const liNode = $('.time-btn ul li');
      const urls = [];
      liNode.each((i, elem) => {
        const url = $(elem)
          .find('a')
          .attr('href');
        urls.push(url);
      });
      const website1 = urls[1];
      const chatLink1 = [];
      urls.forEach((item, index) => {
        if (index === 1) {
          return;
        }
        chatLink1.push(item);
      });
      return {
        currencyName: currencyName1,
        currencyAbbreviations: currencyAbbreviations1,
        md5Code: utility.md5(currencyAbbreviations1.toLowerCase() + contractAddress1),
        currentLink: needParseUrl,
        contractAddress: contractAddress1,
        website: website1,
        communityLinks: [],
        chatLink: chatLink1,
        chartLink: [],
      };
    } catch (err) {
      console.log(`======${needParseUrl}抓取失败======`);
    }
  }
}

module.exports = CoindiscoveryController;
