/**
 * @file libDkargoCompany.js
 * @notice DkargoCompany 컨트랙트 API 정의
 * @dev 선행조건: truffle compile
 * @author jhhong
 */

const colors = require('colors/safe'); // 콘솔 Color 출력
const web3 = require('./Web3.js').prov2; // web3 provider (order는 privnet(chain2)에 deploy됨)
const abi = require('../build/contracts/DkargoCompany.json').abi; // 컨트랙트 ABI
const bytecode = require('../build/contracts/DkargoCompany.json').bytecode; // 컨트랙트 bytecode
const Log = require('./libLog.js').Log; // 로그 출력
const sendTransaction = require('./Web3.js').prov2SendTx; // 트랜젝션을 생성하여 블록체인에 전송하는 함수

/**
 * @notice 주문의 정상 배송완료 여부를 반환한다.
 * @param {string} ca 물류사 컨트랙트 주소
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
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
    }
}

/**
 * @notice 물류사가 담당하는 주문 리스트에서 첫번째 엘리먼트를 읽어온다.
 * @param {string} ca 물류사 컨트랙트 주소
 * @return 물류사 관할 주문 리스트의 첫번째 엘리먼트(address)
 * @author jhhong
 */
module.exports.firstOrder = async function(ca) {
    try {
        let company = new web3.eth.Contract(abi, ca);
        return await company.methods.firstOrder().call();
    } catch(error) {
        let action = `Action: firstOrder
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
    }
}

/**
 * @notice 물류사가 담당하는 주문 리스트에서 마지막 엘리먼트를 읽어온다.
 * @param {string} ca 물류사 컨트랙트 주소
 * @return 물류사 관할 주문 리스트의 마지막 엘리먼트(address)
 * @author jhhong
 */
module.exports.lastOrder = async function(ca) {
    try {
        let company = new web3.eth.Contract(abi, ca);
        return await company.methods.lastOrder().call();
    } catch(error) {
        let action = `Action: lastOrder
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
    }
}

/**
 * @notice 물류사 네이밍 정보를 읽어온다.
 * @param {string} ca 물류사 컨트랙트 주소
 * @return 물류사 네이밍 정보(string)
 * @author jhhong
 */
module.exports.name = async function(ca) {
    try {
        let company = new web3.eth.Contract(abi, ca);
        return await company.methods.name().call();
    } catch(error) {
        let action = `Action: name
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
    }
}

/**
 * @notice 물류사가 담당하는 주문 리스트에서 order 바로 다음 엘리먼트를 읽어온다.
 * @param {string} ca 물류사 컨트랙트 주소
 * @param {string} order 주문 컨트랙트 주소
 * @return 물류사 관할 주문 리스트의 order 바로 다음 엘리먼트(address)
 * @author jhhong
 */
module.exports.nextOrder = async function(ca, order) {
    try {
        let company = new web3.eth.Contract(abi, ca);
        return await company.methods.nextOrder(order).call();
    } catch(error) {
        let action = `Action: nextOrder
        - [ca]:    [${ca}],
        - [order]: [${order}]`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
    }
}

/**
 * @notice 물류사가 담당하는 주문 리스트에서 order 바로 앞 엘리먼트를 읽어온다.
 * @param {string} ca 물류사 컨트랙트 주소
 * @param {string} order 주문 컨트랙트 주소
 * @return 물류사 관할 주문 리스트의 order 바로 앞 엘리먼트(address)
 * @author jhhong
 */
module.exports.prevOrder = async function(ca, order) {
    try {
        let company = new web3.eth.Contract(abi, ca);
        return await company.methods.prevOrder(order).call();
    } catch(error) {
        let action = `Action: prevOrder
        - [ca]:    [${ca}],
        - [order]: [${order}]`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
    }
}

/**
 * @notice 물류사의 수취인 주소를 반환한다.
 * @param {string} ca 물류사 컨트랙트 주소
 * @return 물류사의 수취인 주소(address)
 * @author jhhong
 */
module.exports.recipient = async function(ca) {
    try {
        let company = new web3.eth.Contract(abi, ca);
        return await company.methods.recipient().call();
    } catch(error) {
        let action = `Action: recipient
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
    }
}

/**
 * @notice 물류사의 서비스 컨트랙트 주소를 반환한다.
 * @param {string} ca 물류사 컨트랙트 주소
 * @return 물류사의 서비스 컨트랙트 주소(address)
 * @author jhhong
 */
module.exports.service = async function(ca) {
    try {
        let company = new web3.eth.Contract(abi, ca);
        return await company.methods.service().call();
    } catch(error) {
        let action = `Action: service
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
    }
}

/**
 * @notice 물류사의 Detail information이 저장된 URL 정보를 반환한다.
 * @param {string} ca 물류사 컨트랙트 주소
 * @return 물류사의 Detail information이 저장된 URL 정보(address)
 * @author jhhong
 */
module.exports.url = async function(ca) {
    try {
        let company = new web3.eth.Contract(abi, ca);
        return await company.methods.url().call();
    } catch(error) {
        let action = `Action: url
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
    }
}

/**
 * @notice 주문을 접수한다.
 * @param {string} ca 물류사 컨트랙트 주소
 * @param {string} cmder 명령 수행자의 주소
 * @param {string} privkey 명령 수행자의 private key
 * @param {string} order 접수할 주문 컨트랙트 주소
 * @param {number} transportid 운송번호 (구간배송번호)
 * @param {number} nonce NONCE값
 * @return 성공 시 txhash, 실패 시 null
 * @author jhhong
 */
module.exports.launch = async function(ca, cmder, privkey, order, transportid, nonce) {
    try {
        let company = await new web3.eth.Contract(abi, ca);
        let gas  = await company.methods.launch(order, transportid).estimateGas({from: cmder});
        let data = await company.methods.launch(order, transportid).encodeABI();
        Log('DEBUG', `GAS (launch) = [${colors.cyan(gas)}]`);
        const rawtx = {to: ca, nonce: web3.utils.toHex(nonce), gas: gas, data: data};
        let receipt = await sendTransaction(privkey, rawtx);
        return receipt.transactionHash;
    } catch(error) {
        let action = `Action: launch
        - [CA]:    [${ca}],
        - [cmder]: [${cmder}],
        - [order]: [${order}],
        - [nonce]: [${nonce}]`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        return null;
    }
}

/**
 * @notice 주문의 배송상태를 갱신한다.
 * @param {string} ca 물류사 컨트랙트 주소
 * @param {string} cmder 명령 수행자의 주소
 * @param {string} privkey 명령 수행자의 private key
 * @param {string} order 배송상태를 갱신할 주문 컨트랙트 주소
 * @param {number} transportid 운송번호 (구간배송번호)
 * @param {number} code 배송상태 코드
 * @param {number} nonce NONCE값
 * @return 성공 시 txhash, 실패 시 null
 * @author jhhong
 */
module.exports.updateOrderCode = async function(ca, cmder, privkey, order, transportid, code, nonce) {
    try {
        let company = await new web3.eth.Contract(abi, ca);
        let gas  = await company.methods.updateOrderCode(order, transportid, code).estimateGas({from: cmder});
        let data = await company.methods.updateOrderCode(order, transportid, code).encodeABI();
        Log('DEBUG', `GAS (updateOrderCode) = [${colors.cyan(gas)}]`);
        const rawtx = {to: ca, nonce: web3.utils.toHex(nonce), gas: gas, data: data};
        let receipt = await sendTransaction(privkey, rawtx);
        return receipt.transactionHash;
    } catch(error) {
        let action = `Action: updateOrderCode
        - [CA]:          [${ca}],
        - [cmder]:       [${cmder}],
        - [order]:       [${order}],
        - [transportid]: [${transportid}],
        - [code]:        [${code}],
        - [nonce]:       [${nonce}]`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        return null;
    }
}

/**
 * @notice 관리자를 등록한다.
 * @dev 관리자는 현장(창고, 세관 등..)에서 실제 검수 및 운송 완료를 기록하는 직원의 주소이며, 컨트랙트 소유자도 관리자에 포함된다.
 * @param {string} ca 물류사 컨트랙트 주소
 * @param {string} cmder 명령 수행자의 주소
 * @param {string} privkey 명령 수행자의 private key
 * @param {string} operator 관리자로 등록할 주소
 * @param {number} nonce NONCE값
 * @return 성공 시 txhash, 실패 시 null
 * @author jhhong
 */
module.exports.addOperator = async function(ca, cmder, privkey, operator, nonce) {
    try {
        let company = await new web3.eth.Contract(abi, ca);
        let gas  = await company.methods.addOperator(operator).estimateGas({from: cmder});
        let data = await company.methods.addOperator(operator).encodeABI();
        Log('DEBUG', `GAS (addOperator) = [${colors.cyan(gas)}]`);
        const rawtx = {to: ca, nonce: web3.utils.toHex(nonce), gas: gas, data: data};
        let receipt = await sendTransaction(privkey, rawtx);
        return receipt.transactionHash;
    } catch(error) {
        let action = `Action: addOperator
        - [CA]:       [${ca}],
        - [cmder]:    [${cmder}],
        - [operator]: [${operator}],
        - [nonce]:    [${nonce}]`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        return null;
    }
}

/**
 * @notice 관리자를 등록해제한다.
 * @dev 관리자는 현장(창고, 세관 등..)에서 실제 검수 및 운송 완료를 기록하는 직원의 주소이며, 컨트랙트 소유자도 관리자에 포함된다.
 * @param {string} ca 물류사 컨트랙트 주소
 * @param {string} cmder 명령 수행자의 주소
 * @param {string} privkey 명령 수행자의 private key
 * @param {string} operator 관리자 권한 해제할 주소
 * @param {number} nonce NONCE값
 * @return 성공 시 txhash, 실패 시 null
 * @author jhhong
 */
module.exports.removeOperator = async function(ca, cmder, privkey, operator, nonce) {
    try {
        let company = await new web3.eth.Contract(abi, ca);
        let gas  = await company.methods.removeOperator(operator).estimateGas({from: cmder});
        let data = await company.methods.removeOperator(operator).encodeABI();
        Log('DEBUG', `GAS (removeOperator) = [${colors.cyan(gas)}]`);
        const rawtx = {to: ca, nonce: web3.utils.toHex(nonce), gas: gas, data: data};
        let receipt = await sendTransaction(privkey, rawtx);
        return receipt.transactionHash;
    } catch(error) {
        let action = `Action: removeOperator
        - [CA]:       [${ca}],
        - [cmder]:    [${cmder}],
        - [operator]: [${operator}],
        - [nonce]:    [${nonce}]`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        return null;
    }
}

/**
 * @notice 물류사 별칭을 설정한다.
 * @param {string} ca 물류사 컨트랙트 주소
 * @param {string} cmder 명령 수행자의 주소
 * @param {string} privkey 명령 수행자의 private key
 * @param {string} name 물류사 별칭
 * @param {number} nonce NONCE값
 * @return 성공 시 txhash, 실패 시 null
 * @author jhhong
 */
module.exports.setName = async function(ca, cmder, privkey, name, nonce) {
    try {
        let company = await new web3.eth.Contract(abi, ca);
        let gas  = await company.methods.setName(name).estimateGas({from: cmder});
        let data = await company.methods.setName(name).encodeABI();
        Log('DEBUG', `GAS (setName) = [${colors.cyan(gas)}]`);
        const rawtx = {to: ca, nonce: web3.utils.toHex(nonce), gas: gas, data: data};
        let receipt = await sendTransaction(privkey, rawtx);
        return receipt.transactionHash;
    } catch(error) {
        let action = `Action: setName
        - [CA]:    [${ca}],
        - [cmder]: [${cmder}],
        - [order]: [${name}],
        - [nonce]: [${nonce}]`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        return null;
    }
}

/**
 * @notice 물류사 URL을 설정한다.
 * @param {string} ca 물류사 컨트랙트 주소
 * @param {string} cmder 명령 수행자의 주소
 * @param {string} privkey 명령 수행자의 private key
 * @param {string} url 물류사 URL
 * @param {number} nonce NONCE값
 * @return 성공 시 txhash, 실패 시 null
 * @author jhhong
 */
module.exports.setUrl = async function(ca, cmder, privkey, url, nonce) {
    try {
        let company = await new web3.eth.Contract(abi, ca);
        let gas  = await company.methods.setUrl(url).estimateGas({from: cmder});
        let data = await company.methods.setUrl(url).encodeABI();
        Log('DEBUG', `GAS (setUrl) = [${colors.cyan(gas)}]`);
        const rawtx = {to: ca, nonce: web3.utils.toHex(nonce), gas: gas, data: data};
        let receipt = await sendTransaction(privkey, rawtx);
        return receipt.transactionHash;
    } catch(error) {
        let action = `Action: setUrl
        - [CA]:    [${ca}],
        - [cmder]: [${cmder}],
        - [order]: [${url}],
        - [nonce]: [${nonce}]`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        return null;
    }
}

/**
 * @notice 물류사 수취인주소를 설정한다.
 * @param {string} ca 물류사 컨트랙트 주소
 * @param {string} cmder 명령 수행자의 주소
 * @param {string} privkey 명령 수행자의 private key
 * @param {string} recipient 물류사 수취인주소
 * @param {number} nonce NONCE값
 * @return 성공 시 txhash, 실패 시 null
 * @author jhhong
 */
module.exports.setRecipient = async function(ca, cmder, privkey, recipient, nonce) {
    try {
        let company = await new web3.eth.Contract(abi, ca);
        let gas  = await company.methods.setRecipient(recipient).estimateGas({from: cmder});
        let data = await company.methods.setRecipient(recipient).encodeABI();
        Log('DEBUG', `GAS (setRecipient) = [${colors.cyan(gas)}]`);
        const rawtx = {to: ca, nonce: web3.utils.toHex(nonce), gas: gas, data: data};
        let receipt = await sendTransaction(privkey, rawtx);
        return receipt.transactionHash;
    } catch(error) {
        let action = `Action: setRecipient
        - [CA]:    [${ca}],
        - [cmder]: [${cmder}],
        - [order]: [${recipient}],
        - [nonce]: [${nonce}]`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        return null;
    }
}

/**
 * @notice DkargoCompany deploy를 수행한다.
 * @param {string} cmder 명령 수행자의 주소
 * @param {string} privkey 명령 수행자의 private key
 * @param {string} name 주문 URL 정보
 * @param {string} url 서비스 컨트랙트 주소
 * @param {array} recipient 물류수행 참여자 주소 배열 (화주+물류사)
 * @param {array} service 물류 트래킹 코드 배열
 * @param {number} nonce NONCE값
 * @return 성공 시 컨트랙트 주소, 실패 시 null
 * @author jhhong
 */
 module.exports.deployCompany = async function(cmder, privkey, name, url, recipient, service, nonce) {
    try {
        let company = await new web3.eth.Contract(abi);
        let gas  = await company.deploy({data: bytecode, arguments:[name, url, recipient, service]}).estimateGas({from: cmder});
        let data = await company.deploy({data: bytecode, arguments:[name, url, recipient, service]}).encodeABI();
        Log('DEBUG', `GAS (deployCompany) = [${colors.cyan(gas)}]`);
        const rawtx = {nonce: web3.utils.toHex(nonce), gas: gas, data: data};
        let receipt = await sendTransaction(privkey, rawtx);
        return [receipt.contractAddress, receipt.blockNumber];
    } catch(error) {
        let action = `Action: deployCompany
        - [cmder]:     [${cmder}],
        - [name]:      [${name}],
        - [url]:       [${url}],
        - [recipient]: [${recipient}],
        - [service]:   [${service}],
        - [nonce]:     [${nonce}]`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        return null;
    }
}