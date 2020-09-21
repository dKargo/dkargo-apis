/**
 * @file cmdAdmin.js
 * @notice 관리자 CMD API 처리함수 정의
 * @author jhhong
 */

//// COMMON
const colors = require('colors/safe'); // 콘솔 Color 출력

//// LIBs
const ApiAdmin    = require('../libs/libApiAdmin.js'); // 관리자 API
const getKeystore = require('../libs/libApiCommon.js').getKeystore; // keystore File에서 Object 추출

//// LOGs
const Log = require('../../libs/libLog.js').Log; // 로그 출력

//// DBs
require('../db.js'); // for mongoose schema import
const mongoose = require('mongoose');
const Account  = mongoose.model('ApiAccount'); // Account Schema

/**
 * @notice 관리되어야 할 계정을 추가한다.
 * @param {object} params 계정 정보들 ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procAdminAddAccounts.json )
 * @return JSON type (ok: 필드로 성공, 실패 구분)
 * @author jhhong
 */
module.exports.cmdAdminAddAccounts = async function(params) {
    try {
        if(params.operation != 'procAdminAddAccounts') { // params 가용성 체크: OPERATION
            throw new Error('params: Invalid Operation');
        }
        let counts = params.data.count;
        let accounts = params.data.accounts;
        if(counts != accounts.length) { // params 가용성 체크: COUNT
            throw new Error(`Invalid Params! Count missmatch:[${counts}]`);
        }
        for(let i = 0; i < counts; i++) { // address에 해당하는 KEYSTORE 파일이 API Server에 존재하는지 확인
            let keystore = await getKeystore(accounts[i].addr);
            if (keystore == null) {
                throw new Error(`Invalid Params! Not Exist:[${accounts[i].addr}]`);
            }
        }
        let total = 0;
        for(let i = 0; i < counts; i++) { // DB 조회: 이미 등록된 계정에 대해서는 별도의 처리를 하지 않음
            if(await Account.countDocuments({account: accounts[i].addr}) == 0) { // 등록되지 않은 계정 정보일 경우
                let item = new Account();
                item.account = accounts[i].addr;
                item.passwd = accounts[i].passwd;
                item.status = 'idle';
                await Account.collection.insertOne(item);
                total++;
            }
        }
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        ret.count = total;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdAdminAddAccounts`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}

/**
 * @notice 관리되어야 할 계정을 삭제한다.
 * @param {object} params 계정 정보들 ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procAdminRemoveAccounts.json )
 * @return JSON type (ok: 필드로 성공, 실패 구분)
 * @author jhhong
 */
module.exports.cmdAdminRemoveAccounts = async function(params) {
    try {
        if(params.operation != 'procAdminRemoveAccounts') { // params 가용성 체크: OPERATION
            throw new Error('params: Invalid Operation');
        }
        let counts = params.data.count;
        let accounts = params.data.accounts;
        if(counts != accounts.length) { // params 가용성 체크: COUNT
            throw new Error(`Invalid Params! Count missmatch:[${counts}]`);
        }
        for(let i = 0; i < counts; i++) { // address에 해당하는 KEYSTORE 파일이 API Server에 존재하는지 확인
            let keystore = await getKeystore(accounts[i].addr);
            if (keystore == null) {
                throw new Error(`Invalid Params! Not Exist:[${accounts[i].addr}]`);
            }
        }
        let total = 0;
        for(let i = 0; i < counts; i++) { // DB 조회: 이미 등록된 계정에 대해서는 별도의 처리를 하지 않음
            let exists = await Account.countDocuments({account: accounts[i].addr});
            if(exists > 1) { // 오류 사항 체크: DB에 저장된 항목이 1을 초과할 경우, 예외처리
                throw new Error(`Invalid Params! Not Exist:[${accounts[i].addr}]`);
            } else if(exists == 1) { // 등록된 계정 정보일 경우
                await Account.deleteOne({account: accounts[i].addr});
                total++;
            }
        }
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        ret.count = total;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdAdminRemoveAccounts`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}

/**
 * @notice 물류사를 등록한다.
 * @param {String} addr 커맨드 수행 주소
 * @param {object} params 파라메터 ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procAdminRegisterCompanies.json )
 * @return JSON type (ok: 필드로 성공, 실패 구분)
 * @author jhhong
 */
module.exports.cmdAdminRegisterCompanies = async function(addr, params) {
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
        if(params.operation != 'procAdminRegisterCompanies') { // params 가용성 체크: OPERATION
            throw new Error('params: Invalid Operation');
        }
        let cbptrPre = async function(addr) {
            await Account.collection.updateOne({account: addr}, {$set: {status: 'proceeding'}});
            Log('DEBUG', `Start Procedure.... (REGISTER COMPANIES)`);
        }
        let cbptrPost = async function(addr) {
            await Account.collection.updateOne({account: addr}, {$set: {status: 'idle'}});
            Log('DEBUG', `End Procedure...... (REGISTER COMPANIES)`);
        }
        ApiAdmin.procAdminRegisterCompanies(keystore, account.passwd, params, cbptrPre, cbptrPost);
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdAdminRegisterCompanies`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}

/**
 * @notice 물류사를 등록해제한다.
 * @param {String} addr 커맨드 수행 주소
 * @param {object} params 파라메터 ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procAdminUnregisterCompanies.json )
 * @return JSON type (ok: 필드로 성공, 실패 구분)
 * @author jhhong
 */
module.exports.cmdAdminUnregisterCompanies = async function(addr, params) {
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
        if(params.operation != 'procAdminUnregisterCompanies') { // params 가용성 체크: OPERATION
            throw new Error('params: Invalid Operation');
        }
        let cbptrPre = async function(addr) {
            await Account.collection.updateOne({account: addr}, {$set: {status: 'proceeding'}});
            Log('DEBUG', `Start Procedure.... (UNREGISTER COMPANIES)`);
        }
        let cbptrPost = async function(addr) {
            await Account.collection.updateOne({account: addr}, {$set: {status: 'idle'}});
            Log('DEBUG', `End Procedure...... (UNREGISTER COMPANIES)`);
        }
        ApiAdmin.procAdminUnregisterCompanies(keystore, account.passwd, params, cbptrPre, cbptrPost);
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdAdminUnregisterCompanies`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}

/**
 * @notice 주문이 결제완료 되었음을 기록한다.
 * @param {String} addr 커맨드 수행 주소
 * @param {object} params 파라메터 ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procAdminMarkOrderPayments.json )
 * @return JSON type (ok: 필드로 성공, 실패 구분)
 * @author jhhong
 */
module.exports.cmdAdminMarkOrderPayments = async function(addr, params) {
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
        if(params.operation != 'procAdminMarkOrderPayments') { // params 가용성 체크: OPERATION
            throw new Error('params: Invalid Operation');
        }
        let cbptrPre = async function(addr) {
            await Account.collection.updateOne({account: addr}, {$set: {status: 'proceeding'}});
            Log('DEBUG', `Start Procedure.... (CHECK PAYMENTS)`);
        }
        let cbptrPost = async function(addr) {
            await Account.collection.updateOne({account: addr}, {$set: {status: 'idle'}});
            Log('DEBUG', `End Procedure...... (CHECK PAYMENTS)`);
        }
        ApiAdmin.procAdminMarkOrderPayments(keystore, account.passwd, params, cbptrPre, cbptrPost);
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdAdminMarkOrderPayments`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}

/**
 * @notice 주문이 결제완료 되었음을 기록한다.
 * @param {String} addr 커맨드 수행 주소
 * @param {object} params 파라메터 ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procAdminSettle.json )
 * @return JSON type (ok: 필드로 성공, 실패 구분)
 * @author jhhong
 */
module.exports.cmdAdminSettleIncentives = async function(addr, params) {
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
        if(params.operation != 'procAdminSettle') { // params 가용성 체크: OPERATION
            throw new Error('params: Invalid Operation');
        }
        let cbptrPre = async function(addr) {
            await Account.collection.updateOne({account: addr}, {$set: {status: 'proceeding'}});
            Log('DEBUG', `Start Procedure.... (SETTLE INCENTIVES)`);
        }
        let cbptrPost = async function(addr) {
            await Account.collection.updateOne({account: addr}, {$set: {status: 'idle'}});
            Log('DEBUG', `End Procedure...... (SETTLE INCENTIVES)`);
        }
        ApiAdmin.procAdminSettlement(keystore, account.passwd, params, cbptrPre, cbptrPost);
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdAdminSettleIncentives`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}