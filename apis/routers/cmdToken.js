/**
 * @file cmdToken.js
 * @notice 토큰 CMD API 처리함수 정의
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
//// LIBs (libApiToken)
const ApiToken = require('../libs/libApiToken.js'); // 토큰 API
//// LIBs (libApiCommon)
const getKeystore = require('../libs/libApiCommon.js').getKeystore; // keystore File에서 Object 추출

/**
 * @notice 토큰 위임 프로시져를 수행한다.
 * @param {String} addr   커맨드 수행 주소
 * @param {object} params 파라메터 ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procTokenApprove.json )
 * @return JSON type (ok: 필드로 성공, 실패 구분)
 * @author jhhong
 */
module.exports.cmdTokenApprove = async function(addr, params) {
    try {
        let keystore = await getKeystore(addr);
        if (keystore == null) {
            throw new Error(`Keystore File does not exist! ADDR:[${addr}]`);
        }
        let exists = await Account.countDocuments({account: addr});
        if(exists > 1) {
            throw new Error(`DB Error! Account Duplicated! ADDR:[${addr}], COUNT:[${exists}]`);
        }
        if(exists == 0) {
            throw new Error(`Unlisted! \"AddAccounts\" need! ADDR:[${addr}]`);
        }
        let account = await Account.findOne({account: addr});
        if(account.status != 'idle') {
            throw new Error(`Account is busy! ADDR:[${addr}]`);
        }
        if(params.operation != 'procTokenApprove') { // params 가용성 체크: OPERATION
            throw new Error('params: Invalid Operation');
        }
        let cbptrPre = async function(addr) {
            await Account.collection.updateOne({account: addr}, {$set: {status: 'proceeding'}});
            Log('DEBUG', `Start Procedure.... (APPROVE DKA)`);
        }
        let cbptrPost = async function(addr) {
            await Account.collection.updateOne({account: addr}, {$set: {status: 'idle'}});
            Log('DEBUG', `End Procedure...... (APPROVE DKA)`);
        }
        ApiToken.procTokenApprove(keystore, account.passwd, params, cbptrPre, cbptrPost);
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdTokenApprove`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}

/**
 * @notice 토큰 소각 프로시져를 수행한다.
 * @param {String} addr   커맨드 수행 주소
 * @param {object} params 파라메터 ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procTokenBurn.json )
 * @return JSON type (ok: 필드로 성공, 실패 구분)
 * @author jhhong
 */
module.exports.cmdTokenBurn = async function(addr, params) {
    try {
        let keystore = await getKeystore(addr);
        if (keystore == null) {
            throw new Error(`Keystore File does not exist! ADDR:[${addr}]`);
        }
        let exists = await Account.countDocuments({account: addr});
        if(exists > 1) {
            throw new Error(`DB Error! Account Duplicated! ADDR:[${addr}], COUNT:[${exists}]`);
        }
        if(exists == 0) {
            throw new Error(`Unlisted! \"AddAccounts\" need! ADDR:[${addr}]`);
        }
        let account = await Account.findOne({account: addr});
        if(account.status != 'idle') {
            throw new Error(`Account is busy! ADDR:[${addr}]`);
        }
        if(params.operation != 'procTokenBurn') { // params 가용성 체크: OPERATION
            throw new Error('params: Invalid Operation');
        }
        let cbptrPre = async function(addr) {
            await Account.collection.updateOne({account: addr}, {$set: {status: 'proceeding'}});
            Log('DEBUG', `Start Procedure.... (BURN DKA)`);
        }
        let cbptrPost = async function(addr) {
            await Account.collection.updateOne({account: addr}, {$set: {status: 'idle'}});
            Log('DEBUG', `End Procedure...... (BURN DKA)`);
        }
        ApiToken.procTokenBurn(keystore, account.passwd, params, cbptrPre, cbptrPost);
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdTokenBurn`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}

/**
 * @notice 토큰 전송 프로시져를 수행한다.
 * @param {String} addr   커맨드 수행 주소
 * @param {object} params 파라메터 ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procTokenTransfer.json )
 * @return JSON type (ok: 필드로 성공, 실패 구분)
 * @author jhhong
 */
module.exports.cmdTokenTransfer = async function(addr, params) {
    try {
        let keystore = await getKeystore(addr);
        if (keystore == null) {
            throw new Error(`Keystore File does not exist! ADDR:[${addr}]`);
        }
        let exists = await Account.countDocuments({account: addr});
        if(exists > 1) {
            throw new Error(`DB Error! Account Duplicated! ADDR:[${addr}], COUNT:[${exists}]`);
        }
        if(exists == 0) {
            throw new Error(`Unlisted! \"AddAccounts\" need! ADDR:[${addr}]`);
        }
        let account = await Account.findOne({account: addr});
        if(account.status != 'idle') {
            throw new Error(`Account is busy! ADDR:[${addr}]`);
        }
        if(params.operation != 'procTokenTransfer') { // params 가용성 체크: OPERATION
            throw new Error('params: Invalid Operation');
        }
        let cbptrPre = async function(addr) {
            await Account.collection.updateOne({account: addr}, {$set: {status: 'proceeding'}});
            Log('DEBUG', `Start Procedure.... (TRANSFER DKA)`);
        }
        let cbptrPost = async function(addr) {
            await Account.collection.updateOne({account: addr}, {$set: {status: 'idle'}});
            Log('DEBUG', `End Procedure...... (TRANSFER DKA)`);
        }
        ApiToken.procTokenTransfer(keystore, account.passwd, params, cbptrPre, cbptrPost);
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdTokenTransfer`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}