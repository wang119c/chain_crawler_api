'use strict';
const Controller = require('../core/BaseController');

class DexController extends Controller {
  async index() {
    const { dex } = this.ctx.service;
    const { results, page } = this.ctx.request.query;
    await this.returnService(dex.listDex(results, page));
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
    const { dex } = ctx.service;
    // const results = 100;
    // const page = 1;

    const result = await dex.findAll();
    const headerMap = {
      currencyName: '币种全称',
      currencyAbbreviations: '币种简称',
      currentLink: '浏览器地址',
      contractAddress: '合约地址',
      website: '项目官方网站',
      holderNum: '持币数量',
    };
    const data = result.map(i => {
      const item = this.pick(i, Object.keys(headerMap));
      return {
        ...item,
      };
    });
    await ctx.helper.exportXLSX('dex-swap', 'sheet1', headerMap, data);
  }

}

module.exports = DexController;
