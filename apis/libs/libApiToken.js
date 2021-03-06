/**
 * @file libApiToken.js
 * @notice 토큰 API 정의
 * @dev 토큰 Action
 * - 송금 (transfer)
 * - 토큰 컨트랙트 deploy
 * - 차후 반영: 대리송금, 위임, 소각
 * @author jhhong
 */

//// WEB3
const web3 = require('../../libs/Web3.js').prov1; // web3 provider (token mainnet(chain1)에 deploy됨)
//// LOGs
const Log = require('../../libs/libLog.js').Log; // 로그 출력
//// LOG COLOR (console)
const RED   = require('../../libs/libLog.js').consoleRed; // 콘솔 컬러 출력: RED
const GREEN = require('../../libs/libLog.js').consoleGreen;
const BLUE  = require('../../libs/libLog.js').consoleBlue;
//// LIBs (libDkargoToken)
const approve     = require('../../libs/libDkargoToken.js').approve; // approve: 토큰 위임 함수
const burn        = require('../../libs/libDkargoToken.js').burn; // burn: 토큰 소각 함수
const transfer    = require('../../libs/libDkargoToken.js').transfer; // transfer: 토큰 송금 함수
const deployToken = require('../../libs/libDkargoToken.js').deployToken; // deployToken: 토큰 컨트랙트 deploy 함수
//// LIBs (etc)
const libCommon = require('../../libs/libCommon.js'); // Common Libarary


/**
 * @notice 토큰을 위임한다.
 * @param {string}  keystore  keystore object(json format)
 * @param {string}  passwd    keystore password
 * @param {object}  params    parameters ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procTokenApprove.json )
 * @param {pointer} cbptrPre  프로시져 시작 시 호출될 콜백함수 포인터
 * @param {pointer} cbptrPost 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {number}  gasprice  GAS 가격 (wei단위), 디폴트 = 0
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procTokenApprove = async function(keystore, passwd, params, cbptrPre, cbptrPost, gasprice = 0) {
    try {
        if(params.operation != 'procTokenApprove') {
            throw new Error('params: Invalid Operation');
        }
        if(params.data == undefined || params.data == null || params.data == 'none') {
            Log('WARN', `Not found Data to Transfer!`);
            return true;
        }
        let token = params.data.token;
        let approvals = params.data.approvals;
        let count = params.data.count;
        if(approvals.length != count) {
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
            let promise = approve(token, cmder, privkey, approvals[i].addr, approvals[i].amount, nonce, gasprice).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == transaction hash
                    let action = `APPROVE done!\n` +
                    `- [TO]:     [${BLUE(approvals[i].addr)}],\n` +
                    `- [AMOUNT]: [${BLUE(approvals[i].amount)}],\n` +
                    `=>[TXHASH]: ['${GREEN(ret)}']`;
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
        let action = `Action: procTokenApprove`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return false;
    }
}

/**
 * @notice 토큰을 소각한다.
 * @param {string}  keystore  keystore object(json format)
 * @param {string}  passwd    keystore password
 * @param {object}  params    parameters ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procTokenBurn.json )
 * @param {pointer} cbptrPre  프로시져 시작 시 호출될 콜백함수 포인터
 * @param {pointer} cbptrPost 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {number}  gasprice  GAS 가격 (wei단위), 디폴트 = 0
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procTokenBurn = async function(keystore, passwd, params, cbptrPre, cbptrPost, gasprice = 0) {
    try {
        if(params.operation != 'procTokenBurn') {
            throw new Error('params: Invalid Operation');
        }
        if(params.data == undefined || params.data == null || params.data == 'none') {
            Log('WARN', `Not found Data to Transfer!`);
            return true;
        }
        let token = params.data.token;
        let amount = params.data.amount;
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
            let promise = burn(token, cmder, privkey, amount, nonce, gasprice).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == transaction hash
                    let action = `BURN done!\n` +
                    `- [AMOUNT]: [${BLUE(amount)}],\n` +
                    `=>[TXHASH]: ['${GREEN(ret)}']`;
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
        let action = `Action: procTokenBurn`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return false;
    }
}

/**
 * @notice 토큰을 송금한다.
 * @param {string}  keystore  keystore object(json format)
 * @param {string}  passwd    keystore password
 * @param {object}  params    parameters ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procTokenTransfer.json )
 * @param {pointer} cbptrPre  프로시져 시작 시 호출될 콜백함수 포인터
 * @param {pointer} cbptrPost 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {number}  gasprice  GAS 가격 (wei단위), 디폴트 = 0
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procTokenTransfer = async function(keystore, passwd, params, cbptrPre, cbptrPost, gasprice = 0) {
    try {
        if(params.operation != 'procTokenTransfer') {
            throw new Error('params: Invalid Operation');
        }
        if(params.data == undefined || params.data == null || params.data == 'none') {
            Log('WARN', `Not found Data to Transfer!`);
            return true;
        }
        let token = params.data.token;
        let remittances = params.data.remittances;
        let count = params.data.count;
        if(remittances.length != count) {
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
            let promise = transfer(token, cmder, privkey, remittances[i].addr, remittances[i].amount, nonce, gasprice).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == transaction hash
                    let action = `TRANSFER done!\n` +
                    `- [TO]:     [${BLUE(remittances[i].addr)}],\n` +
                    `- [AMOUNT]: [${BLUE(remittances[i].amount)}],\n` +
                    `=>[TXHASH]: ['${GREEN(ret)}']`;
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
        let action = `Action: procTokenTransfer`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return false;
    }
}

/**
 * @notice 토큰 컨트랙트 디플로이를 수행한다.
 * @param {string}  keystore  keystore object(json format)
 * @param {string}  passwd    keystore password
 * @param {object}  params    parameters ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procTokenDeploy.json )
 * @param {pointer} cbptrPre  프로시져 시작 시 호출될 콜백함수 포인터
 * @param {pointer} cbptrPost 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {number}  gasprice  GAS 가격 (wei단위), 디폴트 = 0
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procTokenDeploy = async function(keystore, passwd, params, cbptrPre, cbptrPost, gasprice = 0) {
    try {
        if(params.data == undefined || params.data == null || params.data == 'none') {
            Log('WARN', `Not found Data to DeployToken!`);
            return true;
        }
        let result  = null; // deploy된 token contract 정보를 담을 변수
        let account = await web3.eth.accounts.decrypt(keystore, passwd);
        let cmder = account.address;
        let privkey = account.privateKey.split('0x')[1];
        let name = params.data.name;
        let symbol = params.data.symbol;
        let supply = params.data.supply;
        let nonce = await web3.eth.getTransactionCount(cmder);
        let alldone = false; // 본 함수가 호출되면 무조건 libs function이 호출되므로 alldone을 false로 초기화
        if(cbptrPre != undefined && cbptrPre != null) {
            await cbptrPre(cmder); // 콜백함수 포인터가 정상적일 경우, 호출
        }
        let promises = new Array(); // 프로미스 병렬처리를 위한 배열
        for(let i = 0; i < 1; i++, nonce++) {
            let promise = deployToken(cmder, privkey, name, symbol, supply, nonce, gasprice).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == contract address
                    result = new Object();
                    result.address  = ret[0];
                    result.blocknum = ret[1];
                    Log('DEBUG', `TOKEN DEPLOY done!`);
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
        let action = `Action: procTokenDeploy`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return false;
    }
}