/**
 * @file libDkargoCompany.js
 * @notice DkargoCompany 컨트랙트 API 정의
 * @dev 선행조건: truffle compile
 * @author jhhong
 */

//// WEB3
const web3   = require('./Web3.js').prov2; // web3 provider (order는 privnet(chain2)에 deploy됨)
const sendTx = require('./Web3.js').prov2SendTx; // 트랜젝션을 생성하여 블록체인에 전송하는 함수
//// GLOBALs
const abi      = require('../build/contracts/DkargoService.json').abi; // 컨트랙트 ABI
const bytecode = require('../build/contracts/DkargoService.json').bytecode; // 컨트랙트 bytecode
//// LOGs
const Log = require('./libLog.js').Log; // 로그 출력
//// LOG COLOR (console)
const RED  = require('./libLog.js').consoleRed; // 콘솔 컬러 출력: RED
const CYAN = require('./libLog.js').consoleCyan; // 콘솔 컬러 출력: CYAN

/**
 * @notice 등록된 물류사 개수를 반환한다.
 * @param {string} ca 서비스 컨트랙트 주소
 * @return 등록된 물류사 개수(number)
 * @author jhhong
 */
module.exports.companyCount = async function(ca) {
    try {
        let service = new web3.eth.Contract(abi, ca);
        return await service.methods.companyCount().call();
    } catch(error) {
        let action = `Action: companyCount
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 등록된 물류사 리스트에서 첫번째 엘리먼트를 반환한다.
 * @param {string} ca 서비스 컨트랙트 주소
 * @return 등록된 물류사 리스트의 첫번째 엘리먼트(address)
 * @author jhhong
 */
module.exports.firstCompany = async function(ca) {
    try {
        let service = new web3.eth.Contract(abi, ca);
        return await service.methods.firstCompany().call();
    } catch(error) {
        let action = `Action: firstCompany
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 인센티브 수령자 리스트에서 첫번째 엘리먼트를 반환한다.
 * @param {string} ca 서비스 컨트랙트 주소
 * @return 인센티브 수령자 리스트의 첫번째 엘리먼트(address)
 * @author jhhong
 */
module.exports.firstRecipient = async function(ca) {
    try {
        let service = new web3.eth.Contract(abi, ca);
        return await service.methods.firstRecipient().call();
    } catch(error) {
        let action = `Action: firstRecipient
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice addr이 수령할 인센티브 정보를 반환한다.
 * @param {string} ca   서비스 컨트랙트 주소
 * @param {string} addr 인센티브 수령자 주소
 * @return addr이 수령할 인센티브 정보(object: "수령가능한 인센티브 총합" / "settle 수행 시 지급받을 인센티브 양")
 * @author jhhong
 */
module.exports.incentives = async function(ca, addr) {
    try {
        let service = new web3.eth.Contract(abi, ca);
        return await service.methods.incentives(addr).call();
    } catch(error) {
        let action = `Action: incentives
        - [ca]:   [${ca}],
        - [addr]: [${addr}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 물류사의 등록여부를 반환한다.
 * @param {string} ca      서비스 컨트랙트 주소
 * @param {string} company 물류사 컨트랙트 주소
 * @return 물류사의 등록여부(bool)
 * @author jhhong
 */
module.exports.isMember = async function(ca, company) {
    try {
        let service = new web3.eth.Contract(abi, ca);
        return await service.methods.isMember(company).call();
    } catch(error) {
        let action = `Action: isMember
        - [ca]:      [${ca}],
        - [company]: [${company}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 등록된 물류사 리스트에서 마지막 엘리먼트를 반환한다.
 * @param {string} ca 서비스 컨트랙트 주소
 * @return 등록된 물류사 리스트의 마지막 엘리먼트(address)
 * @author jhhong
 */
module.exports.lastCompany = async function(ca) {
    try {
        let service = new web3.eth.Contract(abi, ca);
        return await service.methods.lastCompany().call();
    } catch(error) {
        let action = `Action: lastCompany
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 인센티브 수령자 리스트에서 마지막 엘리먼트를 반환한다.
 * @param {string} ca 서비스 컨트랙트 주소
 * @return 인센티브 수령자 리스트의 마지막 엘리먼트(address)
 * @author jhhong
 */
module.exports.lastRecipient = async function(ca) {
    try {
        let service = new web3.eth.Contract(abi, ca);
        return await service.methods.lastRecipient().call();
    } catch(error) {
        let action = `Action: lastRecipient
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 등록된 물류사 리스트에서 company 바로 다음 엘리먼트를 반환한다.
 * @param {string} ca      서비스 컨트랙트 주소
 * @param {string} company 물류사 컨트랙트 주소
 * @return 등록된 물류사 리스트의 company 바로 다음 엘리먼트(address)
 * @author jhhong
 */
module.exports.nextCompany = async function(ca, company) {
    try {
        let service = new web3.eth.Contract(abi, ca);
        return await service.methods.nextCompany(company).call();
    } catch(error) {
        let action = `Action: nextCompany
        - [ca]:      [${ca}],
        - [company]: [${company}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 인센티브 수령자 리스트에서 recipient 바로 다음 엘리먼트를 반환한다.
 * @param {string} ca        서비스 컨트랙트 주소
 * @param {string} recipient 인센티브 수령자 주소
 * @return 인센티브 수령자 리스트의 recipient 바로 다음 엘리먼트(address)
 * @author jhhong
 */
module.exports.nextRecipient = async function(ca, recipient) {
    try {
        let service = new web3.eth.Contract(abi, ca);
        return await service.methods.nextRecipient(recipient).call();
    } catch(error) {
        let action = `Action: nextRecipient
        - [ca]:        [${ca}],
        - [recipient]: [${recipient}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 주문번호에 대응되는 주문 컨트랙트 주소를 반환한다.
 * @param {string} ca      서비스 컨트랙트 주소
 * @param {string} orderid 주문번호
 * @return 주문 컨트랙트 주소(address)
 * @author jhhong
 */
module.exports.orders = async function(ca, orderid) {
    try {
        let service = new web3.eth.Contract(abi, ca);
        return await service.methods.orders(orderid).call();
    } catch(error) {
        let action = `Action: orders
        - [ca]:      [${ca}],
        - [orderid]: [${orderid}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 등록된 주문 개수를 반환한다.
 * @param {string} ca 서비스 컨트랙트 주소
 * @return 등록된 주문 개수(number)
 * @author jhhong
 */
module.exports.orderCount = async function(ca) {
    try {
        let service = new web3.eth.Contract(abi, ca);
        return await service.methods.orderCount().call();
    } catch(error) {
        let action = `Action: orderCount
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 등록된 물류사 리스트에서 company 바로 앞 엘리먼트를 반환한다.
 * @param {string} ca      서비스 컨트랙트 주소
 * @param {string} company 서비스 컨트랙트 주소
 * @return 등록된 물류사 리스트의 company 바로 앞 엘리먼트(address)
 * @author jhhong
 */
module.exports.prevCompany = async function(ca, company) {
    try {
        let service = new web3.eth.Contract(abi, ca);
        return await service.methods.prevCompany(company).call();
    } catch(error) {
        let action = `Action: prevCompany
        - [ca]:      [${ca}],
        - [company]: [${company}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 인센티브 수령자 리스트에서 recipient 바로 앞 엘리먼트를 반환한다.
 * @param {string} ca      서비스 컨트랙트 주소
 * @param {string} company 서비스 컨트랙트 주소
 * @return 인센티브 수령자 리스트의 recipient 바로 앞 엘리먼트(address)
 * @author jhhong
 */
module.exports.prevRecipient = async function(ca, recipient) {
    try {
        let service = new web3.eth.Contract(abi, ca);
        return await service.methods.prevRecipient(recipient).call();
    } catch(error) {
        let action = `Action: prevRecipient
        - [ca]:        [${ca}],
        - [recipient]: [${recipient}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 인센티브 수령자 총 수를 반환한다.
 * @param {string} ca 서비스 컨트랙트 주소
 * @return 인센티브 수령자 총 수(number)
 * @author jhhong
 */
module.exports.recipientCount = async function(ca) {
    try {
        let service = new web3.eth.Contract(abi, ca);
        return await service.methods.recipientCount().call();
    } catch(error) {
        let action = `Action: recipientCount
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 물류사를 등록한다.
 * @param {string} ca       서비스 컨트랙트 주소
 * @param {string} cmder    명령 수행자의 주소
 * @param {string} privkey  명령 수행자의 private key
 * @param {string} company  등록할 물류사 컨트랙트 주소
 * @param {number} nonce    NONCE값
 * @param {number} gasprice GAS 가격 (wei단위), 디폴트 = 0
 * @return 성공 시 txhash, 실패 시 null
 * @author jhhong
 */
module.exports.register = async function(ca, cmder, privkey, company, nonce, gasprice = 0) {
    try {
        let service = new web3.eth.Contract(abi, ca);
        let gas  = await service.methods.register(company).estimateGas({from: cmder});
        let data = await service.methods.register(company).encodeABI();
        if (gasprice == 0) {
            gasprice = await web3.eth.getGasPrice();
        }
        let gphex = `0x${parseInt(gasprice).toString(16)}`;
        Log('DEBUG', `GAS (register) = [${CYAN(gas)}], GAS-PRICE = [${CYAN(gasprice)}]`);
        const rawtx = {to: ca, nonce: web3.utils.toHex(nonce), gas: gas, gasPrice: gphex, data: data};
        let receipt = await sendTx(privkey, rawtx);
        return receipt.transactionHash;
    } catch(error) {
        let action = `Action: register
        - [CA]:      [${ca}],
        - [cmder]:   [${cmder}],
        - [company]: [${company}],
        - [nonce]:   [${nonce}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return null;
    }
}

/**
 * @notice addr이 받아야 할 인센티브를 정산한다.
 * @param {string} ca       서비스 컨트랙트 주소
 * @param {string} cmder    명령 수행자의 주소
 * @param {string} privkey  명령 수행자의 private key
 * @param {string} addr     인센티브 수령자 주소
 * @param {number} nonce    NONCE값
 * @param {number} gasprice GAS 가격 (wei단위), 디폴트 = 0
 * @return 성공 시 txhash, 실패 시 null
 * @author jhhong
 */
module.exports.settle = async function(ca, cmder, privkey, addr, nonce, gasprice = 0) {
    try {
        let service = new web3.eth.Contract(abi, ca);
        let gas  = await service.methods.settle(addr).estimateGas({from: cmder});
        let data = await service.methods.settle(addr).encodeABI();
        if (gasprice == 0) {
            gasprice = await web3.eth.getGasPrice();
        }
        let gphex = `0x${parseInt(gasprice).toString(16)}`;
        Log('DEBUG', `GAS (settle) = [${CYAN(gas)}], GAS-PRICE = [${CYAN(gasprice)}]`);
        const rawtx = {to: ca, nonce: web3.utils.toHex(nonce), gas: gas, gasPrice: gphex, data: data};
        let receipt = await sendTx(privkey, rawtx);
        return receipt.transactionHash;
    } catch(error) {
        let action = `Action: settle
        - [CA]:    [${ca}],
        - [cmder]: [${cmder}],
        - [addr]:  [${addr}],
        - [nonce]: [${nonce}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return null;
    }
}

/**
 * @notice 물류사를 등록해제한다.
 * @param {string} ca       서비스 컨트랙트 주소
 * @param {string} cmder    명령 수행자의 주소
 * @param {string} privkey  명령 수행자의 private key
 * @param {string} company  등록해제할 물류사 컨트랙트 주소
 * @param {number} nonce    NONCE값
 * @param {number} gasprice GAS 가격 (wei단위), 디폴트 = 0
 * @return 성공 시 txhash, 실패 시 null
 * @author jhhong
 */
module.exports.unregister = async function(ca, cmder, privkey, company, nonce, gasprice = 0) {
    try {
        let service = new web3.eth.Contract(abi, ca);
        let gas  = await service.methods.unregister(company).estimateGas({from: cmder});
        let data = await service.methods.unregister(company).encodeABI();
        if (gasprice == 0) {
            gasprice = await web3.eth.getGasPrice();
        }
        let gphex = `0x${parseInt(gasprice).toString(16)}`;
        Log('DEBUG', `GAS (unregister) = [${CYAN(gas)}], GAS-PRICE = [${CYAN(gasprice)}]`);
        const rawtx = {to: ca, nonce: web3.utils.toHex(nonce), gas: gas, gasPrice: gphex, data: data};
        let receipt = await sendTx(privkey, rawtx);
        return receipt.transactionHash;
    } catch(error) {
        let action = `Action: unregister
        - [CA]:      [${ca}],
        - [cmder]:   [${cmder}],
        - [company]: [${company}],
        - [nonce]:   [${nonce}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return null;
    }
}

/**
 * @notice DkargoCompany deploy를 수행한다.
 * @param {string} cmder    명령 수행자의 주소
 * @param {string} privkey  명령 수행자의 private key
 * @param {number} nonce    NONCE값
 * @param {number} gasprice GAS 가격 (wei단위), 디폴트 = 0
 * @return 성공 시 컨트랙트 주소, 실패 시 null
 * @author jhhong
 */
 module.exports.deployService = async function(cmder, privkey, nonce, gasprice = 0) {
    try {
        let service = new web3.eth.Contract(abi);
        let gas  = await service.deploy({data: bytecode}).estimateGas({from: cmder});
        let data = await service.deploy({data: bytecode}).encodeABI();
        if (gasprice == 0) {
            gasprice = await web3.eth.getGasPrice();
        }
        let gphex = `0x${parseInt(gasprice).toString(16)}`;
        Log('DEBUG', `GAS (deployService) = [${CYAN(gas)}], GAS-PRICE = [${CYAN(gasprice)}]`);
        const rawtx = {nonce: web3.utils.toHex(nonce), gas: gas, gasPrice: gphex, data: data};
        let receipt = await sendTx(privkey, rawtx);
        return [receipt.contractAddress, receipt.blockNumber];
    } catch(error) {
        let action = `Action: deployService
        - [cmder]: [${cmder}],
        - [nonce]: [${nonce}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return null;
    }
}