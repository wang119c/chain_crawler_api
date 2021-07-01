'use strict';

module.exports = app => {
  const { mongoose } = app;
  const Schema = mongoose.Schema;
  const UserSchema = new Schema({
    user_id: { type: String, unique: true },
    user_name: { type: String },
    age: { type: Number },
    description: { type: String },
    status: { type: Number },
  });
  return mongoose.model('User', UserSchema, 'user');
};
