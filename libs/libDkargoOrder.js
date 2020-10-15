/**
 * @file libDkargoOrder.js
 * @notice DkargoOrder 컨트랙트 API 정의
 * @dev 선행조건: truffle compile
 * @author jhhong
 */

//// WEB3
const web3   = require('./Web3.js').prov2; // web3 provider (order는 privnet(chain2)에 deploy됨)
const sendTx = require('./Web3.js').prov2SendTx; // 트랜젝션을 생성하여 블록체인에 전송하는 함수
//// GLOBALs
const abi      = require('../build/contracts/DkargoOrder.json').abi; // 컨트랙트 ABI
const bytecode = require('../build/contracts/DkargoOrder.json').bytecode; // 컨트랙트 bytecode
//// LOGs
const Log = require('./libLog.js').Log; // 로그 출력
//// LOG COLOR (console)
const RED  = require('./libLog.js').consoleRed; // 콘솔 컬러 출력: RED
const CYAN = require('./libLog.js').consoleCyan; // 콘솔 컬러 출력: CYAN

/**
 * @notice 주문의 정상 배송완료 여부를 반환한다.
 * @param {string} ca 주문 컨트랙트 주소
 * @return 주문의 정상 배송완료 여부(bool)
 * @author jhhong
 */
module.exports.isComplete = async function(ca) {
    try {
        let order = new web3.eth.Contract(abi, ca);
        return await order.methods.isComplete().call();
    } catch(error) {
        let action = `Action: isComplete
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 주문의 배송실패 여부를 반환한다.
 * @param {string} ca 주문 컨트랙트 주소
 * @return 주문의 배송실패 여부(bool)
 * @author jhhong
 */
module.exports.isFailed = async function(ca) {
    try {
        let order = new web3.eth.Contract(abi, ca);
        return await order.methods.isFailed().call();
    } catch(error) {
        let action = `Action: isFailed
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 주문이 현재 처리되고 있는 구간 인덱스를 얻어온다.
 * @param {string} ca 주문 컨트랙트 주소
 * @return 주문이 현재 처리되고 있는 구간 인덱스
 * @author jhhong
 */
module.exports.currentStep = async function(ca) {
    try {
        let order = new web3.eth.Contract(abi, ca);
        return await order.methods.currentStep().call();
    } catch(error) {
        let action = `Action: currentStep
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 주문이 현재 처리되고 있는 구간의 추적 정보를 얻어온다.
 * @param {string} ca 주문 컨트랙트 주소
 * @return 추적 정보 Object (time:트래킹 시각/addr:트래킹 수행주체/code:배송상태 코드/incentive:배송 인센티브)
 * @author jhhong
 */
module.exports.currentTracking = async function(ca) {
    try {
        let order = new web3.eth.Contract(abi, ca);
        return await order.methods.currentTracking().call();
    } catch(error) {
        let action = `Action: currentTracking
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 주문번호를 얻어온다.
 * @param {string} ca 주문 컨트랙트 주소
 * @return 주문번호(uint256)
 * @author jhhong
 */
module.exports.orderid = async function(ca) {
    try {
        let order = new web3.eth.Contract(abi, ca);
        return await order.methods.orderid().call();
    } catch(error) {
        let action = `Action: orderid
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 서비스 컨트랙트 주소를 얻어온다.
 * @param {string} ca 주문 컨트랙트 주소
 * @return 서비스 컨트랙트 주소(address)
 * @author jhhong
 */
module.exports.service = async function(ca) {
    try {
        let order = new web3.eth.Contract(abi, ca);
        return await order.methods.service().call();
    } catch(error) {
        let action = `Action: service
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 주문의 총 인센티브 합을 얻어온다.
 * @param {string} ca 주문 컨트랙트 주소
 * @return 주문의 총 인센티브 합(uint256)
 * @author jhhong
 */
module.exports.totalIncentive = async function(ca) {
    try {
        let order = new web3.eth.Contract(abi, ca);
        return await order.methods.totalIncentive().call();
    } catch(error) {
        let action = `Action: totalIncentive
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice index에 매핑되는 주문 추적 정보를 얻어온다.
 * @param {string} ca    주문 컨트랙트 주소
 * @param {string} index Traking 인덱스
 * @return 추적 정보 Object (time:트래킹 시각/addr:트래킹 수행주체/code:배송상태 코드/incentive:배송 인센티브)
 * @author jhhong
 */
module.exports.tracking = async function(ca, index) {
    try {
        let order = new web3.eth.Contract(abi, ca);
        return await order.methods.tracking(index).call();
    } catch(error) {
        let action = `Action: tracking
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 주문에 대한 Tracking 총 수를 얻어온다.
 * @param {string} ca 주문 컨트랙트 주소
 * @return Tracking 총 수(uint256)
 * @author jhhong
 */
module.exports.trackingCount = async function(ca) {
    try {
        let order = new web3.eth.Contract(abi, ca);
        return await order.methods.trackingCount().call();
    } catch(error) {
        let action = `Action: trackingCount
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice URL 정보를 얻어온다.
 * @param {string} ca 주문 컨트랙트 주소
 * @return URL 정보(string)
 * @author jhhong
 */
module.exports.url = async function(ca) {
    try {
        let order = new web3.eth.Contract(abi, ca);
        return await order.methods.url().call();
    } catch(error) {
        let action = `Action: url
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 주문 심사요청을 위해 주문을 서비스 컨트랙트에 제출한다.
 * @param {string} ca       주문 컨트랙트 주소
 * @param {string} cmder    명령 수행자의 주소
 * @param {string} privkey  명령 수행자의 private key
 * @param {number} nonce    NONCE값
 * @param {number} gasprice GAS 가격 (wei단위), 디폴트 = 0
 * @return 성공 시 txhash, 실패 시 null
 * @author jhhong
 */
module.exports.submitOrderCreate = async function(ca, cmder, privkey, nonce, gasprice = 0) {
    try {
        let order = await new web3.eth.Contract(abi, ca);
        let gas  = await order.methods.submitOrderCreate().estimateGas({from: cmder});
        let data = await order.methods.submitOrderCreate().encodeABI();
        if (gasprice == 0) {
            gasprice = await web3.eth.getGasPrice();
        }
        let gphex = `0x${parseInt(gasprice).toString(16)}`;
        Log('DEBUG', `GAS (submitOrderCreate) = [${CYAN(gas)}], GAS-PRICE = [${CYAN(gasprice)}]`);
        const rawtx = {to: ca, nonce: web3.utils.toHex(nonce), gas: gas, gasPrice: gphex, data: data};
        let receipt = await sendTx(privkey, rawtx);
        return receipt.transactionHash;
    } catch(error) {
        let action = `Action: submitOrderCreate
        - [CA]:    [${ca}],
        - [cmder]: [${cmder}],
        - [nonce]: [${nonce}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return null;
    }
}

/**
 * @notice 주문의 URL 정보를 설정한다.
 * @param {string} ca       주문 컨트랙트 주소
 * @param {string} cmder    명령 수행자의 주소
 * @param {string} privkey  명령 수행자의 private key
 * @param {string} url      URL 정보
 * @param {number} nonce    NONCE값
 * @param {number} gasprice GAS 가격 (wei단위), 디폴트 = 0
 * @return 성공 시 txhash, 실패 시 null
 * @author jhhong
 */
module.exports.setUrl = async function(ca, cmder, privkey, url, nonce, gasprice = 0) {
    try {
        let order = await new web3.eth.Contract(abi, ca);
        let gas  = await order.methods.setUrl(url).estimateGas({from: cmder});
        let data = await order.methods.setUrl(url).encodeABI();
        if (gasprice == 0) {
            gasprice = await web3.eth.getGasPrice();
        }
        let gphex = `0x${parseInt(gasprice).toString(16)}`;
        Log('DEBUG', `GAS (setUrl) = [${CYAN(gas)}], GAS-PRICE = [${CYAN(gasprice)}]`);
        const rawtx = {to: ca, nonce: web3.utils.toHex(nonce), gas: gas, gasPrice: gphex, data: data};
        let receipt = await sendTx(privkey, rawtx);
        return receipt.transactionHash;
    } catch(error) {
        let action = `Action: setUrl
        - [CA]:    [${ca}],
        - [cmder]: [${cmder}],
        - [url]:   [${url}],
        - [nonce]: [${nonce}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return null;
    }
}

/**
 * @notice DkargoOrder deploy를 수행한다.
 * @param {string} cmder      명령 수행자의 주소
 * @param {string} privkey    명령 수행자의 private key
 * @param {string} url        주문 URL 정보
 * @param {string} service    서비스 컨트랙트 주소
 * @param {array}  members    물류수행 참여자 주소 배열 (화주+물류사)
 * @param {array}  codes      물류 트래킹 코드 배열
 * @param {array}  incentives 각 구간에서의 물류수행 완료 시 받는 인센티브 배열
 * @param {number} nonce      NONCE값
 * @param {number} gasprice   GAS 가격 (wei단위), 디폴트 = 0
 * @return 성공 시 컨트랙트 주소, 실패 시 null
 * @author jhhong
 */
 module.exports.deployOrder = async function(cmder, privkey, url, service, members, codes, incentives, nonce, gasprice = 0) {
    try {
        if(members.length != codes.length || members.length != incentives.length) {
            throw new Error(`Array size is different!`)
        }
        let order = await new web3.eth.Contract(abi);
        let gas  = await order.deploy({data: bytecode, arguments:[url, service, members, codes, incentives]}).estimateGas({from: cmder});
        let data = await order.deploy({data: bytecode, arguments:[url, service, members, codes, incentives]}).encodeABI();
        if (gasprice == 0) {
            gasprice = await web3.eth.getGasPrice();
        }
        let gphex = `0x${parseInt(gasprice).toString(16)}`;
        Log('DEBUG', `GAS (deployOrder) = [${CYAN(gas)}], GAS-PRICE = [${CYAN(gasprice)}]`);
        const rawtx = {nonce: web3.utils.toHex(nonce), gas: gas, gasPrice: gphex, data: data};
        let receipt = await sendTx(privkey, rawtx);
        return [receipt.contractAddress, receipt.blockNumber];
    } catch(error) {
        let action = `Action: deployOrder
        - [cmder]:          [${cmder}],
        - [url]:            [${url}],
        - [service]:        [${service}],
        - [len-members]:    [${members.length}],
        - [len-codes]:      [${codes.length}],
        - [len-incentives]: [${incentives.length}],
        - [nonce]:          [${nonce}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return null;
    }
}