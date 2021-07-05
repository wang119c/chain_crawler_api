'use strict';
const Controller = require('../core/BaseController');
const cheerio = require('cheerio');
const utility = require('utility');

class LivecoinwatchController extends Controller {
  async trending() {
    const { ctx } = this;
    const { market } = ctx.service;
    const baseUrl = 'https://www.livecoinwatch.com';

    try {
      const result = await ctx.curl(`${baseUrl}/trending`, {
        method: 'get',
        headers: {
          'user-agent': this.getUserAgent(),
        },
        timeout: 1000 * 20,
      });
      const htmlData = result.data.toString();
      const $ = cheerio.load(htmlData);
      const trNode = $('.table-row');
      trNode.each(async (i, elem) => {
        const href = $(elem)
          .find('td')
          .eq(1)
          .find('a')
          .attr('href');
        if (href) {
          const needParseUrl = `${baseUrl}${href}`;
          const parseData = await this.parseDetail(needParseUrl);
          if (parseData) {
            market.add(parseData);
          }
          //   if (newParseData && newParseData.contractAddress !== '') {
          //     market.add(newParseData);
          //   }
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
    await this.sleep(500);
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
      const jsonStr = $('script#__NEXT_DATA__')
        .html();

      if (jsonStr === null) {
        return null;
      }
      const jsonData = JSON.parse(jsonStr.replace(/\n|\r/g, ''));
      const info = jsonData.props.initialState.coinInfo;

      const infoObj = Object.values(info)[0];
      const currencyName1 = infoObj.name;
      const currencyAbbreviations1 = infoObj.code;
      const contractAddress1 = infoObj.implementation.address;
      const links = infoObj.links;
      const linkKeys = Object.keys(links);
      const website1 = [];
      const communityLinks1 = [];
      const chatLink1 = [];
      linkKeys.forEach(item => {
        if ([ 'website' ].includes(item)) {
          website1.push(links[item]);
        } else if ([ 'twitter', 'facebook', 'telegram' ].includes(item)) {
          chatLink1.push(links[item]);
        } else if ([ 'reddit', 'discord' ].includes(item)) {
          communityLinks1.push(links[item]);
        }
      });
      return {
        currencyName: currencyName1,
        currencyAbbreviations: currencyAbbreviations1,
        md5Code: utility.md5(currencyAbbreviations1.toLowerCase() + contractAddress1),
        currentLink: needParseUrl,
        contractAddress: contractAddress1,
        website: website1,
        communityLinks: communityLinks1,
        chatLink: chatLink1,
        chartLink: [],
      };
    } catch (err) {
      console.log(`======${needParseUrl}抓取失败======`);
    }
  }
}

module.exports = LivecoinwatchController;
