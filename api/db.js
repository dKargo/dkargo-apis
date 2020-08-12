/**
 * @file db.js
 * @notice DB (mongoose) schema 정의 및 구동 파일
 * @author jhhong
 */
const mongoose = require('mongoose');
const Block = new mongoose.Schema({
  'index':      {type: Number, index: {unique: true}},
  'blockNumber': Number,
  }, {collection: 'Block'},);
const Work = new mongoose.Schema({
    'order':      {type: String, lowercase: true},
    'from':       {type: String, lowercase: true},
    'to':         {type: String, lowercase: true},
    'transportid': Number,
    'blocknumber': Number,
    'executed':    Boolean,
  }, {collection: 'Work'},);

mongoose.set('useCreateIndex', true); // warning 제거:DeprecationWarning: collection.ensureIndex is deprecated. ...
mongoose.set('useFindAndModify', false); // warning 제거:DeprecationWarning: Mongoose: `findOneAndUpdate()` and `findOneAndDelete()` ...
mongoose.model('Block', Block); // 스키마 등록 (Block)
mongoose.model('Work', Work); // 스키마 등록 (Work)
module.exports.Block = mongoose.model('Block'); // module.exports
module.exports.Work = mongoose.model('Work'); // module.exports
mongoose.Promise = global.Promise; // nodejs의 기본 프로미스 (global.Promise)를 사용

/**
 * @notice mongoose DB 접속 수행
 * @dev 차후 DB 접근권한도 설정해야 함
 * user: 'explorer', pass: 'yourdbpasscode'
 * mongoose.set('debug', true) 기능 확인 필요
 * @author jhhong
 */
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/dkargoDB', {
    useNewUrlParser: true, // warning 제거: DeprecationWarning: current URL string parser is deprecated
    useUnifiedTopology: true // warning 제거: DeprecationWarning: current Server Discovery and Monitoring engine is deprecated
});