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
  router.get('/coinvote/coins', controller.coinvote.coins); // 待开发
  router.get('/coinsniper', controller.coinsniper.index); // 待开发
  router.get('/coinhunt', controller.coinhunt.index);
  router.get('/livecoinwatch/trending', controller.livecoinwatch.trending);
  router.get('/l100xcoinhunt/today', controller.l100xcoinhunt.today);
  router.get('/cointoplist', controller.cointoplist.index);
  router.get('/freshcoins', controller.freshcoins.index);
  router.get('/cryptotokenspace/tokens', controller.cryptotokenspace.tokens);
  router.get('/coinseek', controller.coinseek.index);
  router.get('/gemfinder', controller.gemfinder.index);
  router.get('/coindiscovery', controller.coindiscovery.index);
  router.get('/rival', controller.rival.index);


  // dex
  router.get('/dex/lists', controller.dex.index);
  router.get('/dex/download', controller.dex.download);
  router.get('/pancakeswap/swap', controller.pancakeswap.swap);
  router.get('/uniswap/swap', controller.uniswap.swap);
  router.get('/mdex/swap', controller.mdex.swap);

  // broswer
  router.get('/bscscan', controller.bscscan.index);
  // router.get('/etherscan', controller.etherscan.index);
  // router.get('/tronscan', controller.tronscan.index);

  // router.get('/article', controller.article.index);
  // router.post('/user/add', controller.user.add);
  router.get('/', controller.home.index);
};
