'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/market/lists', controller.market.index);
  router.get('/market/download', controller.market.download);
  router.get('/coinmarketcap/new', controller.coinmarketcapNew.index);
  router.get('/coinmarketcap/gl', controller.coinmarketcapGl.index);
  router.get('/coingecko/recently', controller.coingeckoRecently.index);
  router.get('/coinvote/coins', controller.coinvote.coins);
  // router.get('/article', controller.article.index);
  // router.post('/user/add', controller.user.add);
  router.get('/', controller.home.index);
};
