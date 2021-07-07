'use strict';
const Controller = require('../core/BaseController');
const cheerio = require('cheerio');
const utility = require('utility');
const async = require('async');

class FreshcoinsController extends Controller {
  async index() {
    const { ctx } = this;
    const { market } = ctx.service;
    const baseUrl = 'https://freshcoins.io';
    const num = ctx.query.num ? ctx.query.num : 20;
    const apiUrl = `http://us-central1-freshcoins-a51e3.cloudfunctions.net/api/getcoins/${num}`;
    try {
      const port = ctx.query.port ? ctx.query.port : 11000;
      const result = await ctx.curl(`${apiUrl}`, {
        method: 'get',
        headers: {
          'user-agent': this.getUserAgent(),
        },
        timeout: 1000 * 60,
        dataType: 'json',
        enableProxy: true,
        proxy: `http://127.0.0.1:${port}`,
      });
      for (const item of result.data) {
        const parseData = await this.parseDetail(item);
        if (parseData) {
          market.add(parseData);
        }
      }
    } catch (err) {
      // console.log(`====${baseUrl}/en/coins/recently_added?page=${i}===请求失败`);
    }
    ctx.body = {
      status: 200,
    };
  }

  async parseDetail(item) {
    try {
      const currencyName1 = item.name;
      const currencyAbbreviations1 = item.symbol;
      const needParseUrl1 =
        `https://freshcoins.io/${item.coinId}/coin/${this.ctx.helper.hump2Underline(item.name)}/${item.symbol.toLowerCase()}`;
      const addressSplitRes = item.bsc.split('/');
      const contractAddress1 = addressSplitRes[addressSplitRes.length - 1];
      const website1 = [ item.website ];
      const communityLinks1 = [ item.reddit ];
      const chatLink1 = [ item.telegram, item.twitter ];

      return {
        currencyName: currencyName1,
        currencyAbbreviations: currencyAbbreviations1,
        md5Code: utility.md5(currencyAbbreviations1.toLowerCase() + contractAddress1),
        currentLink: needParseUrl1,
        contractAddress: contractAddress1,
        website: website1,
        communityLinks: communityLinks1,
        chatLink: chatLink1,
        chartLink: [],
      };
    } catch (err) {
      console.log('======抓取失败======');
    }
  }
}

module.exports = FreshcoinsController;
