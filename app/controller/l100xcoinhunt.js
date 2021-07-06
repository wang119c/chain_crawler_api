'use strict';
const Controller = require('../core/BaseController');
const cheerio = require('cheerio');
const utility = require('utility');
const async = require('async');

class L100xcoinhuntController extends Controller {
  async today() {
    const { ctx } = this;
    const { market } = ctx.service;
    const baseUrl = 'https://100xcoinhunt.com';

    try {
      const result = await ctx.curl(`${baseUrl}/today`, {
        method: 'get',
        headers: {
          'user-agent': this.getUserAgent(),
        },
        timeout: 1000 * 20,
      });
      const htmlData = result.data.toString();
      const $ = cheerio.load(htmlData);
      const trNode = $('.table-responsive')
        .find('tr');
      const hrefArr = [];
      trNode.each(async (i, elem) => {
        const href = $(elem)
          .find('td:last a')
          .attr('href');
        if (href && href.split('/')[2].trim() !== '') {
          const needParseUrl = `${baseUrl}${href}`;
          hrefArr.push(needParseUrl);
        }
      });
      async.mapLimit(hrefArr, hrefArr.length, async href => {
        const parseData = await this.parseDetail(href);
        if (parseData && parseData.currencyName) {
          market.add(parseData);
        }
      });
      // trNode.each(async (i, elem) => {
      //   const href = $(elem)
      //     .find('td')
      //     .eq(1)
      //     .find('a')
      //     .attr('href');
      //   if (href) {
      //     const needParseUrl = `${baseUrl}${href}`;
      //     const parseData = await this.parseDetail(needParseUrl);
      //     if (parseData) {
      //       market.add(parseData);
      //     }
      //     //   if (newParseData && newParseData.contractAddress !== '') {
      //     //     market.add(newParseData);
      //     //   }
      //   }
      // });
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

      const h3Text = $('.listing-header h3')
        .text();

      const currencyName1 = h3Text.trim()
        .split(' ')[0];
      const currencyAbbreviations1 = $('.listing-header h3 span')
        .text()
        .trim();
      const contractAddress1 = $('.contract span')
        .text()
        .trim();

      const trNode = $('.table')
        .find('tr');

      const splitIndexArr = [];
      trNode.each((index, item) => {
        const tdNode = $(item)
          .find('td');
        tdNode.length === 0 && splitIndexArr.push(index);
      });

      // 只需获取两部分
      const websiteChatlinks = trNode.slice(splitIndexArr[0], splitIndexArr[1]);
      const chartLinks = trNode.slice(splitIndexArr[1], splitIndexArr[2]);

      const website1 = [];
      const chatLink1 = [];

      websiteChatlinks.each((index, elem) => {
        const title = $(elem)
          .find('td')
          .eq(0)
          .text()
          .trim();
        const value = $(elem)
          .find('td')
          .eq(1)
          .find('a')
          .attr('href');
        if ([ 'Website' ].includes(title)) {
          website1.push(value);
        } else {
          if (value) {
            chatLink1.push(value);
          }
        }
      });

      const chartLinks1 = [];
      chartLinks.each((index, elem) => {
        const value = $(elem)
          .find('td')
          .eq(1)
          .find('a')
          .attr('href');
        if (value) {
          chartLinks1.push(value);
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
        chartLink: chartLinks1,
      };
    } catch (err) {
      console.log(`======${needParseUrl}抓取失败======`);
    }
  }
}

module.exports = L100xcoinhuntController;
