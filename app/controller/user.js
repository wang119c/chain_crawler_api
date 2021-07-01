'use strict';
const Controller = require('../core/BaseController');

class UserController extends Controller {
  async add() {
    const { user } = this.ctx.service;
    const { user_name, age } = this.ctx.request.body;
    await this.returnService(user.add(user_name, age));
  }
}

module.exports = UserController;
