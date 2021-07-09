'use strict';
const Controller = require('../core/BaseController');
const cheerio = require('cheerio');
const utility = require('utility');

class UniswapController extends Controller {
  async swap() {
    const { ctx } = this;
    const { dex } = ctx.service;
    const baseUrl = 'https://api.thegraph.com';
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
      operationName: 'topPools',
      query: 'query topPools { tokens(first: 50, orderBy: totalValueLockedUSD, orderDirection: desc) {   id    __typename } } ',
      variables: {},
    };
    data = JSON.stringify(data);

    try {
      const result = await this.ctx.curl(`${baseUrl}/subgraphs/name/uniswap/uniswap-v3`, {
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
      query: `query tokens { tokens( where: {id_in: ${tokens} } orderBy: totalValueLockedUSD    orderDirection: desc  ) {    id    symbol    name    derivedETH    volumeUSD    volume    txCount    totalValueLocked    feesUSD    totalValueLockedUSD    __typename  }}`,
      variables: {},
    };
    data = JSON.stringify(data);
    try {
      const result = await this.ctx.curl(`${baseUrl}/subgraphs/name/uniswap/uniswap-v3`, {
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
      const needParseUrl = `https://cn.etherscan.com/token/${contractAddress1}`;
      const { holderNum, website } = await this.getTokenDetail(needParseUrl);
      return {
        currencyName: currencyName1,
        currencyAbbreviations: currencyAbbreviations1,
        md5Code: utility.md5(currencyAbbreviations1.toLowerCase() + contractAddress1),
        website,
        currentLink: needParseUrl,
        contractAddress: contractAddress1,
        holderNum,
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

module.exports = UniswapController;
