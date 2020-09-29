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

//// CONSTANTS
const ZEROADDR = require('../../libs/libCommon.js').ZEROADDR; // ZERO-ADDRESS 상수
//// WEB3
const web3           = require('../../libs/Web3.js').prov2; // web3 provider (order는 privnet(chain2)에 deploy됨)
const isSameProvider = require('../../libs/Web3.js').isSameProvider; // tokennet / logisticsnet PROVIDER가 동일한 PROVIDER인지 체크
//// LOGs
const Log = require('../../libs/libLog.js').Log; // 로그 출력
//// LOG COLOR (console)
const RED   = require('../../libs/libLog.js').consoleRed; // 콘솔 컬러 출력: RED
const GREEN = require('../../libs/libLog.js').consoleGreen; // 콘솔 컬러 출력: GREEN
const BLUE  = require('../../libs/libLog.js').consoleBlue; // 콘솔 컬러 출력: BLUE
//// LIBs (libCommon)
const msleep = require('../../libs/libCommon.js').delay; // milli-second sleep 함수 (promise 수행완료 대기용)
//// LIBs (libDkargoService)
const register       = require('../../libs/libDkargoService.js').register; // register: 물류사 등록 함수
const unregister     = require('../../libs/libDkargoService.js').unregister; // unregister: 물류사 등록해제 함수
const markOrderPayed = require('../../libs/libDkargoService.js').markOrderPayed; // markOrderPayed: 주문 결제확인 함수
const settle         = require('../../libs/libDkargoService.js').settle; // settle: 인센티브 정산 함수
const firstRecipient = require('../../libs/libDkargoService.js').firstRecipient; // firstRecipient: 첫번째 인센티브 수령자 주소 획득함수
const incentives     = require('../../libs/libDkargoService.js').incentives; // incentives: 인센티브 보유량 획득함수
const nextRecipient  = require('../../libs/libDkargoService.js').nextRecipient; // nextRecipient: 다음 인센티브 수령자 주소 획득함수
const recipientCount = require('../../libs/libDkargoService.js').recipientCount; // recipientCount: 인센티브 수령자 총 카운트 획득함수
const deployService  = require('../../libs/libDkargoService.js').deployService; // deployService: 서비스 컨트랙트 deploy 함수
//// LIBs (libDkargoToken)
const transfer = require('../../libs/libDkargoToken.js').transfer; // transfer: 토큰 전송 함수

/**
 * @notice 물류사를 등록한다.
 * @param {string} keystore keystore object(json format)
 * @param {string} passwd keystore password
 * @param {object} params parameters ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procAdminRegisterCompanies.json )
 * @param {pointer} cbptrPre 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {pointer} cbptrPost 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {number} gasprice GAS 가격 (wei단위), 디폴트 = 0
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procAdminRegisterCompanies = async function(keystore, passwd, params, cbptrPre, cbptrPost, gasprice = 0) {
    try {
        if(params.operation != 'procAdminRegisterCompanies') {
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
            let promise = register(service, cmder, privkey, companies[i].addr, nonce, gasprice).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == transaction hash
                    let action = `REGISTER done!\n` +
                    `- [COMPANY]: [${BLUE(companies[i].addr)}],\n` +
                    `=>[TXHASH]:  [${GREEN(ret)}]`;
                    Log('DEBUG', `${action}`);
                }
            });
            promises.push(promise);
        }
        Promise.all(promises).then(async () => {
            alldone = true;
            console.log(cmder);
            if(cbptrPost != undefined && cbptrPost != null) {
                await cbptrPost(cmder);
            }
        });
        while(alldone == false) {
            await msleep(10);
        }
        return true;
    } catch(error) {
        let action = `Action: procAdminRegisterCompanies`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return false;
    }
}

/**
 * @notice 물류사를 등록해제한다.
 * @param {string}  keystore keystore object(json format)
 * @param {string}  passwd keystore password
 * @param {object}  params parameters ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procAdminUnregisterCompanies.json )
 * @param {pointer} cbptrPre 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {pointer} cbptrPost 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {number}  gasprice GAS 가격 (wei단위), 디폴트 = 0
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procAdminUnregisterCompanies = async function(keystore, passwd, params, cbptrPre, cbptrPost, gasprice = 0) {
    try {
        if(params.operation != 'procAdminUnregisterCompanies') {
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
            let promise = unregister(service, cmder, privkey, companies[i].addr, nonce, gasprice).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == transaction hash
                    let action = `UNREGISTER done!\n` +
                    `- [COMPANY]: [${BLUE(companies[i].addr)}],\n` +
                    `=>[TXHASH]:  [${GREEN(ret)}]`;
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
            await msleep(10);
        }
        return true;
    } catch(error) {
        let action = `Action: procAdminRegisterCompanies`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return false;
    }
}

/**
 * @notice 결제된 주문리스트들을 "결제됨"으로 표시한다.
 * @param {string}  keystore keystore object(json format)
 * @param {string}  passwd keystore password
 * @param {object}  params parameters ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procAdminMarkOrderPayments.json )
 * @param {pointer} cbptrPre 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {pointer} cbptrPost 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {number}  gasprice GAS 가격 (wei단위), 디폴트 = 0
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procAdminMarkOrderPayments = async function(keystore, passwd, params, cbptrPre, cbptrPost, gasprice = 0) {
    try {
        if(params.operation != 'procAdminMarkOrderPayments') {
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
            let promise = markOrderPayed(service, cmder, privkey, orders[i].addr, nonce, gasprice).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == transaction hash
                    let action = `MARK-ORDER-PAYED done!\n` +
                    `- [ORDER]:  [${BLUE(orders[i].addr)}],\n` +
                    `=>[TXHASH]: [${GREEN(ret)}]`;
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
            await msleep(10);
        }
        return true;
    } catch(error) {
        let action = `Action: procAdminMarkOrderPayments`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return false;
    }
}

/**
 * @notice 계정별 정산되어야 할 인센티브 값을 구하여 TOKENNET에서 실제 DKA를 해당 계정으로 전송한다.
 * @param {string} service 서비스 컨트랙트 주소
 * @param {string} token 토큰 컨트랙트 주소
 * @param {string} from 인센티브 정산자 (디카르고 관리자)
 * @param {string} privkey from의 privkey
 * @param {number} nonce from의 nonce값 (TOKENNET에서의 NONCE)
 * @param {number} gasprice GAS 가격 (wei단위), 디폴트 = 0
 * @return "인센티브 정산" 수행되어야 할 계정 리스트 (settle() 호출이 일어나야 할 계정 리스트), 예외상황 발생시 null 반환
 * @author jhhong
 */
let transferIncentives = async function(service, token, from, privkey, nonce, gasprice = 0) {
    try {
        let settles  = new Array(); // 반환값(계정 리스트)이 담길 배열
        let promises = new Array(); // 프로미스 병렬처리를 위한 배열
        let alldone  = true; // 흐름제어용 변수, 초기값 = 0: transfer 호출이 일어나지 않아 alldone값 변경이 일어나지 않을 경우에 대한 예외처리
        for(let addr = await firstRecipient(service); addr != ZEROADDR; addr = await nextRecipient(service, addr)) {
            let amount = (await incentives(service, addr))[1]; // "addr"가 정산받아야 할 인센티브 양
            if(amount == 0) { // 이번에 정산받아야 할 금액이 없는 경우
                settles.push(addr); // 계정 리스트에 추가 (transfer()는 수행되지 않음)
            } else { // 이번에 정산받아야 할 금액이 있는 경우
                if (alldone == true) {
                    alldone = false; // transfer 호출이 일어남, alldone을 false로 두어 아래의 Waiting Code를 활성화 시킨다.
                }
                let promise = transfer(token, from, privkey, addr, amount, nonce, gasprice).then(async (hash) => {
                    if(hash != null) { // transfer가 정상 처리되었을 경우
                        settles.push(addr); // 반환값 배열에 계정주소를 추가한다.
                    }
                });
                promises.push(promise); // PROMISE 처리 완료를 감지하기 위해 promises 배열에 추가한다.
                nonce++
            }
        }
        Promise.all(promises).then(async () => {
            alldone = true;
        });
        while(alldone == false) {
            await msleep(10);
        }
        return settles;
    } catch(error) {
        let action = `Action: transferIncentives`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return null;
    }
}

/**
 * @notice LOGISTICSNET에서 "인센티브 정산" 수행 결과를 갱신한다.
 * @param {string} service 서비스 컨트랙트 주소
 * @param {string} from 인센티브 정산자 (디카르고 관리자)
 * @param {string} privkey from의 privkey
 * @param {array}  recipients 인센티브 수신 리스트
 * @param {number} nonce from의 nonce값 (LOGISTICSNET에서의 NONCE)
 * @param {number} gasprice GAS 가격 (wei단위), 디폴트 = 0
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
let settlement = async function(service, from, privkey, recipients, nonce, gasprice = 0) {
    try {
        let promises = new Array(); // 프로미스 병렬처리를 위한 배열
        let alldone  = (recipients != null && recipients.length > 0)? (false) : (true); // 흐름제어용 변수, settle 수행 대상이 있을 경우 false로 설정됨
        for(let idx = 0; idx < recipients.length; idx++, nonce++) {
            let promise = settle(service, from, privkey, recipients[idx], nonce, gasprice);
            promises.push(promise);
        }
        Promise.all(promises).then(async () => {
            alldone = true;
        });
        while(alldone == false) {
            await msleep(10);
        }
        return true;
    } catch(error) {
        let action = `Action: settlement`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return false;
    }
}

/**
 * @notice 인센티브를 정산한다.
 * @param {string} keystore keystore object(json format)
 * @param {string} passwd keystore password
 * @param {object} params parameters ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procAdminSettle.json )
 * @param {pointer} cbptrPre 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {pointer} cbptrPost 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {number} gasprice GAS 가격 (wei단위), 디폴트 = 0
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procAdminSettlement = async function(keystore, passwd, params, cbptrPre, cbptrPost, gasprice = 0) {
    try {
        if(params.operation != 'procAdminSettle') {
            throw new Error('params: Invalid Operation');
        }
        if(params.data == undefined || params.data == null || params.data == 'none') {
            Log('WARN', `Not found Data to Settlement!`);
            return true;
        }
        let service = params.data.service; // 서비스 컨트랙트 주소 획득
        if(await recipientCount(service) == 0) {
            Log('WARN', `No one to get Incentives!`);
            return true;
        }
        let token = params.data.token; // 토큰 컨트랙트 주소 획득
        //// KEYSTORE는 MAINNET / LOGISTICSNET 동일하다는 가정이므로 LOGISTICSNET을 통해 필요정보들을 미리 구해둔다.
        let account = await web3.eth.accounts.decrypt(keystore, passwd);
        let cmder = account.address;
        let privkey = account.privateKey.split('0x')[1];
        if(cbptrPre != undefined && cbptrPre != null) {
            await cbptrPre(cmder); // 콜백함수 포인터가 정상적일 경우, 호출
        }
        let lists = null; // "인센티브 정산" 처리를 수행할 계정 리스트
        if(await isSameProvider() == true) { // TOKENNET과 LOGISTICSNET이 동일 PROVIDER일 경우
            let nonce = await web3.eth.getTransactionCount(cmder); // 동일 PROVIDER이므로 TOKENNET / LOGISTICSNET중 어느 것으로 구해도 관계없음
            lists = await transferIncentives(service, token, cmder, privkey, nonce, gasprice);
        } else { // TOKENNET과 LOGISTICSNET이 다른 PROVIDER일 경우
            const web3Token = require('../../libs/Web3.js').prov1; // TOKENNET의 PROVIDER를 얻어온다.
            let nonce = await web3Token.eth.getTransactionCount(cmder); // TOKENNET의 NONCE값을 얻어온다.
            lists = await transferIncentives(service, token, cmder, privkey, nonce, gasprice);
        }
        let nonce = await web3.eth.getTransactionCount(cmder); // LOGISTICSNET의 NONCE값을 얻어온다.
        if(await settlement(service, cmder, privkey, lists, nonce, gasprice) != true) {
            throw new Error('Settlement Failed!');
        }
        if(cbptrPost != undefined && cbptrPost != null) {
            await cbptrPost(cmder); // Bugfix: cbptrPost 호출 코드가 빠져있었음.
        }
        return true;
    } catch(error) {
        let action = `Action: procAdminSettlement`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return false;
    }
}

/**
 * @notice 서비스 컨트랙트 디플로이를 수행한다.
 * @param {string} keystore keystore object(json format)
 * @param {string} passwd keystore password
 * @param {pointer} cbptrPre 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {pointer} cbptrPost 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {number} gasprice GAS 가격 (wei단위), 디폴트 = 0
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procDeployService = async function(keystore, passwd, cbptrPre, cbptrPost, gasprice = 0) {
    try {
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
            let promise = deployService(cmder, privkey, nonce, gasprice).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == contract address
                    let action = `SERVICE DEPLOY done!\n` +
                    `=>[ADDRESS]:     [${GREEN(ret[0])}]\n` +
                    `=>[BLOCKNUMBER]: [${GREEN(ret[1])}]`;
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
            await msleep(10);
        }
        return true;
    } catch(error) {
        let action = `Action: procDeployService`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return false;
    }
}