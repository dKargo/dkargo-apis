/**
 * @file libApiOrder.js
 * @notice 주문 API 정의
 * @dev 화주 Action
 * - 주문 생성 (주문 컨트랙트 deploy)
 * - 주문 요청
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
//// LIBs (libDkargoOrder)
const submitOrder = require('../../libs/libDkargoOrder.js').submitOrderCreate; // submitOrderCreate: 주문 요청 함수
const setUrl      = require('../../libs/libDkargoOrder.js').setUrl; // setUrl: 주문 상세정보가 저장된 URL 설정 함수
const deployOrder = require('../../libs/libDkargoOrder.js').deployOrder; // deployOrder: 주문 컨트랙트 deploy 함수
//// LIBs (etc)
const libCommon = require('../../libs/libCommon.js'); // Common Libarary

/**
 * @notice 주문을 요청한다.
 * @param {string}  keystore  keystore object(json format)
 * @param {string}  passwd    keystore password
 * @param {object}  params    parameters ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procOrderSubmit.json )
 * @param {pointer} cbptrPre  프로시져 시작 시 호출될 콜백함수 포인터
 * @param {pointer} cbptrPost 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {number}  gasprice  GAS 가격 (wei단위), 디폴트 = 0
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procOrderSubmit = async function(keystore, passwd, params, cbptrPre, cbptrPost, gasprice = 0) {
    try {
        if(params.operation != 'procOrderSubmit') {
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
            let promise = submitOrder(orders[i].addr, cmder, privkey, nonce, gasprice).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == transaction hash
                    let action = `SUBMIT-ORDER done!\n` +
                    `- [ORDER]:  ['${BLUE(orders[i].addr)}'],\n` +
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
        let action = `Action: procOrderSubmit`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return false;
    }
}

/**
 * @notice 주문의 부가정보들을 설정한다.
 * @dev 부가정보: 주문 상세 URL
 * @param {string}  keystore  keystore object(json format)
 * @param {string}  passwd    keystore password
 * @param {object}  params    parameters ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procOrderSetInfo.json )
 * @param {pointer} cbptrPre  프로시져 시작 시 호출될 콜백함수 포인터
 * @param {pointer} cbptrPost 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {number}  gasprice  GAS 가격 (wei단위), 디폴트 = 0
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procOrderSetInfo = async function(keystore, passwd, params, cbptrPre, cbptrPost, gasprice = 0) {
    try {
        if(params.operation != 'procOrderSetInfo') {
            throw new Error('params: Invalid Operation');
        }
        if(params.data == undefined || params.data == null || params.data == 'none') {
            Log('WARN', `Not found Data to procOrderSetInfo!`);
            return true;
        }
        let order = params.data.order;
        let url = params.data.url;
        let account = await web3.eth.accounts.decrypt(keystore, passwd);
        let cmder = account.address;
        let privkey = account.privateKey.split('0x')[1];
        let nonce = await web3.eth.getTransactionCount(cmder);
        //// 흐름제어 코드
        let alldone = true; // 초기값 = true, libs function 호출이 일어나지 않아 alldone값 변경이 일어나지 않을 경우에 대한 예외처리 코드
        if(url != undefined) { // libs function 호출이 일어날 경우
            alldone = false; // alldone값을 false로 세팅
            if(cbptrPre != undefined && cbptrPre != null) {
                await cbptrPre(cmder); // 콜백함수 포인터가 정상적일 경우, 호출
            }
        }
        let promises = new Array(); // 프로미스 병렬처리를 위한 배열
        if(url != undefined) {
            let promise = setUrl(order, cmder, privkey, url, nonce, gasprice).then(async (ret) => {
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
        let action = `Action: procOrderSetInfo`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return false;
    }
}

/**
 * @notice 주문 컨트랙트 디플로이를 수행한다.
 * @param {string}  keystore  keystore object(json format)
 * @param {string}  passwd    keystore password
 * @param {object}  params    parameters ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procOrderDeploy.json )
 * @param {pointer} cbptrPre  프로시져 시작 시 호출될 콜백함수 포인터
 * @param {pointer} cbptrPost 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {number}  gasprice  GAS 가격 (wei단위), 디폴트 = 0
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procOrderDeploy = async function(keystore, passwd, params, cbptrPre, cbptrPost, gasprice = 0) {
    try {
        if(params.operation != 'procOrderDeploy') {
            throw new Error('params: Invalid Operation');
        }
        if(params.data == undefined || params.data == null || params.data == 'none') {
            throw new Error('WARN', `Not found Data to DeployOrder!`);
        }
        let result  = null; // deploy된 order contract 정보를 담을 변수
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
        //// 흐름제어 코드
        let alldone = true; // 초기값 = true, libs function 호출이 일어나지 않아 alldone값 변경이 일어나지 않을 경우에 대한 예외처리 코드
        if(ordercnt > 0) { // libs function 호출이 일어날 경우
            alldone = false; // alldone값을 false로 세팅
            if(cbptrPre != undefined && cbptrPre != null) {
                await cbptrPre(cmder); // 콜백함수 포인터가 정상적일 경우, 호출
            }
        }
        let idmapper = new Array(); // For Demo (주문 컨트랙트 주소 <-> 물류플랫폼사 주문번호 mapping을 위한 테이블)
        let promises = new Array(); // 프로미스 병렬처리를 위한 배열
        for(let i = 0; i < ordercnt; i++, nonce++) {
            let url = orders[i].url; // 주문 상세정보 URL
            let originId   = orders[i].originId; // For Demo: 물류플랫폼사에서 관리되는 주문번호
            let sectioncnt = orders[i].count; // 배송구간 개수
            let sections   = orders[i].sections; // 배송구간 정보
            if(sections.length != sectioncnt) {
                Log('WARN', `Order:[${i}] missmatch.... sectioncnt:[${sectioncnt}], sections.length:[${sections.length}]`);
                Log('WARN', `....Change value Order:[${i}] sectioncnt [${sectioncnt}] --> [${sections.length}]`);
                sectioncnt = sections.length;
            }
            let members    = new Array(sectioncnt); // 멤버 리스트: 화주+물류사
            let codes      = new Array(sectioncnt); // 배송코드 리스트
            let incentives = new Array(sectioncnt); // 인센티브 리스트
            for(let j = 0; j < sectioncnt; j++) {
                members[j]    = sections[j].addr;
                codes[j]      = sections[j].code;
                incentives[j] = sections[j].incentive;
            }
            Log('DEBUG', `Process to OriginID: ['${originId}']`);
            let promise = deployOrder(cmder, privkey, url, service, members, codes, incentives, nonce, gasprice).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == contract address
                    result = new Object();
                    result.address  = ret[0];
                    result.blocknum = ret[1];
                    Log('DEBUG', `ORDER DEPLOY done!`);
                    Log('DEBUG', `- [URL]:         ['${BLUE (url)}'],`);
                    Log('DEBUG', `=>[ADDRESS]:     ['${GREEN(ret[0])}'],`);
                    Log('DEBUG', `=>[BLOCKNUMBER]: [${GREEN(ret[1])}]`);
                    //// For Demo: dKargo 주문번호 <-> 물류플랫폼사 주문번호 mapping을 위한 코드 ////
                    let idelmt = new Object();
                    idelmt.originId = originId; // 물류플랫폼사 주문번호
                    idelmt.address = ret[0]; // 주문 컨트랙트 주소
                    idelmt.latest = '10'; // 마지막 주문배송 코드: "주문생성(10)"
                    idmapper.push(idelmt);
                }
            });
            promises.push(promise);
        }
        Promise.all(promises).then(async () => {
            alldone = true;
            if(cbptrPost != undefined && cbptrPost != null) {
                await cbptrPost(cmder, idmapper, result);
            }
        });
        while(alldone == false) {
            await libCommon.delay(10);
        }
        return true;
    } catch(error) {
        let action = `Action: procOrderDeploy`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return false;
    }
}

/**
 * @notice 주문 생성을 수행한다.
 * @dev procOrderDeploy + procOrderSubmit 의 역할을 동시 수행
 * @param {string}  keystore  keystore object(json format)
 * @param {string}  passwd    keystore password
 * @param {object}  params    parameters ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procOrderDeploy.json )
 * @param {pointer} cbptrPre  프로시져 시작 시 호출될 콜백함수 포인터
 * @param {pointer} cbptrPost 프로시져 완료 시 호출될 콜백함수 포인터
 * @param {number}  gasprice  GAS 가격 (wei단위), 디폴트 = 0
 * @return bool (true: 정상처리 / false: 비정상수행)
 * @author jhhong
 */
module.exports.procOrderCreate = async function(keystore, passwd, params, cbptrPre, cbptrPost, gasprice = 0) {
    try {
        if(params.operation != 'procOrderDeploy') {
            throw new Error('params: Invalid Operation');
        }
        if(params.data == undefined || params.data == null || params.data == 'none') {
            throw new Error('WARN', `Not found Data to DeployOrder!`);
        }
        let result  = null; // deploy된 order contract 정보를 담을 변수
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
        //// 흐름제어 코드
        let alldone = true; // 초기값 = true, libs function 호출이 일어나지 않아 alldone값 변경이 일어나지 않을 경우에 대한 예외처리 코드
        if(ordercnt > 0) { // libs function 호출이 일어날 경우
            alldone = false; // alldone값을 false로 세팅
            if(cbptrPre != undefined && cbptrPre != null) {
                await cbptrPre(cmder); // 콜백함수 포인터가 정상적일 경우, 호출
            }
        }
        let idmapper  = new Array(); // For Demo (주문 컨트랙트 주소 <-> 물류플랫폼사 주문번호 mapping을 위한 테이블)
        let promises  = new Array(); // 프로미스 병렬처리를 위한 배열
        let contracts = new Array(); // 주문 컨트랙트 주소를 담을 배열
        for(let i = 0; i < ordercnt; i++, nonce++) {
            let url = orders[i].url; // 주문 상세정보 URL
            let originId   = orders[i].originId; // For Demo: 물류플랫폼사에서 관리되는 주문번호
            let sectioncnt = orders[i].count; // 배송구간 개수
            let sections   = orders[i].sections; // 배송구간 정보
            if(sections.length != sectioncnt) {
                Log('WARN', `Order:[${i}] missmatch.... sectioncnt:[${sectioncnt}], sections.length:[${sections.length}]`);
                Log('WARN', `....Change value Order:[${i}] sectioncnt [${sectioncnt}] --> [${sections.length}]`);
                sectioncnt = sections.length;
            }
            let members    = new Array(sectioncnt); // 멤버 리스트: 화주+물류사
            let codes      = new Array(sectioncnt); // 배송코드 리스트
            let incentives = new Array(sectioncnt); // 인센티브 리스트
            for(let j = 0; j < sectioncnt; j++) {
                members[j]    = sections[j].addr;
                codes[j]      = sections[j].code;
                incentives[j] = sections[j].incentive;
            }
            Log('DEBUG', `Process to OriginID: ['${originId}']`);
            let promise = deployOrder(cmder, privkey, url, service, members, codes, incentives, nonce, gasprice).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == contract address
                    result = new Object();
                    result.address  = ret[0];
                    result.blocknum = ret[1];
                    Log('DEBUG', `ORDER DEPLOY done!`);
                    Log('DEBUG', `- [URL]:         ['${BLUE (url)}'],`);
                    Log('DEBUG', `=>[ADDRESS]:     ['${GREEN(ret[0])}'],`);
                    Log('DEBUG', `=>[BLOCKNUMBER]: [${GREEN(ret[1])}]`);
                    contracts.push(ret[0]); // 주문 컨트랙트 주소를 저장 -> Promise.all()에서 각 주문 컨트랙트 주소에 대해 Submit 수행
                    //// For Demo: dKargo 주문번호 <-> 물류플랫폼사 주문번호 mapping을 위한 코드 ////
                    let idelmt = new Object();
                    idelmt.originId = originId; // 물류플랫폼사 주문번호
                    idelmt.address = ret[0]; // 주문 컨트랙트 주소
                    idelmt.latest = '10'; // 마지막 주문배송 코드: "주문생성(10)"
                    for(let i = 0; i < codes.length; i++) {
                        switch(codes[i]) {
                            case '10': idelmt.code10 = i; break;
                            case '20': idelmt.code20 = i; break;
                            case '30': idelmt.code30 = i; break;
                            case '40': idelmt.code40 = i; break;
                            case '60': idelmt.code60 = i; break;
                        }
                    }
                    idelmt.code70 = codes.length;
                    idmapper.push(idelmt);
                }
            });
            promises.push(promise);
        }
        Promise.all(promises).then(async () => {
            alldone = true;
        });
        while(alldone == false) {
            await libCommon.delay(10);
        }
        alldone  = false;
        promises = [];
        for(let i = 0; i < ordercnt; i++, nonce++) {
            let promise = submitOrder(contracts[i], cmder, privkey, nonce, gasprice).then(async (ret) => {
                if(ret != null) { // 정상수행: ret == transaction hash
                    let action = `SUBMIT-ORDER done!\n` +
                    `- [ORDER]:  ['${BLUE(contracts[i])}'],\n` +
                    `=>[TXHASH]: ['${GREEN(ret)}']`;
                    Log('DEBUG', `${action}`);
                }
            });
            promises.push(promise);
        }
        Promise.all(promises).then(async () => {
            alldone = true;
            if(cbptrPost != undefined && cbptrPost != null) {
                await cbptrPost(cmder, idmapper, result);
            }
        });
        while(alldone == false) {
            await libCommon.delay(10);
        }
        return true;
    } catch(error) {
        let action = `Action: procOrderCreate`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return false;
    }
}