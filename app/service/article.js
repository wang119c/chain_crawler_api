'use strict';
const Service = require('egg').Service;

class ArticleService extends Service {
  async getProjectById() {
    const { ctx } = this;
    try {
      const results = await ctx.model.Article.find({});
      return results;
    } catch (err) {
      ctx.body = JSON.stringify(err);
    }
  }
}
module.exports = ArticleService;
