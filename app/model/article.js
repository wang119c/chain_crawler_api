'use strict';

module.exports = app => {
  const { mongoose } = app;
  const Schema = mongoose.Schema;
  const ArticleSchema = new Schema({
    title: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
    },
  });
  return mongoose.model('Article', ArticleSchema, 'article');
};
