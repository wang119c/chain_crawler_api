'use strict';
const Controller = require('../core/BaseController');
const cheerio = require('cheerio');
const utility = require('utility');
const async = require('async');

class GemfinderController extends Controller {
  async index() {
    const { ctx } = this;
    const { market } = ctx.service;
    const baseUrl = 'https://gemfinder.cc';
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
      const ulNode = $('.table_view');
      const urls = [];
      ulNode.each((i, elem) => {
        const liNode = $(elem)
          .find('li');
        liNode.each((li_i, li_elem) => {
          const url = $(li_elem)
            .find('.singlecoinlink')
            .attr('data-href');
          if (url) {
            urls.push(url);
          }
        });
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

      const currencyName1 = $('.coin_intro h3.mb-0')
        .text();
      const currencyAbbreviations1 = $('.coin_intro p.mb-4')
        .text();

      const chatNode = $('.coin_intro .btn-group a');
      const chatLink1 = [];
      chatNode.each((i, elem) => {
        const chatUrl = $(elem)
          .attr('href');
        chatLink1.push(chatUrl);
      });

      const aNode = $('.coin_intro a');
      const urls = [];
      aNode.each((i, elem) => {
        const url = $(elem)
          .attr('href');
        urls.push(url);
      });
      const chartLink1 = urls.slice(chatLink1.length, urls.length - 1);
      const website1 = urls[urls.length - 1];
      const contractAddress1 = $('#binance_address')
        .text()
        .trim();

      return {
        currencyName: currencyName1,
        currencyAbbreviations: currencyAbbreviations1,
        md5Code: utility.md5(currencyAbbreviations1.toLowerCase() + contractAddress1),
        currentLink: needParseUrl,
        contractAddress: contractAddress1,
        website: website1,
        communityLinks: [],
        chatLink: chatLink1,
        chartLink: chartLink1,
      };
    } catch (err) {
      console.log(`======${needParseUrl}抓取失败======`);
    }
  }
}

module.exports = GemfinderController;
