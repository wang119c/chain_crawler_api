'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/coinmarketcap/new', controller.coinmarketcapNew.index);
  router.get('/coinmarketcap/gl', controller.coinmarketcapGl.index);
  // router.get('/article', controller.article.index);
  // router.post('/user/add', controller.user.add);
};
