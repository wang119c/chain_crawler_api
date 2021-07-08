'use strict';
const Controller = require('../core/BaseController');
const cheerio = require('cheerio');
const utility = require('utility');
const async = require('async');

class RivalController extends Controller {
  async index() {
    const { ctx } = this;
    const { market } = ctx.service;
    const baseUrl = 'https://rival.finance';
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
      const tbodyNode = $('table tbody');
      const urls = [];
      tbodyNode.each((i, elem) => {
        const trNode = $(elem)
          .find('tr');
        trNode.each((i_tr, elem_tr) => {
          const url = $(elem_tr)
            .find('td')
            .eq(1)
            .find('a')
            .attr('href');
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

      const divNode = $('.flex.justify-center.flex-col>div>div')
        .eq(0);
      const currencyName1 = $(divNode)
        .find('h1')
        .text();

      $(divNode)
        .find('h2')
        .text()
        .match(/\[(.*)\]/);
      const currencyAbbreviations1 = RegExp.$1.trim();

      const contractAddress1 = $('input.cursor-pointer')
        .val();

      const aNode = $('.flex.justify-center.flex-col>div .text-black')
        .find('a');
      const urls = [];
      aNode.each((i, elem) => {
        const url = $(elem)
          .attr('href');
        if (url) {
          urls.push(url);
        }
      });
      const website1 = urls[urls.length - 1];
      const chatLink1 = urls.slice(0, urls.length - 1);

      const chartLink1 = $('.mt-4.flex.text-lg.justify-center.bg-rivals-gray-cont.rounded-2xl.shadow-md.p-3.relative')
        .find('.my-3:last')
        .find('a')
        .attr('href');

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

module.exports = RivalController;
