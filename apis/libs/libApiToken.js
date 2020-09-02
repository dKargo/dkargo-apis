/**
 * @file libApiToken.js
 * @notice 토큰 API 정의
 * @dev 토큰 Action
 * - 송금 (transfer)
 * - 토큰 컨트랙트 deploy
 * - 차후 반영: 대리송금, 위임, 소각
 * @author jhhong
 */

//// COMMON
const colors = require('colors/safe'); // 콘솔 Color 출력

//// LIBs
const Log          = require('../../libs/libLog.js').Log; // 로그 출력
const millisleep   = require('../../libs/libCommon.js').delay; // milli-second sleep 함수 (promise 수행완료 대기용)
const transfer     = require('../../libs/libDkargoToken.js').transfer; // transfer: 토큰 송금 함수
const deployToken  = require('../../libs/libDkargoToken.js').deployToken; // deployToken: 토큰 컨트랙트 deploy 함수

//// WEB3
const web3 = require('../../libs/Web3.js').prov2; // web3 provider (order는 privnet(chain2)에 deploy됨)

/**
 * @notice 토큰을 송금한다.
 * @param {string} keystore keystore object(json format)
 * @param {string} passwd keystore password
 * @param {string} params parameters ( @see https://github.com/hlib-master/dkargo-scm/tree/master/apis/docs/protocols/procTransfer.json )
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procTransfer = async function(keystore, passwd, params) {
    try {
        if(params.operation != 'procTransfer') {
            throw new Error('params: Invalid Operation');
        }
        if(params.data == 'none') {
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
        let promises = new Array(); // 프로미스 병렬처리를 위한 배열
        let alldone = false;
        for(let i = 0; i < count; i++, nonce++) {
            let promise = transfer(token, cmder, privkey, remittances[i].addr, remittances[i].amount, nonce).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == transaction hash
                    let action = `TRANSFER done!\n` +
                    `- [TO]:     [${colors.blue(remittances[i].addr)}],\n` +
                    `- [AMOUNT]: [${colors.blue(remittances[i].amount)}],\n` +
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
        let action = `Action: procTransfer`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        return false;
    }
}

/**
 * @notice 토큰 컨트랙트 디플로이를 수행한다.
 * @param {string} keystore keystore object(json format)
 * @param {string} passwd keystore password
 * @param {string} params parameters ( @see https://github.com/hlib-master/dkargo-scm/tree/master/apis/docs/protocols/procDeployToken.json )
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procDeployToken = async function(keystore, passwd, params) {
    try {
        if(params.data == 'none') {
            Log('WARN', `Not found Data to DeployToken!`);
            return true;
        }
        let account = await web3.eth.accounts.decrypt(keystore, passwd);
        let cmder = account.address;
        let privkey = account.privateKey.split('0x')[1];
        let name = params.data.name;
        let symbol = params.data.symbol;
        let supply = params.data.supply;
        let nonce = await web3.eth.getTransactionCount(cmder);
        return deployToken(cmder, privkey, name, symbol, supply, nonce).then(async (ret) => {
            if(ret != null) { // 정상수행: ret == contract address
                let action = `TOKEN DEPLOY done!\n` +
                `=>[ADDRESS]:     [${colors.green(ret[0])}]\n` +
                `=>[BLOCKNUMBER]: [${colors.green(ret[1])}]`;
                Log('DEBUG', `${action}`);
            }
            return true;
        });
    } catch(error) {
        let action = `Action: procDeployToken`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        return false;
    }
}