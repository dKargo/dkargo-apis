/**
 * @file cmdOrder.js
 * @notice 화주 CMD API 처리함수 정의
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
//// LIBs (libApiOrder)
const ApiOrder = require('../libs/libApiOrder.js'); // 화주 API
//// LIBs (libApiCommon)
const getKeystore = require('../libs/libApiCommon.js').getKeystore; // keystore File에서 Object 추출

/**
 * @notice 주문 컨트랙트 DEPLOY를 수행한다.
 * @param {String} addr   커맨드 수행 주소
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
            await Account.collection.updateOne({account: addr.toLowerCase()}, {$set: {status: 'proceeding'}});
            Log('DEBUG', `Start Procedure.... (DEPLOY ORDERS) Account:['${addr.toLowerCase()}']`);
        }
        let cbptrPost = async function(addr, idmapper) {
            for(let i = 0; i < idmapper.length; i++) {
                let item = new OrderMap();
                item.address  = idmapper[i].address.toLowerCase();
                item.originId = idmapper[i].originId;
                item.latest   = idmapper[i].latest;
                item.code10   = idmapper[i].code10;
                item.code20   = idmapper[i].code20;
                item.code30   = idmapper[i].code30;
                item.code40   = idmapper[i].code40;
                item.code60   = idmapper[i].code60;
                item.code70   = idmapper[i].code70;
                await OrderMap.collection.insertOne(item);
            }
            await Account.collection.updateOne({account: addr.toLowerCase()}, {$set: {status: 'idle'}});
            Log('DEBUG', `End Procedure...... (DEPLOY ORDERS) Account:['${addr.toLowerCase()}']`);
        }
        ApiOrder.procOrderDeploy(keystore, account.passwd, params, cbptrPre, cbptrPost);
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdOrderDeploy`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}

/**
 * @notice 주문 등록요청 프로시져를 수행한다.
 * @param {String} addr   커맨드 수행 주소
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
            await Account.collection.updateOne({account: addr.toLowerCase()}, {$set: {status: 'proceeding'}});
            Log('DEBUG', `Start Procedure.... (SUBMIT ORDERS) Account:['${addr.toLowerCase()}']`);
        }
        let cbptrPost = async function(addr) {
            await Account.collection.updateOne({account: addr.toLowerCase()}, {$set: {status: 'idle'}});
            Log('DEBUG', `End Procedure...... (SUBMIT ORDERS) Account:['${addr.toLowerCase()}']`);
        }
        ApiOrder.procOrderSubmit(keystore, account.passwd, params, cbptrPre, cbptrPost);
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdOrdersSubmit`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}

/**
 * @notice 주문 컨트랙트를 생성한다.
 * @dev 주문 컨트랙트 DEPLOY + 주문번호 등록 요청(Submit)
 * @param {String} addr   커맨드 수행 주소
 * @param {object} params 파라메터 ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procOrderDeploy.json )
 * @return JSON type (ok: 필드로 성공, 실패 구분)
 * @author jhhong
 */
module.exports.cmdOrdersCreate = async function(addr, params) {
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
            await Account.collection.updateOne({account: addr.toLowerCase()}, {$set: {status: 'proceeding'}});
            Log('DEBUG', `Start Procedure.... (CREATE ORDERS) Account:['${addr.toLowerCase()}']`);
        }
        let cbptrPost = async function(addr, idmapper) {
            for(let i = 0; i < idmapper.length; i++) {
                let item = new OrderMap();
                item.address  = idmapper[i].address.toLowerCase();
                item.originId = idmapper[i].originId;
                item.latest   = idmapper[i].latest;
                item.code10   = idmapper[i].code10;
                item.code20   = idmapper[i].code20;
                item.code30   = idmapper[i].code30;
                item.code40   = idmapper[i].code40;
                item.code60   = idmapper[i].code60;
                item.code70   = idmapper[i].code70;
                await OrderMap.collection.insertOne(item);
            }
            await Account.collection.updateOne({account: addr.toLowerCase()}, {$set: {status: 'idle'}});
            Log('DEBUG', `End Procedure...... (CREATE ORDERS) Account:['${addr.toLowerCase()}']`);
        }
        ApiOrder.procOrderCreate(keystore, account.passwd, params, cbptrPre, cbptrPost);
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdOrdersCreate`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}

/**
 * @notice 주문 상세정보 변경 프로시져를 수행한다.
 * @param {String} addr   커맨드 수행 주소
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
            await Account.collection.updateOne({account: addr.toLowerCase()}, {$set: {status: 'proceeding'}});
            Log('DEBUG', `Start Procedure.... (SET ORDER INFO) Account:['${addr.toLowerCase()}']`);
        }
        let cbptrPost = async function(addr) {
            await Account.collection.updateOne({account: addr.toLowerCase()}, {$set: {status: 'idle'}});
            Log('DEBUG', `End Procedure...... (SET ORDER INFO) Account:['${addr.toLowerCase()}']`);
        }
        ApiOrder.procOrderSetInfo(keystore, account.passwd, params, cbptrPre, cbptrPost);
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdOrderSetInfos`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}