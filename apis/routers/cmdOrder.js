/**
 * @file cmdOrder.js
 * @notice 화주 CMD API 처리함수 정의
 * @author jhhong
 */

//// COMMON
const colors = require('colors/safe'); // 콘솔 Color 출력

//// LIBs
const ApiOrder    = require('../libs/libApiOrder.js'); // 화주 API
const getKeystore = require('../libs/libApiCommon.js').getKeystore; // keystore File에서 Object 추출

//// LOGs
const Log = require('../../libs/libLog.js').Log; // 로그 출력

//// DBs
require('../db.js'); // for mongoose schema import
const mongoose = require('mongoose');
const Account  = mongoose.model('ApiAccount'); // Account Schema

/**
 * @notice 주문 컨트랙트 DEPLOY를 수행한다.
 * @param {String} addr 커맨드 수행 주소
 * @param {object} params 파라메터 ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procOrderDeploy.json )
 * @return JSON type (ok: 필드로 성공, 실패 구분)
 * @author jhhong
 */
module.exports.cmdOrdersDeploy = async function(addr, params) {
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
        if(params.operation != 'procOrderDeploy') { // params 가용성 체크: OPERATION
            throw new Error('params: Invalid Operation');
        }
        let cbptrPre = async function(addr) {
            await Account.collection.updateOne({account: addr}, {$set: {status: 'proceeding'}});
            Log('DEBUG', `Start Procedure.... (DEPLOY ORDERS)`);
        }
        let cbptrPost = async function(addr) {
            await Account.collection.updateOne({account: addr}, {$set: {status: 'idle'}});
            Log('DEBUG', `End Procedure...... (DEPLOY ORDERS)`);
        }
        ApiOrder.procOrderDeploy(keystore, account.passwd, params, cbptrPre, cbptrPost);
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdOrderDeploy`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}

/**
 * @notice 주문 등록요청 프로시져를 수행한다.
 * @param {String} addr 커맨드 수행 주소
 * @param {object} params 파라메터 ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procOrderSubmit.json )
 * @return JSON type (ok: 필드로 성공, 실패 구분)
 * @author jhhong
 */
module.exports.cmdOrdersSubmit = async function(addr, params) {
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
        if(params.operation != 'procOrderSubmit') { // params 가용성 체크: OPERATION
            throw new Error('params: Invalid Operation');
        }
        let cbptrPre = async function(addr) {
            await Account.collection.updateOne({account: addr}, {$set: {status: 'proceeding'}});
            Log('DEBUG', `Start Procedure.... (SUBMIT ORDERS)`);
        }
        let cbptrPost = async function(addr) {
            await Account.collection.updateOne({account: addr}, {$set: {status: 'idle'}});
            Log('DEBUG', `End Procedure...... (SUBMIT ORDERS)`);
        }
        ApiOrder.procOrderSubmit(keystore, account.passwd, params, cbptrPre, cbptrPost);
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdOrdersSubmit`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}

/**
 * @notice 주문 상세정보 변경 프로시져를 수행한다.
 * @param {String} addr 커맨드 수행 주소
 * @param {object} params 파라메터 ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procOrderSetInfo.json )
 * @return JSON type (ok: 필드로 성공, 실패 구분)
 * @author jhhong
 */
module.exports.cmdOrderSetInfos = async function(addr, params) {
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
        if(params.operation != 'procOrderSetInfo') { // params 가용성 체크: OPERATION
            throw new Error('params: Invalid Operation');
        }
        let cbptrPre = async function(addr) {
            await Account.collection.updateOne({account: addr}, {$set: {status: 'proceeding'}});
            Log('DEBUG', `Start Procedure.... (SET ORDER INFO)`);
        }
        let cbptrPost = async function(addr) {
            await Account.collection.updateOne({account: addr}, {$set: {status: 'idle'}});
            Log('DEBUG', `End Procedure...... (SET ORDER INFO)`);
        }
        ApiOrder.procOrderSetInfo(keystore, account.passwd, params, cbptrPre, cbptrPost);
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdOrderSetInfos`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}