/**
 * @file db.js
 * @notice DB (mongoose) schema 정의 및 구동 파일
 * @author jhhong
 */
const mongoose = require('mongoose');
/**
 * @notice Block Schema, Logistics chain 블록 정보, api server가 갱신
 * @author jhhong
 */
const ApiBlock = new mongoose.Schema({
  'nettype':    {type: String, index: {unique: true}}, // 체인타입: logistics / token
  'blockNumber': Number, // 블록넘버
  }, {collection: 'ApiLogisticsBlock'},);
/**
 * @notice Work Schema, 물류사가 수행해야 할 주문 구간 정보, api server가 갱신
 * @author jhhong
 */
const ApiWork = new mongoose.Schema({
  'order':      {type: String, lowercase: true}, // 주문 컨트랙트 주소
  'from':       {type: String, lowercase: true}, // 이전 구간 배송을 완료한 물류사 주소
  'to':         {type: String, lowercase: true}, // 이번 구간 배송을 수행해야 할 물류사 주소
  'transportid': Number, // 운송번호
  'blocknumber': Number, // 블록넘버
  'executed':    Boolean, // 배송 수행여부
  }, {collection: 'ApiWork'},);

/**
 * @notice Account Schema, 계정 정보
 * @author jhhong
 */
const ApiAccount = new mongoose.Schema({
  'account':  {type: String, index: {unique: true}, lowercase: true}, // 계정주소, 유일값
  'passwd':    String, // 계정 비밀번호
  'cmdName':   String, // 가장 최근에 처리된 혹은 처리중인 COMMAND 이름
  'status':    String, // 현재 상태 (IDLE: 대기 / PROCEEDING: 처리중)
}, {collection: 'ApiAccount'},);

mongoose.set('useCreateIndex', true); // warning 제거:DeprecationWarning: collection.ensureIndex is deprecated. ...
mongoose.set('useFindAndModify', false); // warning 제거:DeprecationWarning: Mongoose: `findOneAndUpdate()` and `findOneAndDelete()` ...
mongoose.model('ApiBlock', ApiBlock); // 스키마 등록 (ApiLogisticsBlock)
mongoose.model('ApiWork', ApiWork); // 스키마 등록 (ApiWork)
mongoose.model('ApiAccount', ApiAccount); // 스키마 등록 (ApiAccount)
module.exports.ApiBlock   = mongoose.model('ApiBlock'); // module.exports
module.exports.ApiWork    = mongoose.model('ApiWork'); // module.exports
module.exports.ApiAccount = mongoose.model('ApiAccount'); // module.exports
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