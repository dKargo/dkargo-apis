/**
 * @file cmdCompany.js
 * @notice 물류사 CMD API 처리함수 정의
 * @author jhhong
 */

//// DBs
require('../db.js'); // for mongoose schema import
const mongoose = require('mongoose');
const Account  = mongoose.model('ApiAccount'); // Account Schema
const OrderMap = mongoose.model('ApiOrderMap'); // OrderMap Schema
//// LOGs
const Log = require('../../libs/libLog.js').Log; // 로그 출력
//// LOG COLOR (console)
const RED = require('../../libs/libLog.js').consoleRed; // 콘솔 컬러 출력: RED
//// LIBs (libApiCompany)
const ApiCompany = require('../libs/libApiCompany.js'); // 물류사 API
//// LIBs (libApiCommon)
const getKeystore = require('../libs/libApiCommon.js').getKeystore; // keystore File에서 Object 추출

/**
 * @notice 물류사 컨트랙트 DEPLOY를 수행한다.
 * @param {String} addr   커맨드 수행 주소
 * @param {object} params 파라메터 ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procCompanyDeploy.json )
 * @return JSON type (ok: 필드로 성공, 실패 구분)
 * @author jhhong
 */
module.exports.cmdCompanyDeploy = async function(addr, params) {
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
        if(params.operation != 'procCompanyDeploy') { // params 가용성 체크: OPERATION
            throw new Error('params: Invalid Operation');
        }
        let cbptrPre = async function(addr) {
            await Account.collection.updateOne({account: addr.toLowerCase()}, {$set: {status: 'proceeding'}});
            Log('DEBUG', `Start Procedure.... (DEPLOY COMPANY) Account:['${addr.toLowerCase()}']`);
        }
        let cbptrPost = async function(addr) {
            await Account.collection.updateOne({account: addr.toLowerCase()}, {$set: {status: 'idle'}});
            Log('DEBUG', `End Procedure...... (DEPLOY COMPANY) Account:['${addr.toLowerCase()}']`);
        }
        ApiCompany.procCompanyDeploy(keystore, account.passwd, params, cbptrPre, cbptrPost);
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdCompanyDeploy`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}

/**
 * @notice 주문접수 프로시져를 수행한다.
 * @param {String} addr   커맨드 수행 주소
 * @param {object} params 파라메터 ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procCompanyLaunchOrders.json )
 * @return JSON type (ok: 필드로 성공, 실패 구분)
 * @author jhhong
 */
module.exports.cmdCompanyLaunchOrders = async function(addr, params) {
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
        if(params.operation != 'procCompanyLaunchOrders') { // params 가용성 체크: OPERATION
            throw new Error('params: Invalid Operation');
        }
        let cbptrPre = async function(addr) {
            await Account.collection.updateOne({account: addr.toLowerCase()}, {$set: {status: 'proceeding'}});
            Log('DEBUG', `Start Procedure.... (LAUNCH ORDERS) Account:['${addr.toLowerCase()}']`);
        }
        let cbptrPost = async function(addr) {
            await Account.collection.updateOne({account: addr.toLowerCase()}, {$set: {status: 'idle'}});
            Log('DEBUG', `End Procedure...... (LAUNCH ORDERS) Account:['${addr.toLowerCase()}']`);
        }
        ApiCompany.procCompanyLaunchOrders(keystore, account.passwd, params, cbptrPre, cbptrPost);
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdCompanyLaunchOrders`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}

/**
 * @notice 주문 구간배송완료 프로시져를 수행한다.
 * @param {String} addr   커맨드 수행 주소
 * @param {object} params 파라메터 ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procCompanyUpdateOrders.json )
 * @return JSON type (ok: 필드로 성공, 실패 구분)
 * @author jhhong
 */
module.exports.cmdCompanyUpdateOrders = async function(addr, params) {
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
        if(params.operation != 'procCompanyUpdateOrders') { // params 가용성 체크: OPERATION
            throw new Error('params: Invalid Operation');
        }
        let cbptrPre = async function(addr) {
            await Account.collection.updateOne({account: addr.toLowerCase()}, {$set: {status: 'proceeding'}});
            Log('DEBUG', `Start Procedure.... (UPDATE ORDERS) Account:['${addr.toLowerCase()}']`);
        }
        let cbptrPost = async function(addr, idmapper) {
            for(let i = 0; i < idmapper.length; i++) {
                if(await OrderMap.countDocuments({address: idmapper[i].address}) != 1) {
                    Log('ERROR', `Error! Need to check OrderMap {{address: ${idmapper[i].address}}}`);
                }
                await OrderMap.collection.updateOne({address: idmapper[i].address}, {$set: {latest: idmapper[i].latest}});
            }
            await Account.collection.updateOne({account: addr.toLowerCase()}, {$set: {status: 'idle'}});
            Log('DEBUG', `End Procedure...... (UPDATE ORDERS) Account:['${addr.toLowerCase()}']`);
        }
        ApiCompany.procCompanyUpdateOrders(keystore, account.passwd, params, cbptrPre, cbptrPost);
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdCompanyUpdateOrders`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}

/**
 * @notice 물류사 운영자 등록을 수행한다.
 * @param {String} addr   커맨드 수행 주소
 * @param {object} params 파라메터 ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procCompanyAddOperator.json )
 * @return JSON type (ok: 필드로 성공, 실패 구분)
 * @author jhhong
 */
module.exports.cmdCompanyAddOperators = async function(addr, params) {
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
        if(params.operation != 'procCompanyAddOperator') { // params 가용성 체크: OPERATION
            throw new Error('params: Invalid Operation');
        }
        let cbptrPre = async function(addr) {
            await Account.collection.updateOne({account: addr.toLowerCase()}, {$set: {status: 'proceeding'}});
            Log('DEBUG', `Start Procedure.... (ADD OPERATORS) Account:['${addr.toLowerCase()}']`);
        }
        let cbptrPost = async function(addr) {
            await Account.collection.updateOne({account: addr.toLowerCase()}, {$set: {status: 'idle'}});
            Log('DEBUG', `End Procedure...... (ADD OPERATORS) Account:['${addr.toLowerCase()}']`);
        }
        ApiCompany.procCompanyAddOperator(keystore, account.passwd, params, cbptrPre, cbptrPost);
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdCompanyAddOperators`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}

/**
 * @notice 물류사 운영자 등록해제를 수행한다.
 * @param {String} addr   커맨드 수행 주소
 * @param {object} params 파라메터 ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procCompanyRemoveOperators.json )
 * @return JSON type (ok: 필드로 성공, 실패 구분)
 * @author jhhong
 */
module.exports.cmdCompanyRemoveOperators = async function(addr, params) {
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
        if(params.operation != 'procCompanyRemoveOperators') { // params 가용성 체크: OPERATION
            throw new Error('params: Invalid Operation');
        }
        let cbptrPre = async function(addr) {
            await Account.collection.updateOne({account: addr.toLowerCase()}, {$set: {status: 'proceeding'}});
            Log('DEBUG', `Start Procedure.... (REMOVE OPERATORS) Account:['${addr.toLowerCase()}']`);
        }
        let cbptrPost = async function(addr) {
            await Account.collection.updateOne({account: addr.toLowerCase()}, {$set: {status: 'idle'}});
            Log('DEBUG', `End Procedure...... (REMOVE OPERATORS) Account:['${addr.toLowerCase()}']`);
        }
        ApiCompany.procCompanyRemoveOperators(keystore, account.passwd, params, cbptrPre, cbptrPost);
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdCompanyRemoveOperators`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}

/**
 * @notice 물류사 정보설정을 수행한다.
 * @param {String} addr   커맨드 수행 주소
 * @param {object} params 파라메터 ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procCompanySetInfo.json )
 * @return JSON type (ok: 필드로 성공, 실패 구분)
 * @author jhhong
 */
module.exports.cmdCompanysetInfos = async function(addr, params) {
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
        if(params.operation != 'procCompanySetInfo') { // params 가용성 체크: OPERATION
            throw new Error('params: Invalid Operation');
        }
        let cbptrPre = async function(addr) {
            await Account.collection.updateOne({account: addr.toLowerCase()}, {$set: {status: 'proceeding'}});
            Log('DEBUG', `Start Procedure.... (SET COMPANY INFORMATIONS) Account:['${addr.toLowerCase()}']`);
        }
        let cbptrPost = async function(addr) {
            await Account.collection.updateOne({account: addr.toLowerCase()}, {$set: {status: 'idle'}});
            Log('DEBUG', `End Procedure...... (SET COMPANY INFORMATIONS) Account:['${addr.toLowerCase()}']`);
        }
        ApiCompany.procCompanySetInfo(keystore, account.passwd, params, cbptrPre, cbptrPost);
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdCompanysetInfos`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}