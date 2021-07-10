'use strict';
const Controller = require('../core/BaseController');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const utility = require('utility');
const path = require('path');

class CoinalphaController extends Controller {
  async index() {
    const { ctx } = this;
    const { market } = ctx.service;
    const baseUrl = 'https://coinalpha.app';
    try {
      const browser = await puppeteer.launch({
        headless: true,
        executablePath: path.resolve('/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome'),
      });
      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(0);
      await page.goto(`${baseUrl}`);
      await page.waitForSelector('.table.coinlistMain');
      const bodyHandle = await page.$('body');
      const html = await page.evaluate(body => body.innerHTML, bodyHandle);
      const $ = cheerio.load(html);
      const trNode = $('.table.coinlistMain')
        .find('tr');
      await bodyHandle.dispose();

      trNode.each(async (i, elem) => {
        const val = $(elem)
          .find('input.urlTargetChange')
          .val();
        const needParseUrl = `${baseUrl}/${val}`;
        const parseData = await this.parseDetail(needParseUrl);
        if (parseData && parseData.currencyName) {
          market.add(parseData);
        }
      });
      await browser.close();
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
      const liNode = $('.coin-social li');

      const urls = [];
      liNode.each((i, elem) => {
        const link = $(elem)
          .find('a')
          .attr('href');
        urls.push(link);
      });
      const website1 = [ urls[0] ];
      const chatLink1 = [ urls.slice(1, urls.length - 1) ];
      const chartLink1 = [ $('.post-info')
        .find('a')
        .eq(0)
        .attr('href') ];
      const h1Text = $('.coinTitleDiv h1')
        .text();
      const currencyName1 = h1Text.split('$')[0].trim();
      const currencyAbbreviations1 = h1Text.split('$')[1].trim();
      const contractAddress1 = $('h2.contractAddress')
        .text();

      return {
        currencyName: currencyName1,
        currencyAbbreviations: currencyAbbreviations1,
        md5Code: utility.md5(currencyAbbreviations1.toLowerCase() + contractAddress1),
        currentLink: needParseUrl,
        contractAddress: contractAddress1,
        website: website1,
        communityLinks: [],
        chatLink: chatLink1,
        chartLink: chartLink1,
      };
    } catch (err) {
      console.log(`======${needParseUrl}抓取失败======`);
    }
  }
}

module.exports = CoinalphaController;
