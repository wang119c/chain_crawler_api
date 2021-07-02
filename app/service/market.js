'use strict';

const Service = require('../core/BaseMongooseService');


class MarketService extends Service {
  get document() {
    return this.ctx.model.Market;
  }

  async add(data) {
    const { Market } = this.ctx.model;
    const hasToken = await Market.findOne({
      md5Code: data.md5Code,
    });
    if (hasToken) {
      // todo 暂时什么也不做
      // console.log(hasToken);
    } else {
      return await Market.create(data);
    }
  }

  async listMarket(results, page) {
    const list = await this.pageList({}, Number(page), Number(results), [], { updated: -1 });
    return list;
  }

  async findAll() {
    const list = await this.find({}, [], { updated: -1 });
    return list;
  }

}


module.exports = MarketService;
