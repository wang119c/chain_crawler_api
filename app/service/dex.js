'use strict';

const Service = require('../core/BaseMongooseService');

class DexService extends Service {
  get document() {
    return this.ctx.model.Dex;
  }

  async add(data) {
    const { Dex } = this.ctx.model;
    const hasToken = await Dex.findOne({
      md5Code: data.md5Code,
    });
    if (hasToken) {
      // todo 修改持币数量
      return await Dex.update({
        md5Code: data.md5Code,
      }, data);
    }
    return await Dex.create(data);

  }

  async listDex(results, page) {
    const list = await this.pageList({}, Number(page), Number(results), [], { updated: -1 });
    return list;
  }

  async findAll() {
    const list = await this.find({}, [], { updated: -1 });
    return list;
  }


}

module.exports = DexService;
