'use strict';
const Controller = require('../core/BaseController');
const cheerio = require('cheerio');
const utility = require('utility');

class BscscanController extends Controller {
  async index() {
    const { ctx } = this;
    const { dex } = ctx.service;
    const baseUrl = 'https://bscscan.com';
    try {
      const tokens = await this.getTokens(baseUrl);
      const tokensStr = JSON.stringify(tokens);
      const tokensInfo = await this.getTokensInfo(baseUrl, tokensStr);
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

  async getTokens(baseUrl) {
    let data = {
      operationName: 'topTokens',
      query: `query topTokens($blacklist: [String!]) {
          tokens( first: 30
            where: {
              totalTransactions_gt: 100, 
              id_not_in: $blacklist
            }
          orderBy: tradeVolumeUSD
          orderDirection: desc
          ) {
            id __typename }
          }`,
      variables: {
        blacklist: [ '0x495c7f3a713870f68f8b418b355c085dfdc412c3', '0xc3761eb917cd790b30dad99f6cc5b4ff93c4f9ea', '0xe31debd7abff90b06bca21010dd860d8701fd901', '0xfc989fbb6b3024de5ca0144dc23c18a063942ac1', '0xe40fc6ff5f2895b44268fd2e1a421e07f567e007', '0xfd158609228b43aa380140b46fff3cdf9ad315de', '0xc00af6212fcf0e6fd3143e692ccd4191dc308bea', '0x205969b3ad459f7eba0dee07231a6357183d3fb6', '0x0bd67d358636fd7b0597724aa4f20beedbf3073a', '0xedf5d2a561e8a3cb5a846fbce24d2ccd88f50075', '0x702b0789a3d4dade1688a0c8b7d944e5ba80fc30', '0x041929a760d7049edaef0db246fa76ec975e90cc', '0xba098df8c6409669f5e6ec971ac02cd5982ac108', '0x1bbed115afe9e8d6e9255f18ef10d43ce6608d94', '0xe99512305bf42745fae78003428dcaf662afb35d', '0xbE609EAcbFca10F6E5504D39E3B113F808389056', '0x847daf9dfdc22d5c61c4a857ec8733ef5950e82e', '0xdbf8913dfe14536c0dae5dd06805afb2731f7e7b', '0xF1D50dB2C40b63D2c598e2A808d1871a40b1E653', '0x4269e4090ff9dfc99d8846eb0d42e67f01c3ac8b' ],
      },
    };
    data = JSON.stringify(data);

    try {
      const result = await this.ctx.curl(`${baseUrl}/subgraphs/name/pancakeswap/exchange-v2`, {
        method: 'post',
        headers: {
          'user-agent': this.getUserAgent(),
        },
        data,
        timeout: 1000 * 20,
        dataType: 'json',
      });

      const tokens = [];
      result.data.data.tokens.forEach(item => {
        tokens.push(item.id);
      });
      return tokens;
    } catch (err) {
      console.log(`======${err}=========`);
    }


  }

  async getTokensInfo(baseUrl, tokens) {
    let data = {
      operationName: 'tokens',
      query: `query tokens { tokens( where: {id_in: ${tokens} }  block: {number: 8944207}    orderBy: tradeVolumeUSD    orderDirection: desc  ) {    id    symbol    name    derivedBNB    derivedUSD    tradeVolumeUSD    tradeVolume    totalTransactions    totalLiquidity    __typename  }}`,
      variables: {},
    };
    data = JSON.stringify(data);
    try {
      const result = await this.ctx.curl(`${baseUrl}/subgraphs/name/pancakeswap/exchange-v2`, {
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
      const needParseUrl = `https://bscscan.com/token/${contractAddress1}`;
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
      const holderNum = $('#ContentPlaceHolder1_tr_tokenHolders .mr-3')
        .text()
        .split(' ')[0].trim();
      const website = $('#ContentPlaceHolder1_tr_officialsite_1 .col-md-8 a')
        .text();
      return {
        holderNum,
        website,
      };
    } catch (err) {
      console.log(`=====getTokenDetail抓取失败 ${err}=======`);
    }
  }

}

module.exports = BscscanController;
