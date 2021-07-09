'use strict';
module.exports = app => {
  const { mongoose } = app;
  const Schema = mongoose.Schema;
  const DexSchema = new Schema({
    currencyName: { type: String, required: true },
    currencyAbbreviations: { type: String, required: true },
    md5Code: { type: String },
    currentLink: { type: String },
    website: { type: String },
    contractAddress: { type: String },
    holderNum: { type: String },
    updated: { type: Date, default: Date.now },
  });
  return mongoose.model('Dex', DexSchema, 'dex');
};
