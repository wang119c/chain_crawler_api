'use strict';
const Controller = require('../core/BaseController');
const cheerio = require('cheerio');
const utility = require('utility');

class CoinsniperCoinvoteController extends Controller {
  async index() {
    const { ctx } = this;
    const { market } = ctx.service;
    const baseUrl = 'https://coinsniper.net';
    const i = 1;
    // while (i <= 3) {
    // https://coinsniper.net/?page=2

    const result = await ctx.curl(`${baseUrl}/?page=${i}`, {
      method: 'get',
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7',
        'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
        'sec-ch-ua-mobile': '?0',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
      },
      timeout: 1000 * 60,
    });
    const htmlData = result.data.toString();
    const $ = cheerio.load(htmlData);
    console.log('=========', $.html());


    const trNode = $('.table tbody')
      .find('tr');

    // divNode.each(async (i, ele) => {
    //   const dataHref = $(ele)
    //     .attr('data-href');
    //   const needParseUrl = `${baseUrl}/${dataHref}`;


    // const parseData = await this.parseDetail(needParseUrl);
    // if (parseData) {
    //   market.add(parseData);
    // }
    // console.log('============', parseData);
    // });
    // i++;
    // }
    ctx.body = {
      status: 200,
    };
  }

  async parseDetail(needParseUrl) {
    const { ctx } = this;
    const result = await ctx.curl(needParseUrl, {
      method: 'get',
      headers: {
        'user-agent': this.getUserAgent(),
      },
      timeout: 1000 * 60,
    });

    const htmlData = result.data.toString();
    const $ = cheerio.load(htmlData);

    // currencyName , currencyAs
    const currentcy = $('.coin-row>h2')
      .text()
      .trim()
      .split(' ');
    const currencyName1 = currentcy[0];
    const currencyAs1 = $('.coin-row>h2>b')
      .text()
      .trim();

    // contractAddress
    const contractAddress1 = $('.coin-bsc a:first')
      .text();

    // website , communityLinks , chatLink
    const coinPageColumnNode = $('.coin-column .coin-page-column a');

    const website1 = [];
    const communityLinks1 = [];
    const chatLink1 = [];

    coinPageColumnNode.each((i, elem) => {
      const href = $(elem)
        .attr('href');
      if (i === 0) {
        website1.push(href);
      } else if (this.ctx.helper.isChatLink(href)) {
        chatLink1.push(href);
      } else {
        communityLinks1.push(href);
      }
    });

    const md5Code1 = utility.md5(currencyAs1.toLowerCase() + contractAddress1);
    return {
      currencyName: currencyName1,
      currencyAbbreviations: currencyAs1,
      md5Code: md5Code1,
      currentLink: needParseUrl,
      contractAddress: contractAddress1,
      website: website1,
      communityLinks: communityLinks1,
      chatLink: chatLink1,
      chartLink: '',
    };
  }

}

module.exports = CoinsniperCoinvoteController;
