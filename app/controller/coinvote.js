'use strict';
const Controller = require('../core/BaseController');
const cheerio = require('cheerio');
const utility = require('utility');

class CoinvoteController extends Controller {
  async coins() {
    const { ctx } = this;
    const { market } = ctx.service;
    const baseUrl = 'https://coinvote.cc';
    let i = 1;
    while (i <= 3) {
      const result = await ctx.curl(`${baseUrl}/coins/${i}&order_by=today`, {
        method: 'get',
        headers: {
          'user-agent': this.getUserAgent(),
        },
        timeout: 1000 * 60,
      });
      const htmlData = result.data.toString();
      const $ = cheerio.load(htmlData);
      const divNode = $('.regular-table')
        .find('.coin-table.redirect-coin');
      divNode.each(async (i, ele) => {
        const dataHref = $(ele)
          .attr('data-href');
        const needParseUrl = `${baseUrl}/${dataHref}`;
        const parseData = await this.parseDetail(needParseUrl);
        if (parseData) {
          market.add(parseData);
        }
        // console.log('============', parseData);
      });
      i++;
    }
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

module.exports = CoinvoteController;
