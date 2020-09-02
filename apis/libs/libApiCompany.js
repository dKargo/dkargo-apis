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

const colors = require('colors/safe'); // 콘솔 Color 출력
const web3 = require('../../libs/Web3.js').prov2; // web3 provider (order는 privnet(chain2)에 deploy됨)
const millisleep = require('../../libs/libCommon.js').delay; // milli-second sleep 함수 (promise 수행완료 대기용)
const Log = require('../../libs/libLog.js').Log; // 로그 출력
const launch = require('../../libs/libDkargoCompany.js').launch; // launch: 주문 접수 함수
const updateOrder = require('../../libs/libDkargoCompany.js').updateOrderCode; // updateOrder: 주문 상태갱신 함수
const addOperator = require('../../libs/libDkargoCompany.js').addOperator; // addOperator: 관리자 등록 함수
const removeOperator = require('../../libs/libDkargoCompany.js').removeOperator; // removeOperator: 관리자 등록해제 함수
const deployCompany = require('../../libs/libDkargoCompany.js').deployCompany; // deployCompany: 물류사 컨트랙트 deploy 함수

/**
 * @notice 주문을 접수한다.
 * @param {string} keystore keystore object(json format)
 * @param {string} passwd keystore password
 * @param {string} params parameters ( @see https://github.com/hlib-master/dkargo-scm/tree/master/apis/docs/protocols/procLaunch.json )
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procLaunch = async function(keystore, passwd, params) {
    try {
        if(params.operation != 'procLaunch') {
            throw new Error('params: Invalid Operation');
        }
        if(params.data == 'none') {
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
            let promise = launch(company, cmder, privkey, orders[i].addr, orders[i].transportid, nonce).then(async (ret) => {
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
        Promise.all(promises).then(async (data) => {
            alldone = true;
        });
        while(alldone == false) {
            await millisleep(100);
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
 * @param {string} params parameters ( @see https://github.com/hlib-master/dkargo-scm/tree/master/apis/docs/protocols/procUpdateOrder.json )
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procUpdateOrder = async function(keystore, passwd, params) {
    try {
        if(params.operation != 'procUpdateOrder') {
            throw new Error('params: Invalid Operation');
        }
        if(params.data == 'none') {
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
            let promise = updateOrder(company, cmder, privkey, orders[i].addr, orders[i].transportid, orders[i].code, nonce).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == transaction hash
                    let action = `UPDATE done!\n` +
                    `- [ORDER]:  [${colors.blue(orders[i].addr)}],\n` +
                    `- [TID]:    [${colors.blue(orders[i].transportid)}],\n` +
                    `- [CODE]:   [${colors.blue(orders[i].code)}],\n` +
                    `=>[TXHASH]: [${colors.green(ret)}]`;
                    Log('DEBUG', `${action}`);
                }
            });
            promises.push(promise);
        }
        Promise.all(promises).then(async (data) => {
            alldone = true;
        });
        while(alldone == false) {
            await millisleep(100);
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
 * @param {string} params parameters ( @see https://github.com/hlib-master/dkargo-scm/tree/master/apis/docs/protocols/procAddOperator.json )
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procAddOperator = async function(keystore, passwd, params) {
    /* not implement */
}

/**
 * @notice 관리자에서 제거한다.
 * @param {string} keystore keystore object(json format)
 * @param {string} passwd keystore password
 * @param {string} params parameters ( @see https://github.com/hlib-master/dkargo-scm/tree/master/apis/docs/protocols/procRemoveOperator.json )
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procRemoveOperator = async function(keystore, passwd, params) {
    /* not implement */
}

/**
 * @notice 물류사 컨트랙트 deploy를 수행한다.
 * @param {string} keystore keystore object(json format)
 * @param {string} passwd keystore password
 * @param {string} params parameters ( @see https://github.com/hlib-master/dkargo-scm/tree/master/apis/docs/protocols/procDeployCompany.json )
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procDeployCompany = async function(keystore, passwd, params) {
    try {
        if(params.operation != 'procDeployCompany') {
            throw new Error('params: Invalid Operation');
        }
        if(params.data == 'none') {
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
        await deployCompany(cmder, privkey, name, url, recipient, service, nonce).then(async (ret) => {
            if(ret != null) { // 정상수행: ret == contract address
                let action = `COMPANY DEPLOY done!\n` +
                `- [COMPANY]:     [${colors.blue(name)}],\n` +
                `=>[ADDRESS]:     [${colors.green(ret[0])}],\n` +
                `=>[BLOCKNUMBER]: [${colors.green(ret[1])}]`;
                Log('DEBUG', `${action}`);
            }
        });
        return true;
    } catch(error) {
        let action = `Action: procDeployCompany`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        return false;
    }
}