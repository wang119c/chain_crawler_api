'use strict';

const XLSX = require('xlsx');

module.exports = {
  // 短横线转驼峰
  underline2Hump(str) {
    const arr = str.split('-');
    for (let i = 0; i < arr.length; i++) {
      arr[i] = arr[i].slice(0, 1)
        .toUpperCase() + arr[i].slice(1);
    }
    return arr.join('');
  },
  // 驼峰转换为短横线
  hump2Underline(data) {
    return data
      .toLowerCase()
      .trim()
      .replace(/(\s|\.)/g, '-')
      .replace(',', '');
  },
  isChatLink(str) {
    if (
      str.indexOf('//t.me') !== -1 ||
      str.indexOf('//twitter.com') !== -1 ||
      str.indexOf('//www.instagram.com') !== -1 ||
      str.indexOf('//discord.com') !== -1
    ) {
      return true;
    }
    return false;
  },
  hump2Underline2(data) {
    if (data.indexOf('RealT Token') !== -1) {
      const arr = data.split('-');
      if (arr[1]) {
        const trimStr = arr[1].trim();
        const arr2 = trimStr.split(' ');
        return `${arr2[0]}-${arr2[1]}`.toLowerCase();
      }
    }
    return this.hump2Underline(data);
  },
  // 下载excel
  exportXLSX(fileName = 'file', sheetName = 'sheet1', header, data) {
    // 生成workbook
    const workbook = XLSX.utils.book_new();
    //  插入表头
    const headerData = [ header, ...data ];
    // 生成worksheet
    const worksheet = XLSX.utils.json_to_sheet(headerData, { skipHeader: true });
    // 组装
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    // 返回数据流
    this.ctx.set('Content-Type', 'application/vnd.openxmlformats');
    this.ctx.set(
      'Content-Disposition',
      'attachment;filename*=UTF-8\' \'' + encodeURIComponent(fileName) + '.xlsx'
    );
    this.ctx.body = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer',
    });
  },
};
