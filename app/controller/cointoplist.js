'use strict';
const Controller = require('../core/BaseController');
const cheerio = require('cheerio');
const utility = require('utility');
const async = require('async');

class CointoplistController extends Controller {
  async index() {
    const { ctx } = this;
    const { market } = ctx.service;
    const baseUrl = 'https://cointoplist.net';
    try {
      const hrefArr1 = await this.getUrls(baseUrl, baseUrl);
      const hrefArr2 = [];
      // const hrefArr2 = await this.getUrls(baseUrl, `${baseUrl}/frontend/load_allt_time_best`);
      const allHrefArr = [ ...hrefArr1, ...hrefArr2 ];
      async.mapLimit(allHrefArr, allHrefArr.length, async href => {
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

  async getUrls(baseUrl, url) {
    const { ctx } = this;
    const result = await ctx.curl(`${url}`, {
      method: 'get',
      headers: {
        'user-agent': this.getUserAgent(),
      },
      timeout: 1000 * 120,
    });

    const htmlData = result.data.toString();
    const $ = cheerio.load(htmlData);
    const trNode = $('.clickable-row');
    const hrefArr = [];
    trNode.each(async (i, elem) => {
      const slug = $(elem)
        .attr('data-slug');
      if (slug && slug.trim() !== '') {
        const needParseUrl = `${baseUrl}/coin/${slug}`;
        hrefArr.push(needParseUrl);
      }
    });
    return hrefArr;
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

      const currencyName1 = $('.fw-bold.mb-3')
        .text();
      const currencyAbbreviations1 = $('.my-1 span')
        .eq(0)
        .text();
      const contractAddress1 = $('#bsc_addr')
        .text();

      const aNode = $('.d-grid.gap-2.d-md-flex.justify-content-md-start.mt-4')
        .find('a');

      const website1 = [];
      const chatLink1 = [];
      aNode.each((index, elem) => {
        if (index === 0) {
          website1.push($(elem)
            .attr('href'));
        } else {
          chatLink1.push($(elem)
            .attr('href'));
        }
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

module.exports = CointoplistController;
