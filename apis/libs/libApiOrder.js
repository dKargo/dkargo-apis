/**
 * @file libApiOrder.js
 * @notice 주문 API 정의
 * @dev 화주 Action
 * - 주문 생성 (주문 컨트랙트 deploy)
 * - 주문 요청
 * @author jhhong
 */

//// COMMON
const colors = require('colors/safe'); // 콘솔 Color 출력

//// LIBs
const Log         = require('../../libs/libLog.js').Log; // 로그 출력
const millisleep  = require('../../libs/libCommon.js').delay; // milli-second sleep 함수 (promise 수행완료 대기용)
const submitOrder = require('../../libs/libDkargoOrder.js').submitOrderCreate; // launch: 주문 요청 함수
const deployOrder = require('../../libs/libDkargoOrder.js').deployOrder; // deployOrder: 주문 컨트랙트 deploy 함수

//// WEB3
const web3 = require('../../libs/Web3.js').prov2; // web3 provider (order는 privnet(chain2)에 deploy됨)

/**
 * @notice 주문을 요청한다.
 * @param {string} keystore keystore object(json format)
 * @param {string} passwd keystore password
 * @param {string} params parameters ( @see https://github.com/hlib-master/dkargo-scm/tree/master/apis/docs/protocols/procSubmitOrder.json )
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procSubmitOrder = async function(keystore, passwd, params) {
    try {
        if(params.operation != 'procSubmitOrder') {
            throw new Error('params: Invalid Operation');
        }
        if(params.data == undefined || params.data == null || params.data == 'none') {
            Log('WARN', `Not found Data to SubmitOrder!`);
            return true;
        }
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
            let promise = submitOrder(orders[i].addr, cmder, privkey, nonce).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == transaction hash
                    let action = `SUBMIT-ORDER done!\n` +
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
        let action = `Action: procSubmitOrder`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        return false;
    }
}

/**
 * @notice 주문 컨트랙트 디플로이를 수행한다.
 * @param {string} keystore keystore object(json format)
 * @param {string} passwd keystore password
 * @param {string} params parameters ( @see https://github.com/hlib-master/dkargo-scm/tree/master/apis/docs/protocols/procDeployOrder.json )
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procDeployOrder = async function(keystore, passwd, params) {
    try {
        if(params.operation != 'procDeployOrder') {
            throw new Error('params: Invalid Operation');
        }
        if(params.data == undefined || params.data == null || params.data == 'none') {
            Log('WARN', `Not found Data to DeployOrder!`);
            return true;
        }
        let service = params.data.service; // 서비스 컨트랙트 주소
        let orders = params.data.orders; // 주문 리스트
        let ordercnt = params.data.count; // 주문 리스트 개수
        if(orders.length != ordercnt) {
            throw new Error('params: Invalid Data: OrderCount');
        }
        let account = await web3.eth.accounts.decrypt(keystore, passwd);
        let cmder = account.address;
        let privkey = account.privateKey.split('0x')[1];
        let nonce = await web3.eth.getTransactionCount(cmder);
        let promises = new Array(); // 프로미스 병렬처리를 위한 배열
        let alldone = false;
        for(let i = 0; i < ordercnt; i++, nonce++) {
            let url = orders[i].url; // 주문 상세정보 URL
            let sectioncnt = orders[i].count; // 배송구간 개수
            let sections = orders[i].sections; // 배송구간 정보
            if(sections.length != sectioncnt) {
                throw new Error(`params: Invalid Data: Order[${i}]'s Section Count`);
            }
            let members    = new Array(sectioncnt); // 멤버 리스트: 화주+물류사
            let codes      = new Array(sectioncnt); // 배송코드 리스트
            let incentives = new Array(sectioncnt); // 인센티브 리스트
            for(let j = 0; j < sectioncnt; j++) {
                members[j]    = sections[j].addr;
                codes[j]      = sections[j].code;
                incentives[j] = sections[j].incentive;
            }
            let promise = deployOrder(cmder, privkey, url, service, members, codes, incentives, nonce).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == contract address
                    let action = `ORDER DEPLOY done!\n` +
                    `- [URL]:         [${colors.blue(url)}],\n` +
                    `=>[ADDRESS]:     [${colors.green(ret[0])}],\n` +
                    `=>[BLOCKNUMBER]: [${colors.green(ret[1])}]`;
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
        let action = `Action: procDeployOrder`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        return false;
    }
}