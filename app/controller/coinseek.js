'use strict';
const Controller = require('../core/BaseController');
const utility = require('utility');

class CoinseekController extends Controller {
  async index() {
    const { ctx } = this;
    const baseUrl = 'https://www.coinseek.xyz';
    const { market } = ctx.service;
    try {
      let data = [
        'Coins',
        { $and: [{ verified: { $eq: true } }] },
        [{ likesdata: 'desc' }],
        36, 36, null, null,
      ];
      data = JSON.stringify(data);
      const result = await ctx.curl(`${baseUrl}/_api/wix-code-public-dispatcher/siteview/wix/data-web.jsw/find.ajax?gridAppId=a1162efa-ef07-4086-8a98-7066abf274b7&instance=wixcode-pub.0e8249616ab6dd90a00f54a1b6330743aa69f257.eyJpbnN0YW5jZUlkIjoiYTczMGY3ZWEtYzUxYS00M2Y1LWE3OTgtOTRhNTNkMzUxYjJjIiwiaHRtbFNpdGVJZCI6ImE0NTcwM2EzLTA1NzgtNGE0OC1iZDk3LWUzYWY1MDlhOTY1MiIsInVpZCI6bnVsbCwicGVybWlzc2lvbnMiOm51bGwsImlzVGVtcGxhdGUiOmZhbHNlLCJzaWduRGF0ZSI6MTYyNTg0MDQwMzI4MywiYWlkIjoiNWY2NDcwOTQtYmI3MS00MTE3LWJlMjgtMThlZmM4NmY1NWU2IiwiYXBwRGVmSWQiOiJDbG91ZFNpdGVFeHRlbnNpb24iLCJpc0FkbWluIjpmYWxzZSwibWV0YVNpdGVJZCI6ImIwZTI4YzFiLWE1NTMtNGIxYy1iN2I1LWYwMzEyNWE4Yjg3MSIsImNhY2hlIjpudWxsLCJleHBpcmF0aW9uRGF0ZSI6bnVsbCwicHJlbWl1bUFzc2V0cyI6IkFkc0ZyZWUsU2hvd1dpeFdoaWxlTG9hZGluZyxIYXNEb21haW4iLCJ0ZW5hbnQiOm51bGwsInNpdGVPd25lcklkIjoiMzU1NWRiZWItOWMzMC00MGQ0LTlhNjYtMDk4YzRmMThjODIyIiwiaW5zdGFuY2VUeXBlIjoicHViIiwic2l0ZU1lbWJlcklkIjpudWxsfQ==&viewMode=site`, {
        method: 'POST',
        headers: {
          'user-agent': this.getUserAgent(),
          'Content-Type': 'application/json;charset=utf-8',
          'x-corvid-grid': 'corvid-kore-version-2',
          'x-powered-by': 'Express',
        },
        timeout: 1000 * 60,
        data,
        dataType: 'json',
      });
      const items = result.data.result.items;
      items.forEach(async item => {
        const parseData = await this.parseDetail(item);
        if (parseData && parseData.currencyName) {
          market.add(parseData);
        }
      });
    } catch (err) {
      // console.log(`====${baseUrl}/en/coins/recently_added?page=${i}===请求失败`);
    }
    ctx.body = {
      status: 200,
    };
  }

  async parseDetail(item) {
    try {
      const currencyName1 = item.name;
      const currencyAbbreviations1 = item.fullname;
      const needParseUrl1 =
        `https://www.coinseek.xyz/${item['link-coins-title']}`;
      const contractAddress1 = item.contract;
      const website1 = [ item.website ];
      const chatLink1 = [ item.twitter ? item.twitter : '', item.group ? item.group : '' ];
      const chartLink1 = [ item.chart ];

      return {
        currencyName: currencyName1,
        currencyAbbreviations: currencyAbbreviations1,
        md5Code: utility.md5(currencyAbbreviations1.toLowerCase() + contractAddress1),
        currentLink: needParseUrl1,
        contractAddress: contractAddress1,
        website: website1,
        communityLinks: [],
        chatLink: chatLink1,
        chartLink: chartLink1,
      };
    } catch (err) {
      console.log('======抓取失败======');
    }
  }
}

module.exports = CoinseekController;
