'use strict';
const Service = require('egg').Service;

class BaseMongooseService extends Service {
  get document() {
    throw Error('BaseMongooseService need override property <document>\'s get method!');
  }

  /**
   * 分页返回数据
   * @param {Object} option 查询参数
   * @param {String} next 下一条数据的id
   * @param {Number} limit 一页包含多少数据
   * @param {Array} includs 返回数据包含字段数组，为空返回全部字段
   */
  async page(option, next, limit, includs, sort) {
    limit = limit || 50;
    const findLimit = limit + 1;
    const projection = {};
    if (includs && includs instanceof Array) {
      includs.forEach(item => {
        projection[item] = 1;
      });
    }
    if (next) {
      option._id = { $lte: next };
    }

    // const sortPrama ={ _id : -1 } ;
    const sortPrama = (sort ? sort : { _id: -1 });
    const data = await this.document
      .find(option, projection)
      .sort(sortPrama)
      .limit(findLimit);

    if (data.length === findLimit) {
      return { next: data.pop()._id, data, total: data.length };
    }
    return { data, total: data.length };
  }

  /**
   * 分页返回数据
   * @param {Object} option 查询参数
   * @param {number} next 下一条数据的id
   * @param {Number} limit 一页包含多少数据
   * @param {Object} sort 排序
   * @param {Array} includs 返回数据包含字段数组，为空返回全部字段
   */
  async pageList(option, next, limit, includs, sort) {
    limit = limit || 50;
    next = parseInt(next) || 1;
    const projection = {};
    if (includs && includs instanceof Array) {
      includs.forEach(item => {
        projection[item] = 1;
      });
    }

    if (!sort) {
      throw Error('sort is not find ');
    }
    const data = await this.document
      .find(option, projection)
      .skip((next - 1) * limit)
      .sort(sort)
      .limit(limit);
    return { next: (next + 1), data, total: await this.document.count() };
  }

  /**
   * 查询
   * @param {Object} option 查询参数
   * @param {Array} includs 返回数据包含字段数组，为空返回全部字段
   * @return {Array} 查询结果
   */
  async find(option, includs, sort) {
    const projection = {};
    if (includs && includs instanceof Array) {
      includs.forEach(item => {
        projection[item] = 1;
      });
    }
    return await this.document.find(option, projection)
      .sort(sort);
  }

  async findById(_id, includs) {
    return await this.document.findOne({ _id }, includs);
  }

  async findOne(option, includs) {
    const projection = {};
    if (includs && includs instanceof Array) {
      includs.forEach(item => {
        projection[item] = 1;
      });
    }
    return await this.document.findOne(option, projection)
      .orFail();
  }

  async create(detail) {
    // const Document = this.document;
    const now = new Date().getTime();
    const _create = {
      create_stamp: now,
      update_stamp: now,
    };
    return await new this.document(Object.assign(_create, detail)).save();
  }

  async update(option, detail) {
    const now = new Date().getTime();
    const _update = {
      update_stamp: now,
    };
    await this.document.updateOne(option, Object.assign(_update, detail))
      .orFail();
  }

  async updateById(_id, detail) {
    return await this.update({ _id }, detail);
  }

}

module.exports = BaseMongooseService;
