'use strict';
const Controller = require('../core/BaseController');
const cheerio = require('cheerio');
const utility = require('utility');

class CoingeckoRecentlyController extends Controller {
  async index() {
    const { ctx } = this;
    const { market } = ctx.service;
    const baseUrl = 'https://www.coingecko.com';


    let i = 1;
    while (i <= 3) {
      try {
        // console.log(`====${baseUrl}/en/coins/recently_added?page=${i}====`);
        const result = await ctx.curl(`${baseUrl}/en/coins/recently_added?page=${i}`, {
          method: 'get',
          headers: {
            'user-agent': this.getUserAgent(),
          },
          timeout: 1000 * 20,
        });
        const htmlData = result.data.toString();
        const $ = cheerio.load(htmlData);
        const trNode = $('.coin-table tbody')
          .find('tr');
        trNode.each(async (i, elem) => {
          const currency_name = $(elem)
            .find('td')
            .eq(2)
            .find('.tw-flex>div.center>a:first')
            .text();

          const currency_as = $(elem)
            .find('td')
            .eq(2)
            .find('.tw-flex>div.center>span')
            .text();
          const href = $(elem)
            .find('td')
            .eq(2)
            .find('.tw-flex>div.center>a:first')
            .attr('href');
          const needParseUrl = `${baseUrl}${href}`;
          const parseData = await this.parseDetail(needParseUrl);
          const newParseData = Object.assign({}, parseData, {
            currencyName: currency_name.trim(),
            currencyAbbreviations: currency_as.trim(),
            md5Code: utility.md5(currency_as.toLowerCase() + parseData.contractAddress),
          });
          if (newParseData && newParseData.contractAddress !== '') {
            market.add(newParseData);
          }
        });
      } catch (err) {
        console.log(`====${baseUrl}/en/coins/recently_added?page=${i}===请求失败`);
      }
      i++;
    }
    ctx.body = {
      status: 200,
    };
  }

  sleep(ms) {
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
      const divListNode = $('.tw-flex>.coin-link-row');
      // divListNode 可能的数量为5，6，7
      // website
      const website1 = [];
      const websiteNode = divListNode.length === 7 ? $(divListNode[1]) : $(divListNode[0])
        .find('.tw-flex>a');
      if (websiteNode.length > 0) {
        // eslint-disable-next-line array-callback-return
        websiteNode.map((index, item) => {
          website1.push($(item)
            .attr('href'));
        });
      }

      // contractAddress
      let contractAddress1 = '';
      const contractAddressNode = divListNode.length === 7 ? $(divListNode[3]) : $(divListNode[2])
        .find('.tw-flex i');

      if (contractAddressNode.length > 0) {
        contractAddress1 = $(contractAddressNode)
          .attr('data-address');
      }

      // communityLinks
      const communityLinks1 = [];
      const communityLinksNode = divListNode.length === 7 ? $(divListNode[4]) : $(divListNode[3])
        .find('.tw-flex a');
      if (communityLinksNode.length > 0) {
        // eslint-disable-next-line array-callback-return
        communityLinksNode.map((index, item) => {
          communityLinks1.push($(item)
            .attr('href'));
        });
      }

      return {
        currencyName: '',
        currencyAbbreviations: '',
        md5Code: '',
        currentLink: needParseUrl,
        contractAddress: contractAddress1,
        website: website1,
        communityLinks: communityLinks1,
        chatLink: [],
        chartLink: '',
      };
    } catch (err) {
      console.log(`======${needParseUrl}抓取失败======`);
    }
  }
}

module.exports = CoingeckoRecentlyController;
