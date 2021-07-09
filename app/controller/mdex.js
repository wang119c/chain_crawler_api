'use strict';
const Controller = require('../core/BaseController');
const cheerio = require('cheerio');
const utility = require('utility');

class MdexController extends Controller {
  async swap() {
    const { ctx } = this;
    const { dex } = ctx.service;
    const baseUrl = 'https://graph.mdex.network';
    try {
      const tokensInfo = await this.getTokensInfo(baseUrl);
      for (const item of tokensInfo) {
        const parseData = await this.parseDetail(item);
        if (parseData && parseData.currencyName) {
          dex.add(parseData);
        }
      }
    } catch (err) {
      console.log(`==========swap${err}========`);
    }
    ctx.body = {
      status: 200,
    };
  }

  async getTokensInfo(baseUrl) {
    let data = {
      operationName: 'tokens',
      query: 'fragment TokenFields on Token {  id  name  symbol  derivedETH  tradeVolume  tradeVolumeUSD  untrackedVolumeUSD  totalLiquidity  txCount  __typename} query tokens {  tokens(first: 200, orderBy: tradeVolumeUSD, orderDirection: desc) {    ...TokenFields    __typename  }}',
      variables: {},
    };
    data = JSON.stringify(data);
    try {
      const result = await this.ctx.curl(`${baseUrl}/subgraphs/name/mdex/swap`, {
        method: 'POST',
        headers: {
          'user-agent': this.getUserAgent(),
        },
        data,
        timeout: 1000 * 20,
        dataType: 'json',
      });
      return result.data.data.tokens;
    } catch (err) {
      console.log(`======getTokensInfo${err}=======`);
    }
  }


  async parseDetail(item) {
    try {
      const currencyName1 = item.name;
      const currencyAbbreviations1 = item.symbol;
      const contractAddress1 = item.id;
      const needParseUrl = `https://hecoinfo.com/token/${contractAddress1}`;
      const { holderNum, website } = await this.getTokenDetail(needParseUrl);
      const holderNum1 = holderNum;
      const website1 = website;

      return {
        currencyName: currencyName1,
        currencyAbbreviations: currencyAbbreviations1,
        md5Code: utility.md5(currencyAbbreviations1.toLowerCase() + contractAddress1),
        website: website1,
        currentLink: needParseUrl,
        contractAddress: contractAddress1,
        holderNum: holderNum1,
      };
    } catch (err) {
      console.log('======parseDetail解析失败======');
    }
  }


  async getTokenDetail(needParseUrl) {
    try {
      const result = await this.ctx.curl(`${needParseUrl}`, {
        method: 'get',
        headers: {
          'user-agent': this.getUserAgent(),
        },
        timeout: 1000 * 60,
      });
      const htmlData = result.data.toString();
      const $ = cheerio.load(htmlData);
      const holderNum = $('#ContentPlaceHolder1_tr_tokenHolders .col-md-8')
        .text()
        .split(' ')[0].trim();
      const website = $('#ContentPlaceHolder1_tr_officialsite_1 .col-md-8 a')
        .attr('href');
      return {
        holderNum,
        website,
      };
    } catch (err) {
      console.log(`=====getTokenDetail抓取失败 ${err}=======`);
    }
  }

}

module.exports = MdexController;
