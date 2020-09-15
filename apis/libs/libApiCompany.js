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

//// COMMON
const colors = require('colors/safe'); // 콘솔 Color 출력

//// LIBs
const Log            = require('../../libs/libLog.js').Log; // 로그 출력
const msleep         = require('../../libs/libCommon.js').delay; // milli-second sleep 함수 (promise 수행완료 대기용)
const launch         = require('../../libs/libDkargoCompany.js').launch; // launch: 주문 접수 함수
const updateOrder    = require('../../libs/libDkargoCompany.js').updateOrderCode; // updateOrder: 주문 상태갱신 함수
const addOperator    = require('../../libs/libDkargoCompany.js').addOperator; // addOperator: 관리자 등록 함수
const removeOperator = require('../../libs/libDkargoCompany.js').removeOperator; // removeOperator: 관리자 등록해제 함수
const setName        = require('../../libs/libDkargoCompany.js').setName; // setName: 물류사 이름 설정 함수
const setUrl         = require('../../libs/libDkargoCompany.js').setUrl; // setUrl: 물류사 URL 설정 함수
const setRecipient   = require('../../libs/libDkargoCompany.js').setRecipient; // setRecipient: 물류사 수취인주소 설정 함수
const deployCompany  = require('../../libs/libDkargoCompany.js').deployCompany; // deployCompany: 물류사 컨트랙트 deploy 함수

//// WEB3
const web3 = require('../../libs/Web3.js').prov2; // web3 provider (order는 privnet(chain2)에 deploy됨)

/**
 * @notice 주문을 접수한다.
 * @param {string} keystore keystore object(json format)
 * @param {string} passwd keystore password
 * @param {string} params parameters ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procLaunch.json )
 * @param {pointer} funcptr 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {number} gasprice GAS 가격 (wei단위), 디폴트 = 0
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procLaunch = async function(keystore, passwd, params, funcptr, gasprice = 0) {
    try {
        if(params.operation != 'procLaunch') {
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
        let promises = new Array(); // 프로미스 병렬처리를 위한 배열
        let alldone = false;
        for(let i = 0; i < count; i++, nonce++) {
            let promise = launch(company, cmder, privkey, orders[i].addr, orders[i].transportid, nonce, gasprice).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == transaction hash
                    let action = `LAUNCH done!\n` +
                    `- [ORDER]:  [${colors.blue(orders[i].addr)}],\n` +
                    `- [TID]:    [${colors.blue(orders[i].transportid)}],\n` +
                    `=>[TXHASH]: [${colors.green(ret)}]`;
                    Log('DEBUG', `${action}`);
                }
            });
            promises.push(promise);
        }
        Promise.all(promises).then(async () => {
            alldone = true;
            if(funcptr != undefined && functpr != null) {
                await funcptr(cmder);
            }
        });
        while(alldone == false) {
            await msleep(100);
        }
        return true;
    } catch(error) {
        let action = `Action: procLaunch`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        return false;
    }
}

/**
 * @notice 주문 상태갱신을 수행한다.
 * @param {string} keystore keystore object(json format)
 * @param {string} passwd keystore password
 * @param {string} params parameters ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procUpdateOrder.json )
 * @param {pointer} funcptr 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {number} gasprice GAS 가격 (wei단위), 디폴트 = 0
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procUpdateOrder = async function(keystore, passwd, params, funcptr, gasprice = 0) {
    try {
        if(params.operation != 'procUpdateOrder') {
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
        let promises = new Array(); // 프로미스 병렬처리를 위한 배열
        let alldone = false;
        for(let i = 0; i < count; i++, nonce++) {
            let addr = orders[i].addr;
            let transportid = orders[i].transportid;
            let code = orders[i].code
            let promise = updateOrder(company, cmder, privkey, addr, transportid, code, nonce, gasprice).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == transaction hash
                    let action = `UPDATE done!\n` +
                    `- [ORDER]:  [${colors.blue(addr)}],\n` +
                    `- [TID]:    [${colors.blue(transportid)}],\n` +
                    `- [CODE]:   [${colors.blue(code)}],\n` +
                    `=>[TXHASH]: [${colors.green(ret)}]`;
                    Log('DEBUG', `${action}`);
                }
            });
            promises.push(promise);
        }
        Promise.all(promises).then(async () => {
            alldone = true;
            if(funcptr != undefined && functpr != null) {
                await funcptr(cmder);
            }
        });
        while(alldone == false) {
            await msleep(100);
        }
        return true;
    } catch(error) {
        let action = `Action: procUpdateOrder`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        return false;
    }
}

/**
 * @notice 관리자를 추가한다.
 * @param {string} keystore keystore object(json format)
 * @param {string} passwd keystore password
 * @param {string} params parameters ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procAddOperator.json )
 * @param {pointer} funcptr 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {number} gasprice GAS 가격 (wei단위), 디폴트 = 0
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procAddOperator = async function(keystore, passwd, params, funcptr, gasprice = 0) {
    try {
        if(params.operation != 'procAddOperator') {
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
        let promises = new Array(); // 프로미스 병렬처리를 위한 배열
        let alldone = false;
        for(let i = 0; i < count; i++, nonce++) {
            let promise = addOperator(company, cmder, privkey, operators[i].addr, nonce, gasprice).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == transaction hash
                    let action = `ADD-OPERATOR done!\n` +
                    `- [ADDRESS]: [${colors.blue(operators[i].addr)}],\n` +
                    `=>[TXHASH]:  [${colors.green(ret)}]`;
                    Log('DEBUG', `${action}`);
                }
            });
            promises.push(promise);
        }
        Promise.all(promises).then(async () => {
            alldone = true;
            if(funcptr != undefined && functpr != null) {
                await funcptr(cmder);
            }
        });
        while(alldone == false) {
            await msleep(100);
        }
        return true;
    } catch(error) {
        let action = `Action: procAddOperator`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        return false;
    }
}

/**
 * @notice 관리자에서 제거한다.
 * @param {string} keystore keystore object(json format)
 * @param {string} passwd keystore password
 * @param {string} params parameters ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procRemoveOperator.json )
 * @param {pointer} funcptr 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {number} gasprice GAS 가격 (wei단위), 디폴트 = 0
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procRemoveOperator = async function(keystore, passwd, params, funcptr, gasprice = 0) {
    try {
        if(params.operation != 'procRemoveOperator') {
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
        let promises = new Array(); // 프로미스 병렬처리를 위한 배열
        let alldone = false;
        for(let i = 0; i < count; i++, nonce++) {
            let promise = removeOperator(company, cmder, privkey, operators[i].addr, nonce, gasprice).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == transaction hash
                    let action = `REMOVE-OPERATOR done!\n` +
                    `- [ADDRESS]: [${colors.blue(operators[i].addr)}],\n` +
                    `=>[TXHASH]:  [${colors.green(ret)}]`;
                    Log('DEBUG', `${action}`);
                }
            });
            promises.push(promise);
        }
        Promise.all(promises).then(async () => {
            alldone = true;
            if(funcptr != undefined && functpr != null) {
                await funcptr(cmder);
            }
        });
        while(alldone == false) {
            await msleep(100);
        }
        return true;
    } catch(error) {
        let action = `Action: procRemoveOperator`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        return false;
    }
}

/**
 * @notice 물류사의 부가정보들을 설정한다.
 * @dev 부가정보: 물류사 이름 / 물류사 URL / 물류사 수취인주소
 * @param {string} keystore keystore object(json format)
 * @param {string} passwd keystore password
 * @param {string} params parameters ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procSetCompanyInfo.json )
 * @param {pointer} funcptr 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {number} gasprice GAS 가격 (wei단위), 디폴트 = 0
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procSetCompanyInfo = async function(keystore, passwd, params, funcptr, gasprice = 0) {
    try {
        if(params.operation != 'procSetCompanyInfo') {
            throw new Error('params: Invalid Operation');
        }
        if(params.data == undefined || params.data == null || params.data == 'none') {
            Log('WARN', `Not found Data to procSetCompanyInfo!`);
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
        let promises = new Array();
        let alldone = false;
        if(name != undefined) {
            let promise = setName(company, cmder, privkey, name, nonce, gasprice).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == transaction hash
                    let action = `SET-NAME done!\n` +
                    `- [NAME]:   [${colors.blue(name)}],\n` +
                    `=>[TXHASH]: [${colors.green(ret)}]`;
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
                    `- [URL]:    [${colors.blue(url)}],\n` +
                    `=>[TXHASH]: [${colors.green(ret)}]`;
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
                    `- [RECIPIENT]: [${colors.blue(recipient)}],\n` +
                    `=>[TXHASH]:    [${colors.green(ret)}]`;
                    Log('DEBUG', `${action}`);
                }
            });
            promises.push(promise);
        }
        Promise.all(promises).then(async () => {
            alldone = true;
            if(funcptr != undefined && functpr != null) {
                await funcptr(cmder);
            }
        });
        while(alldone == false) {
            await msleep(100);
        }
        return true;
    } catch(error) {
        let action = `Action: procSetCompanyInfo`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        return false;
    }
}

/**
 * @notice 물류사 컨트랙트 deploy를 수행한다.
 * @param {string} keystore keystore object(json format)
 * @param {string} passwd keystore password
 * @param {string} params parameters ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procDeployCompany.json )
 * @param {pointer} funcptr 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {number} gasprice GAS 가격 (wei단위), 디폴트 = 0
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procDeployCompany = async function(keystore, passwd, params, funcptr, gasprice = 0) {
    try {
        if(params.operation != 'procDeployCompany') {
            throw new Error('params: Invalid Operation');
        }
        if(params.data == undefined || params.data == null || params.data == 'none') {
            Log('WARN', `Not found Data to DeployCompany!`);
            return true;
        }
        let service = params.data.service;
        let name = params.data.name;
        let url = params.data.url;
        let recipient = params.data.recipient;
        let account = await web3.eth.accounts.decrypt(keystore, passwd);
        let cmder = account.address;
        let privkey = account.privateKey.split('0x')[1];
        let nonce = await web3.eth.getTransactionCount(cmder);
        let promises = new Array(); // 프로미스 병렬처리를 위한 배열
        let alldone = false;
        for(let i = 0; i < 1; i++, nonce++) {
            let promise = deployCompany(cmder, privkey, name, url, recipient, service, nonce, gasprice).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == contract address
                    let action = `COMPANY DEPLOY done!\n` +
                    `- [COMPANY]:     [${colors.blue(name)}],\n` +
                    `=>[ADDRESS]:     [${colors.green(ret[0])}],\n` +
                    `=>[BLOCKNUMBER]: [${colors.green(ret[1])}]`;
                    Log('DEBUG', `${action}`);
                }
            });
            promises.push(promise);
        }
        Promise.all(promises).then(async () => {
            alldone = true;
            if(funcptr != undefined && functpr != null) {
                await funcptr(cmder);
            }
        });
        while(alldone == false) {
            await msleep(100);
        }
        return true;
    } catch(error) {
        let action = `Action: procDeployCompany`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        return false;
    }
}