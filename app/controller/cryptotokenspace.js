'use strict';
const Controller = require('../core/BaseController');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const utility = require('utility');
const async = require('async');
const path = require('path');

class CryptotokenspaceController extends Controller {


  async tokens() {
    const { ctx } = this;
    const { market } = ctx.service;
    const baseUrl = 'https://cryptotokenspace.com';

    try {
      const browser = await puppeteer.launch({
        headless: true,
        executablePath: path.resolve('/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome'),
      });
      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(0);
      await page.goto(`${baseUrl}/Tokens?pageNumber=1`);
      const bodyHandle = await page.$('body');
      const html = await page.evaluate(body => body.innerHTML, bodyHandle);
      const $ = cheerio.load(html);
      const trNode = $('#tokensTable tbody')
        .find('tr');
      await bodyHandle.dispose();

      trNode.each(async (i, elem) => {
        const hrefStr = $(elem)
          .attr('onclick')
          .split('?')[1];
        const href = `${baseUrl}/Tokens/Token?` + hrefStr.substring(0, hrefStr.length - 2);
        const parseData = await this.parseDetail(href);
        if (parseData && parseData.currencyName) {
          market.add(parseData);
        }
      });
      await browser.close();
      return;
    } catch (err) {
      // console.log(`====${baseUrl}/en/coins/recently_added?page=${i}===请求失败`);
    }
    ctx.body = {
      status: 200,
    };
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async parseDetail(needParseUrl) {
    const { ctx } = this;
    try {
      const result = await ctx.curl(needParseUrl, {
        method: 'get',
        headers: {
          'user-agent': this.getUserAgent(),
        },
        timeout: 1000 * 30,
      });
      const htmlData = result.data.toString();
      const $ = cheerio.load(htmlData);

      const h2Text = $('.col-sm-12.text-center')
        .find('h2')
        .text();
      const h2Arr = h2Text.split('(');
      const currencyName1 = h2Arr[0].trim();
      h2Text.match(/\((.*)\)/);
      const currencyAbbreviations1 = RegExp.$1;
      const contractAddress1 = $('.col-sm-6.offset-sm-3.mt-4 > input')
        .val();

      const website1 = $('.d-block.mt-4')
        .eq(0)
        .find('a')
        .eq(0)
        .attr('href');

      const aNode = $('.d-block.mt-4')
        .eq(1)
        .find('a');
      const chatLink1 = [];
      aNode.each((i, elem) => {
        chatLink1.push($(elem)
          .attr('href'));
      });

      return {
        currencyName: currencyName1,
        currencyAbbreviations: currencyAbbreviations1,
        md5Code: utility.md5(currencyAbbreviations1.toLowerCase() + contractAddress1),
        currentLink: needParseUrl,
        contractAddress: contractAddress1,
        website: website1,
        communityLinks: [],
        chatLink: chatLink1,
        chartLink: [],
      };
    } catch (err) {
      console.log(`======${needParseUrl}抓取失败======`);
    }
  }
}

module.exports = CryptotokenspaceController;
