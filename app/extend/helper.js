'use strict';
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
      .replace(/(\s|\.)/g, '-')
      .replace(',', '');
  },
};
