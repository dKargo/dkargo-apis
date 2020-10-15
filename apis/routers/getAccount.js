/**
 * @file getAccount.js
 * @notice 계정 GET API 처리함수 정의
 * @author jhhong
 */

//// DBs
require('../db.js'); // for mongoose schema import
const mongoose = require('mongoose');
const Account  = mongoose.model('ApiAccount'); // Account Schema
//// LOGs
const Log = require('../../libs/libLog.js').Log; // 로그 출력
//// LOG COLOR (console)
const RED = require('../../libs/libLog.js').consoleRed; // 콘솔 컬러 출력: RED

/**
 * @notice 계정의 상태정보를 획득한다.
 * @param {String} addr 계정 주소
 * @return "idle": 명령대기 상태 / "proceeding": 명령 처리중인 상태 / "unlisted": 등록되지 않은 계정 / "error": 에러
 * @author jhhong
 */
module.exports.getAccountStatus = async function(addr) {
    try {
        let exists = await Account.countDocuments({account: addr});
        if (exists > 1) {
            throw new Error(`DB Error! Account Duplicated! ADDR:[${addr}], COUNT:[${exists}]`);
        }
        if (exists == 0) {
            return 'unlisted';
        }
        let account = await Account.findOne({account: addr});
        return account.status;
    } catch(error) {
        let action = `Action: getAccountStatus`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return 'error';
    }
}