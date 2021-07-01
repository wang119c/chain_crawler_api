'use strict';

const Service = require('../core/BaseMongooseService');
const uuidv1 = require('uuid/v1');

class UserService extends Service {
  get document() {
    return this.ctx.model.User;
  }

  /**
   * 添加用户
   * @param user_name
   * @param age
   * @returns {Promise<void>}
   */

  async add(user_name, age) {
    const { User } = this.ctx.model;
    const userMap = new User();
    userMap.user_name = user_name;
    userMap.age = age;
    userMap.user_id = uuidv1();
    userMap.description = '用户';
    userMap.status = 0;
    userMap.save();
  }

}

module.exports = UserService;
