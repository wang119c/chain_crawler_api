'use strict';
const Controller = require('../core/BaseController');
const cheerio = require('cheerio');
const utility = require('utility');

class CoinmarketcapNewController extends Controller {
  async index() {
    const { ctx } = this;
    const { market } = ctx.service;
    const baseUrl = 'https://coinmarketcap.com';
    const result = await ctx.curl(`${baseUrl}/new/`, {
      method: 'get',
      headers: {
        'user-agent': this.getUserAgent(),
      },
    });
    const htmlData = result.data.toString();
    const $ = cheerio.load(htmlData);
    const trNode = $('.cmc-table tbody')
      .find('tr');
    trNode.each(async (i, elem) => {
      const currency_name = $(elem)
        .find('td')
        .eq(2)
        .find('.cmc-link>div>div>p')
        .text();

      const needParseUrl = `${baseUrl}/currencies/${ctx.helper.hump2Underline(currency_name)}/`;
      const parseData = await this.parseDetail(needParseUrl);
      if (parseData) {
        market.add(parseData);
      }
    });
    ctx.body = {
      status: 200,
    };
  }

  async parseDetail(needParseUrl) {
    const { ctx } = this;
    const result = await ctx.curl(needParseUrl, {
      method: 'get',
      headers: {
        'user-agent': this.getUserAgent(),
      },
      timeout: 1000 * 20,
    });

    const htmlData = result.data.toString();
    const $ = cheerio.load(htmlData);
    // 解析出来script 标签内的数据 ， 然后转换成json 格式
    const nextDataJsonStr = $('script#__NEXT_DATA__')
      .html();
    if (nextDataJsonStr === null) {
      return null;
    }
    const jsonData = JSON.parse(nextDataJsonStr.replace(/\n|\r/g, ''));
    const info = jsonData.props.initialProps.pageProps.info;
    const platforms = info.platforms ? info.platforms[0] : '';
    const contractAddress1 = platforms ? platforms.contractAddress : '';
    const md5Code1 = utility.md5(info.symbol.toLowerCase() + contractAddress1);
    return {
      currencyName: info.name || '',
      currencyAbbreviations: info.symbol || '',
      md5Code: md5Code1,
      currentLink: needParseUrl,
      contractAddress: contractAddress1,
      website: info.urls.website || '',
      communityLinks: [ ...info.urls.message_board, ...info.urls.announcement, ...info.urls.reddit ],
      chatLink: info.urls.chat || [],
      chartLink: '',
    };
  }


}

module.exports = CoinmarketcapNewController;
