'use strict';
const Controller = require('../core/BaseController');

class MarketController extends Controller {
  async index() {
    const { market } = this.ctx.service;
    const { results, page } = this.ctx.request.query;
    await this.returnService(market.listMarket(results, page));
  }

  pick(item, keys) {
    const o = {};
    // eslint-disable-next-line array-callback-return
    keys.map(key => {
      o[key] = item[key];
    });
    return o;
  }

  async download() {
    const { ctx } = this;
    // const query = ctx.queries;
    const { market } = ctx.service;
    // const results = 100;
    // const page = 1;

    const result = await market.findAll();
    const headerMap = {
      currencyName: '币种全称',
      currencyAbbreviations: '币种简称',
      currentLink: '币种在该网站对应主页链接',
      contractAddress: '合约地址',
      website: '项目官方网站',
      communityLinks: '社区链接',
      chatLink: '通讯链接',
      chartLink: '图表链接',
    };
    const data = result.map(i => {
      const item = this.pick(i, Object.keys(headerMap));
      return {
        ...item,
        website: item.website.join('||'),
        communityLinks: item.communityLinks.join('||'),
        chatLink: item.chatLink.join('||'),
        chartLink: item.chartLink.join('||'),
      };
    });
    await ctx.helper.exportXLSX('行情网站', 'sheet1', headerMap, data);
  }

}

module.exports = MarketController;
