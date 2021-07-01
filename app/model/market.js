'use strict';
module.exports = app => {
  const { mongoose } = app;
  const Schema = mongoose.Schema;
  const MarketSchema = new Schema({
    currencyName: { type: String, required: true },
    currencyAbbreviations: { type: String, required: true },
    md5Code: { type: String },
    currentLink: { type: String },
    contractAddress: { type: String },
    website: { type: Array },
    communityLinks: { type: Array },
    chatLink: { type: Array },
    chartLink: { type: Array },
    updated: { type: Date, default: Date.now },
  });
  return mongoose.model('Market', MarketSchema, 'market');
};
