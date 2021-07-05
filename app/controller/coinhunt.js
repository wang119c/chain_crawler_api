'use strict';
const Controller = require('../core/BaseController');
const cheerio = require('cheerio');
const utility = require('utility');

class CoinhuntController extends Controller {
  async index() {
    const { ctx } = this;
    const { market } = ctx.service;
    const baseUrl = 'https://coinhunt.cc';
    const apiUrl = 'https://api.cnhnt.cc';
    const result = await ctx.curl(`${apiUrl}/public/getTodaysCoinsApproved?orderChoose=votes&orderUp=false`, {
      method: 'get',
      headers: {
        'user-agent': this.getUserAgent(),
      },
      timeout: 1000 * 60,
      dataType: 'json',
    });
    if (result.data.code === 200 && result.data.status === 'Success') {
      const res = result.data.res;
      res.map(async item => {
        const needParseUrl = `${baseUrl}/_next/data/om7-hCpzP4zusm8QIQYt0/coin/${item.id}.json?id=${item.id}`;
        const currentLink = `${baseUrl}/coin/${item.id}`;
        const parseData = await this.parseDetail(needParseUrl, currentLink);
        if (parseData) {
          market.add(parseData);
        }
      });
    }
    ctx.body = {
      status: 200,
    };
  }

  async parseDetail(needParseUrl, currentLink1) {
    const { ctx } = this;
    try {
      const result = await ctx.curl(needParseUrl, {
        method: 'get',
        headers: {
          'user-agent': this.getUserAgent(),
        },
        timeout: 1000 * 30,
        dataType: 'json',
      });
      const coinData = result.data.pageProps.coinData;
      if (coinData) {
        const currencyName1 = coinData.name;
        const currencyAbbreviations1 = coinData.symbol;
        const contractAddress1 = coinData.contracts[0].value;
        let website1 = [];
        let chatLink1 = [];
        let chartLink1 = [];
        coinData.links.forEach(item => {
          if ([ 'Website' ].includes(item.name)) {
            website1 = [ ...website1, item.value ];
          } else if ([ 'Telegram', 'Twitter' ].includes(item.name)) {
            chatLink1 = [ ...chatLink1, item.value ];
          } else if ([ 'Chart' ].includes(item.name)) {
            chartLink1 = [ ...chartLink1, item.value ];
          }
        });
        return {
          currencyName: currencyName1,
          currencyAbbreviations: currencyAbbreviations1,
          md5Code: utility.md5(currencyAbbreviations1.toLowerCase() + contractAddress1),
          currentLink: currentLink1,
          contractAddress: contractAddress1,
          website: website1,
          communityLinks: [],
          chatLink: chatLink1,
          chartLink: chartLink1,
        };
      }
    } catch (err) {
      console.log(`======${needParseUrl}抓取失败======`);
    }
  }


}

module.exports = CoinhuntController;
