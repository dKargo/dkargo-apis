/**
 * @file libApiAdmin.js
 * @notice 관리자 API 정의
 * @dev 관리자 Action
 * - 물류사 등록 (staking 시나리오에 따라 없어질 수 있음)
 * - 물류사 등록해제 (staking 시나리오에 따라 없어질 수 있음)
 * - 인센티브 정산
 * - 서비스 컨트랙트 deploy
 * @author jhhong
 */

//// COMMON
const colors = require('colors/safe'); // 콘솔 Color 출력

//// LIBs
const Log            = require('../../libs/libLog.js').Log; // 로그 출력
const millisleep     = require('../../libs/libCommon.js').delay; // milli-second sleep 함수 (promise 수행완료 대기용)
const register       = require('../../libs/libDkargoService.js').register; // register: 물류사 등록 함수
const unregister     = require('../../libs/libDkargoService.js').unregister; // unregister: 물류사 등록해제 함수
const markOrderPayed = require('../../libs/libDkargoService.js').markOrderPayed; // markOrderPayed: 주문 결제확인 표시 함수
const deployService  = require('../../libs/libDkargoService.js').deployService; // deployService: 서비스 컨트랙트 deploy 함수

//// WEB3
const web3 = require('../../libs/Web3.js').prov2; // web3 provider (order는 privnet(chain2)에 deploy됨)

/**
 * @notice 물류사를 등록한다.
 * @param {string} keystore keystore object(json format)
 * @param {string} passwd keystore password
 * @param {string} params parameters ( @see https://github.com/hlib-master/dkargo-scm/tree/master/apis/docs/protocols/procRegister.json )
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procRegister = async function(keystore, passwd, params) {
    try {
        if(params.operation != 'procRegister') {
            throw new Error('params: Invalid Operation');
        }
        if(params.data == undefined || params.data == null || params.data == 'none') {
            Log('WARN', `Not found Data to Register!`);
            return true;
        }
        let service = params.data.service;
        let companies = params.data.companies;
        let count = params.data.count;
        if(companies.length != count) {
            throw new Error('params: Invalid Data: Count');
        }
        let account = await web3.eth.accounts.decrypt(keystore, passwd);
        let cmder = account.address;
        let privkey = account.privateKey.split('0x')[1];
        let nonce = await web3.eth.getTransactionCount(cmder);
        let promises = new Array(); // 프로미스 병렬처리를 위한 배열
        let alldone = false;
        for(let i = 0; i < count; i++, nonce++) {
            let promise = register(service, cmder, privkey, companies[i].addr, nonce).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == transaction hash
                    let action = `REGISTER done!\n` +
                    `- [COMPANY]: [${colors.blue(companies[i].addr)}],\n` +
                    `=>[TXHASH]:  [${colors.green(ret)}]`;
                    Log('DEBUG', `${action}`);
                }
            });
            promises.push(promise);
        }
        Promise.all(promises).then(async () => {
            alldone = true;
        });
        while(alldone == false) {
            await millisleep(100);
        }
        return true;
    } catch(error) {
        let action = `Action: procRegister`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        return false;
    }
}

/**
 * @notice 물류사를 등록해제한다.
 * @param {string} keystore keystore object(json format)
 * @param {string} passwd keystore password
 * @param {string} params parameters ( @see https://github.com/hlib-master/dkargo-scm/tree/master/apis/docs/protocols/procUnregister.json )
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procUnregister = async function(keystore, passwd, params) {
    try {
        if(params.operation != 'procUnregister') {
            throw new Error('params: Invalid Operation');
        }
        if(params.data == undefined || params.data == null || params.data == 'none') {
            Log('WARN', `Not found Data to Unregister!`);
            return true;
        }
        let service = params.data.service;
        let companies = params.data.companies;
        let count = params.data.count;
        if(companies.length != count) {
            throw new Error('params: Invalid Data: Count');
        }
        let account = await web3.eth.accounts.decrypt(keystore, passwd);
        let cmder = account.address;
        let privkey = account.privateKey.split('0x')[1];
        let nonce = await web3.eth.getTransactionCount(cmder);
        for(let i = 0; i < count; i++, nonce++) {
            unregister(service, cmder, privkey, companies[i], nonce).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == transaction hash
                    let action = `UNREGISTER done!\n` +
                    `- [COMPANY]: [${colors.blue(companies[i].addr)}],\n` +
                    `=>[TXHASH]:  [${colors.green(ret)}]`;
                    Log('DEBUG', `${action}`);
                }
            });
        }
        return true;
    } catch(error) {
        let action = `Action: procRegister`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        return false;
    }
}

/**
 * @notice 결제된 주문리스트들을 "결제됨"으로 표시한다.
 * @param {string} keystore keystore object(json format)
 * @param {string} passwd keystore password
 * @param {string} params parameters ( @see https://github.com/hlib-master/dkargo-scm/tree/master/apis/docs/protocols/procMarkOrderPayed.json )
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procMarkOrderPayed = async function(keystore, passwd, params) {
    try {
        if(params.operation != 'procMarkOrderPayed') {
            throw new Error('params: Invalid Operation');
        }
        if(params.data == undefined || params.data == null || params.data == 'none') {
            Log('WARN', `Not found Data to MarkOrderPayed!`);
            return true;
        }
        let service = params.data.service;
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
            let promise = markOrderPayed(service, cmder, privkey, orders[i].addr, nonce).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == transaction hash
                    let action = `MARK-ORDER-PAYED done!\n` +
                    `- [ORDER]:  [${colors.blue(orders[i].addr)}],\n` +
                    `=>[TXHASH]: [${colors.green(ret)}]`;
                    Log('DEBUG', `${action}`);
                }
            });
            promises.push(promise);
        }
        Promise.all(promises).then(async () => {
            alldone = true;
        });
        while(alldone == false) {
            await millisleep(100);
        }
        return true;
    } catch(error) {
        let action = `Action: procMarkOrderPayed`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        return false;
    }
}

/**
 * @notice 인센티브를 정산한다.
 * @param {string} keystore keystore object(json format)
 * @param {string} passwd keystore password
 * @param {string} params parameters ( @see https://github.com/hlib-master/dkargo-scm/tree/master/apis/docs/protocols/procSettlement.json )
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procSettlement = async function(keystore, passwd, params) {
    /* not implement */
}

/**
 * @notice 서비스 컨트랙트 디플로이를 수행한다.
 * @param {string} keystore keystore object(json format)
 * @param {string} passwd keystore password
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procDeployService = async function(keystore, passwd) {
    try {
        let account = await web3.eth.accounts.decrypt(keystore, passwd);
        let cmder = account.address;
        let privkey = account.privateKey.split('0x')[1];
        let nonce = await web3.eth.getTransactionCount(cmder);
        return deployService(cmder, privkey, nonce).then(async (ret) => {
            if(ret != null) { // 정상수행: ret == contract address
                let action = `SERVICE DEPLOY done!\n` +
                `=>[ADDRESS]:     [${colors.green(ret[0])}]\n` +
                `=>[BLOCKNUMBER]: [${colors.green(ret[1])}]`;
                Log('DEBUG', `${action}`);
            }
            return true;
        });
    } catch(error) {
        let action = `Action: procDeployService`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        return false;
    }
}