/**
 * @file libApiCompany.js
 * @notice 물류사 API 정의
 * @dev 물류사 Action
 * - 주문 접수
 * - 주문 상태갱신
 * - 관리자 등록
 * - 관리자 등록해제
 * - 물류사 컨트랙트 deploy
 * @author jhhong
 */

//// WEB3
const web3 = require('../../libs/Web3.js').prov2; // web3 provider (order는 privnet(chain2)에 deploy됨)
//// LOGs
const Log = require('../../libs/libLog.js').Log; // 로그 출력
//// LOG COLOR (console)
const RED   = require('../../libs/libLog.js').consoleRed; // 콘솔 컬러 출력: RED
const GREEN = require('../../libs/libLog.js').consoleGreen; // 콘솔 컬러 출력: GREEN
const BLUE  = require('../../libs/libLog.js').consoleBlue; // 콘솔 컬러 출력: BLUE
//// LIBs (libDkargoCompany)
const launch         = require('../../libs/libDkargoCompany.js').launch; // launch: 주문 접수 함수
const updateOrder    = require('../../libs/libDkargoCompany.js').updateOrderCode; // updateOrder: 주문 상태갱신 함수
const addOperator    = require('../../libs/libDkargoCompany.js').addOperator; // addOperator: 관리자 등록 함수
const removeOperator = require('../../libs/libDkargoCompany.js').removeOperator; // removeOperator: 관리자 등록해제 함수
const setName        = require('../../libs/libDkargoCompany.js').setName; // setName: 물류사 이름 설정 함수
const setUrl         = require('../../libs/libDkargoCompany.js').setUrl; // setUrl: 물류사 URL 설정 함수
const setRecipient   = require('../../libs/libDkargoCompany.js').setRecipient; // setRecipient: 물류사 수취인주소 설정 함수
const deployCompany  = require('../../libs/libDkargoCompany.js').deployCompany; // deployCompany: 물류사 컨트랙트 deploy 함수
//// LIBs (etc)
const libCommon = require('../../libs/libCommon.js'); // Common Libarary

/**
 * @notice 주문을 접수한다.
 * @param {string}  keystore  keystore object(json format)
 * @param {string}  passwd    keystore password
 * @param {object}  params    parameters ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procCompanyLaunchOrders.json )
 * @param {pointer} cbptrPre  프로시져 시작 시 호출될 콜백함수 포인터
 * @param {pointer} cbptrPost 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {number}  gasprice  GAS 가격 (wei단위), 디폴트 = 0
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procCompanyLaunchOrders = async function(keystore, passwd, params, cbptrPre, cbptrPost, gasprice = 0) {
    try {
        if(params.operation != 'procCompanyLaunchOrders') {
            throw new Error('params: Invalid Operation');
        }
        if(params.data == undefined || params.data == null || params.data == 'none') {
            Log('WARN', `Not found Data to Launch!`);
            return true;
        }
        let company = params.data.company;
        let orders = params.data.orders;
        let count = params.data.count;
        if(orders.length != count) {
            throw new Error('params: Invalid Data: Count');
        }
        let account = await web3.eth.accounts.decrypt(keystore, passwd);
        let cmder = account.address;
        let privkey = account.privateKey.split('0x')[1];
        let nonce = await web3.eth.getTransactionCount(cmder);
        //// 흐름제어 코드
        let alldone = true; // 초기값 = true, libs function 호출이 일어나지 않아 alldone값 변경이 일어나지 않을 경우에 대한 예외처리 코드
        if(count > 0) { // libs function 호출이 일어날 경우
            alldone = false; // alldone값을 false로 세팅
            if(cbptrPre != undefined && cbptrPre != null) {
                await cbptrPre(cmder); // 콜백함수 포인터가 정상적일 경우, 호출
            }
        }
        let promises = new Array(); // 프로미스 병렬처리를 위한 배열
        for(let i = 0; i < count; i++, nonce++) {
            let promise = launch(company, cmder, privkey, orders[i].addr, orders[i].transportid, nonce, gasprice).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == transaction hash
                    Log('DEBUG', `LAUNCH done!`);
                    Log('DEBUG', `- [ORDER]:  ['${BLUE(orders[i].addr)}'],`);
                    Log('DEBUG', `- [TID]:    [${BLUE(orders[i].transportid)}],`);
                    Log('DEBUG', `=>[TXHASH]: ['${GREEN(ret)}']`);
                }
            });
            promises.push(promise);
        }
        Promise.all(promises).then(async () => {
            alldone = true;
            if(cbptrPost != undefined && cbptrPost != null) {
                await cbptrPost(cmder);
            }
        });
        while(alldone == false) {
            await libCommon.delay(10);
        }
        return true;
    } catch(error) {
        let action = `Action: procCompanyLaunchOrders`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return false;
    }
}

/**
 * @notice 주문 상태갱신을 수행한다.
 * @param {string}  keystore  keystore object(json format)
 * @param {string}  passwd    keystore password
 * @param {object}  params    parameters ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procCompanyUpdateOrders.json )
 * @param {pointer} cbptrPre  프로시져 시작 시 호출될 콜백함수 포인터
 * @param {pointer} cbptrPost 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {number}  gasprice  GAS 가격 (wei단위), 디폴트 = 0
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procCompanyUpdateOrders = async function(keystore, passwd, params, cbptrPre, cbptrPost, gasprice = 0) {
    try {
        if(params.operation != 'procCompanyUpdateOrders') {
            throw new Error('params: Invalid Operation');
        }
        if(params.data == undefined || params.data == null || params.data == 'none') {
            Log('WARN', `Not found Data to UpdateOrder!`);
            return true;
        }
        let company = params.data.company;
        let orders = params.data.orders;
        let count = params.data.count;
        if(orders.length != count) {
            throw new Error('params: Invalid Data: Count');
        }
        let account = await web3.eth.accounts.decrypt(keystore, passwd);
        let cmder = account.address;
        let privkey = account.privateKey.split('0x')[1];
        let nonce = await web3.eth.getTransactionCount(cmder);
        //// 흐름제어 코드
        let alldone = true; // 초기값 = true, libs function 호출이 일어나지 않아 alldone값 변경이 일어나지 않을 경우에 대한 예외처리 코드
        if(count > 0) { // libs function 호출이 일어날 경우
            alldone = false; // alldone값을 false로 세팅
            if(cbptrPre != undefined && cbptrPre != null) {
                await cbptrPre(cmder); // 콜백함수 포인터가 정상적일 경우, 호출
            }
        }
        let idmapper = new Array(); // For Demo (주문 컨트랙트 주소 <-> 물류플랫폼사 주문번호 mapping을 위한 테이블)
        let promises = new Array(); // 프로미스 병렬처리를 위한 배열
        for(let i = 0; i < count; i++, nonce++) {
            let addr = orders[i].addr;
            let transportid = orders[i].transportid;
            let code = orders[i].code
            let promise = updateOrder(company, cmder, privkey, addr, transportid, code, nonce, gasprice).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == transaction hash
                    Log('DEBUG', `UPDATE done!`);
                    Log('DEBUG', `- [ORDER]:  ['${BLUE(addr)}'],`);
                    Log('DEBUG', `- [TID]:    [${BLUE(transportid)}],`);
                    Log('DEBUG', `- [CODE]:   [${BLUE(code)}],`);
                    Log('DEBUG', `=>[TXHASH]: ['${GREEN(ret)}']`);
                    let idelmt = new Object();
                    idelmt.address = addr; // 주문 컨트랙트 주소
                    idelmt.latest = code; // 마지막 주문배송 코드
                    idmapper.push(idelmt);
                }
            });
            promises.push(promise);
        }
        Promise.all(promises).then(async () => {
            alldone = true;
            if(cbptrPost != undefined && cbptrPost != null) {
                await cbptrPost(cmder, idmapper);
            }
        });
        while(alldone == false) {
            await libCommon.delay(10);
        }
        return true;
    } catch(error) {
        let action = `Action: procCompanyUpdateOrders`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return false;
    }
}

/**
 * @notice 관리자를 추가한다.
 * @param {string}  keystore  keystore object(json format)
 * @param {string}  passwd    keystore password
 * @param {object}  params    parameters ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procCompanyAddOperator.json )
 * @param {pointer} cbptrPre  프로시져 시작 시 호출될 콜백함수 포인터
 * @param {pointer} cbptrPost 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {number}  gasprice  GAS 가격 (wei단위), 디폴트 = 0
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procCompanyAddOperator = async function(keystore, passwd, params, cbptrPre, cbptrPost, gasprice = 0) {
    try {
        if(params.operation != 'procCompanyAddOperator') {
            throw new Error('params: Invalid Operation');
        }
        if(params.data == undefined || params.data == null || params.data == 'none') {
            Log('WARN', `Not found Data to AddOperator!`);
            return true;
        }
        let company = params.data.company;
        let operators = params.data.operators;
        let count = params.data.count;
        if(operators.length != count) {
            throw new Error('params: Invalid Data: Count');
        }
        let account = await web3.eth.accounts.decrypt(keystore, passwd);
        let cmder = account.address;
        let privkey = account.privateKey.split('0x')[1];
        let nonce = await web3.eth.getTransactionCount(cmder);
        //// 흐름제어 코드
        let alldone = true; // 초기값 = true, libs function 호출이 일어나지 않아 alldone값 변경이 일어나지 않을 경우에 대한 예외처리 코드
        if(count > 0) { // libs function 호출이 일어날 경우
            alldone = false; // alldone값을 false로 세팅
            if(cbptrPre != undefined && cbptrPre != null) {
                await cbptrPre(cmder); // 콜백함수 포인터가 정상적일 경우, 호출
            }
        }
        let promises = new Array(); // 프로미스 병렬처리를 위한 배열
        for(let i = 0; i < count; i++, nonce++) {
            let promise = addOperator(company, cmder, privkey, operators[i].addr, nonce, gasprice).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == transaction hash
                    let action = `ADD-OPERATOR done!\n` +
                    `- [ADDRESS]: ['${BLUE(operators[i].addr)}'],\n` +
                    `=>[TXHASH]:  ['${GREEN(ret)}']`;
                    Log('DEBUG', `${action}`);
                }
            });
            promises.push(promise);
        }
        Promise.all(promises).then(async () => {
            alldone = true;
            if(cbptrPost != undefined && cbptrPost != null) {
                await cbptrPost(cmder);
            }
        });
        while(alldone == false) {
            await libCommon.delay(10);
        }
        return true;
    } catch(error) {
        let action = `Action: procCompanyAddOperator`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return false;
    }
}

/**
 * @notice 관리자에서 제거한다.
 * @param {string}  keystore  keystore object(json format)
 * @param {string}  passwd    keystore password
 * @param {object}  params    parameters ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procCompanyRemoveOperators.json )
 * @param {pointer} cbptrPre  프로시져 시작 시 호출될 콜백함수 포인터
 * @param {pointer} cbptrPost 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {number}  gasprice  GAS 가격 (wei단위), 디폴트 = 0
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procCompanyRemoveOperators = async function(keystore, passwd, params, cbptrPre, cbptrPost, gasprice = 0) {
    try {
        if(params.operation != 'procCompanyRemoveOperators') {
            throw new Error('params: Invalid Operation');
        }
        if(params.data == undefined || params.data == null || params.data == 'none') {
            Log('WARN', `Not found Data to RemoveOperator!`);
            return true;
        }
        let company = params.data.company;
        let operators = params.data.operators;
        let count = params.data.count;
        if(operators.length != count) {
            throw new Error('params: Invalid Data: Count');
        }
        let account = await web3.eth.accounts.decrypt(keystore, passwd);
        let cmder = account.address;
        let privkey = account.privateKey.split('0x')[1];
        let nonce = await web3.eth.getTransactionCount(cmder);
        //// 흐름제어 코드
        let alldone = true; // 초기값 = true, libs function 호출이 일어나지 않아 alldone값 변경이 일어나지 않을 경우에 대한 예외처리 코드
        if(count > 0) { // libs function 호출이 일어날 경우
            alldone = false; // alldone값을 false로 세팅
            if(cbptrPre != undefined && cbptrPre != null) {
                await cbptrPre(cmder); // 콜백함수 포인터가 정상적일 경우, 호출
            }
        }
        let promises = new Array(); // 프로미스 병렬처리를 위한 배열
        for(let i = 0; i < count; i++, nonce++) {
            let promise = removeOperator(company, cmder, privkey, operators[i].addr, nonce, gasprice).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == transaction hash
                    let action = `REMOVE-OPERATOR done!\n` +
                    `- [ADDRESS]: ['${BLUE(operators[i].addr)}'],\n` +
                    `=>[TXHASH]:  ['${GREEN(ret)}']`;
                    Log('DEBUG', `${action}`);
                }
            });
            promises.push(promise);
        }
        Promise.all(promises).then(async () => {
            alldone = true;
            if(cbptrPost != undefined && cbptrPost != null) {
                await cbptrPost(cmder);
            }
        });
        while(alldone == false) {
            await libCommon.delay(10);
        }
        return true;
    } catch(error) {
        let action = `Action: procCompanyRemoveOperators`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return false;
    }
}

/**
 * @notice 물류사의 부가정보들을 설정한다.
 * @dev 부가정보: 물류사 이름 / 물류사 URL / 물류사 수취인주소
 * @param {string}  keystore  keystore object(json format)
 * @param {string}  passwd    keystore password
 * @param {object}  params    parameters ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procCompanySetInfo.json )
 * @param {pointer} cbptrPre  프로시져 시작 시 호출될 콜백함수 포인터
 * @param {pointer} cbptrPost 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {number}  gasprice  GAS 가격 (wei단위), 디폴트 = 0
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procCompanySetInfo = async function(keystore, passwd, params, cbptrPre, cbptrPost, gasprice = 0) {
    try {
        if(params.operation != 'procCompanySetInfo') {
            throw new Error('params: Invalid Operation');
        }
        if(params.data == undefined || params.data == null || params.data == 'none') {
            Log('WARN', `Not found Data to procCompanySetInfo!`);
            return true;
        }
        let company = params.data.company;
        let name = params.data.name;
        let url = params.data.url;
        let recipient = params.data.recipient;
        let account = await web3.eth.accounts.decrypt(keystore, passwd);
        let cmder = account.address;
        let privkey = account.privateKey.split('0x')[1];
        let nonce = await web3.eth.getTransactionCount(cmder);
        //// 흐름제어 코드
        let alldone = true; // 초기값 = true, libs function 호출이 일어나지 않아 alldone값 변경이 일어나지 않을 경우에 대한 예외처리 코드
        if((name != undefined) || (url != undefined) || (recipient != undefined)) { // libs function 호출이 일어날 경우
            alldone = false; // alldone값을 false로 세팅
            if(cbptrPre != undefined && cbptrPre != null) {
                await cbptrPre(cmder); // 콜백함수 포인터가 정상적일 경우, 호출
            }
        }
        let promises = new Array(); // 프로미스 병렬처리를 위한 배열
        if(name != undefined) {
            let promise = setName(company, cmder, privkey, name, nonce, gasprice).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == transaction hash
                    let action = `SET-NAME done!\n` +
                    `- [NAME]:   [${BLUE(name)}],\n` +
                    `=>[TXHASH]: ['${GREEN(ret)}']`;
                    Log('DEBUG', `${action}`);
                }
            });
            promises.push(promise);
            nonce++;
        }
        if(url != undefined) {
            let promise = setUrl(company, cmder, privkey, url, nonce, gasprice).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == transaction hash
                    let action = `SET-URL done!\n` +
                    `- [URL]:    ['${BLUE(url)}'],\n` +
                    `=>[TXHASH]: ['${GREEN(ret)}']`;
                    Log('DEBUG', `${action}`);
                }
            });
            promises.push(promise);
            nonce++;
        }
        if(recipient != undefined) {
            let promise = setRecipient(company, cmder, privkey, recipient, nonce, gasprice).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == transaction hash
                    let action = `SET-RECIPIENT done!\n` +
                    `- [RECIPIENT]: ['${BLUE(recipient)}'],\n` +
                    `=>[TXHASH]:    ['${GREEN(ret)}']`;
                    Log('DEBUG', `${action}`);
                }
            });
            promises.push(promise);
        }
        Promise.all(promises).then(async () => {
            alldone = true;
            if(cbptrPost != undefined && cbptrPost != null) {
                await cbptrPost(cmder);
            }
        });
        while(alldone == false) {
            await libCommon.delay(10);
        }
        return true;
    } catch(error) {
        let action = `Action: procCompanySetInfo`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return false;
    }
}

/**
 * @notice 물류사 컨트랙트 deploy를 수행한다.
 * @param {string}  keystore  keystore object(json format)
 * @param {string}  passwd    keystore password
 * @param {object}  params    parameters ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procCompanyDeploy.json )
 * @param {pointer} cbptrPre  프로시져 시작 시 호출될 콜백함수 포인터
 * @param {pointer} cbptrPost 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {number}  gasprice  GAS 가격 (wei단위), 디폴트 = 0
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procCompanyDeploy = async function(keystore, passwd, params, cbptrPre, cbptrPost, gasprice = 0) {
    try {
        if(params.operation != 'procCompanyDeploy') {
            throw new Error('params: Invalid Operation');
        }
        if(params.data == undefined || params.data == null || params.data == 'none') {
            Log('WARN', `Not found Data to DeployCompany!`);
            return true;
        }
        let result  = null; // deploy된 company contract 정보를 담을 변수
        let service = params.data.service;
        let name = params.data.name;
        let url = params.data.url;
        let recipient = params.data.recipient;
        let account = await web3.eth.accounts.decrypt(keystore, passwd);
        let cmder = account.address;
        let privkey = account.privateKey.split('0x')[1];
        let nonce = await web3.eth.getTransactionCount(cmder);
        let alldone = false; // 본 함수가 호출되면 무조건 libs function이 호출되므로 alldone을 false로 초기화
        if(cbptrPre != undefined && cbptrPre != null) {
            await cbptrPre(cmder); // 콜백함수 포인터가 정상적일 경우, 호출
        }
        let promises = new Array(); // 프로미스 병렬처리를 위한 배열
        for(let i = 0; i < 1; i++, nonce++) {
            let promise = deployCompany(cmder, privkey, name, url, recipient, service, nonce, gasprice).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == contract address
                    result = new Object();
                    result.address  = ret[0];
                    result.blocknum = ret[1];
                    Log('DEBUG', `COMPANY DEPLOY done!`);
                    Log('DEBUG', `- [COMPANY]:     ['${BLUE(name)}'],`);
                    Log('DEBUG', `=>[ADDRESS]:     ['${GREEN(ret[0])}'],`);
                    Log('DEBUG', `=>[BLOCKNUMBER]: [${GREEN(ret[1])}]`);
                }
            });
            promises.push(promise);
        }
        Promise.all(promises).then(async () => {
            alldone = true;
            if(cbptrPost != undefined && cbptrPost != null) {
                await cbptrPost(cmder, result);
            }
        });
        while(alldone == false) {
            await libCommon.delay(10);
        }
        return true;
    } catch(error) {
        let action = `Action: procCompanyDeploy`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return false;
    }
}