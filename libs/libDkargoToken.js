/**
 * @file libDkargoToken.js
 * @notice DkargoToken 컨트랙트 API 정의
 * @dev 선행조건: truffle compile
 * @author jhhong
 */

//// WEB3
const web3   = require('./Web3.js').prov1; // web3 provider (token은 mainnet(chain1)에 deploy됨)
const sendTx = require('./Web3.js').prov1SendTx; // 트랜젝션을 생성하여 블록체인에 전송하는 함수
//// GLOBALs
const abi      = require('../build/contracts/DkargoToken.json').abi; // 컨트랙트 ABI
const bytecode = require('../build/contracts/DkargoToken.json').bytecode; // 컨트랙트 bytecode
//// LOGs
const Log = require('./libLog.js').Log; // 로그 출력
//// LOG COLOR (console)
const RED  = require('./libLog.js').consoleRed; // 콘솔 컬러 출력: RED
const CYAN = require('./libLog.js').consoleCyan; // 콘솔 컬러 출력: CYAN

/**
 * @notice holder가 spender에게 할당한 위임 통화량을 반환한다.
 * @param {string} ca      컨트랙트 주소
 * @param {string} holder  토큰 보유자의 계좌 주소
 * @param {string} spender 토큰 위임자의 계좌 주소
 * @return 위임 통화량(uint256)
 * @author jhhong
 */
module.exports.allowance = async function(ca, holder, spender) {
    try {
        let token = new web3.eth.Contract(abi, ca);
        return await token.methods.allowance(holder, spender).call();
    } catch(error) {
        let action = `Action: allowance
        - [ca]:      [${ca}],
        - [holder]:  [${holder}],
        - [spender]: [${spender}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 유저의 토탈 밸런스를 반환한다.
 * @param {string} ca   컨트랙트 주소
 * @param {string} user 유저 계좌 주소
 * @return 유저가 보유한 토탈 밸런스(uint256)
 * @author jhhong
 */
module.exports.balanceOf = async function(ca, user) {
    try {
        let token = new web3.eth.Contract(abi, ca);
        return await token.methods.balanceOf(user).call();
    } catch(error) {
        let action = `Action: balanceOf
        - [ca]:   [${ca}],
        - [user]: [${user}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 토큰 보유자의 수를 반환한다.
 * @param {string} ca 컨트랙트 주소
 * @return 토큰 보유자의 수(uint256)
 * @author jhhong
 */
module.exports.count = async function(ca) {
    try {
        let token = new web3.eth.Contract(abi, ca);
        return await token.methods.count().call();
    } catch(error) {
        let action = `Action: count
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 토큰의 소수점 자리수를 반환한다.
 * @param {string} ca 컨트랙트 주소
 * @return 토큰의 소수점 자리수(uint256)
 * @author jhhong
 */
module.exports.decimals = async function(ca) {
    try {
        let token = new web3.eth.Contract(abi, ca);
        return await token.methods.decimals().call();
    } catch(error) {
        let action = `Action: decimals
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 첫번째 토큰 보유자 주소를 반환한다.
 * @param {string} ca 컨트랙트 주소
 * @return 첫번째 토큰 보유자 주소(string)
 * @author jhhong
 */
module.exports.head = async function(ca) {
    try {
        let token = new web3.eth.Contract(abi, ca);
        return await token.methods.head().call();
    } catch(error) {
        let action = `Action: head
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 유저에 대한 토큰 홀더 리스트에서의 링크상태 여부를 반환한다.
 * @param {string} ca   컨트랙트 주소
 * @param {string} user 유저 계좌 주소
 * @return 유저에 대한 토큰 홀더 리스트에서의 링크상태 여부(boolean)
 * @author jhhong
 */
module.exports.isLinked = async function(ca, user) {
    try {
        let token = new web3.eth.Contract(abi, ca);
        return await token.methods.isLinked(user).call();
    } catch(error) {
        let action = `Action: isLinked
        - [ca]:   [${ca}],
        - [user]: [${user}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 토큰의 이름을 반환한다.
 * @param {string} ca 컨트랙트 주소
 * @return 토큰의 이름(string)
 * @author jhhong
 */
module.exports.name = async function(ca) {
    try {
        let token = new web3.eth.Contract(abi, ca);
        return await token.methods.name().call();
    } catch(error) {
        let action = `Action: name
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 토큰 홀더 리스트에서 유저 다음 토큰 보유자의 주소를 반환한다.
 * @param {string} ca   컨트랙트 주소
 * @param {string} user 유저 계좌 주소
 * @return 다음 토큰 보유자 주소(string)
 * @author jhhong
 */
module.exports.nextOf = async function(ca, user) {
    try {
        let token = new web3.eth.Contract(abi, ca);
        return await token.methods.nextOf(user).call();
    } catch(error) {
        let action = `Action: nextOf
        - [ca]:   [${ca}],
        - [user]: [${user}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 토큰 홀더 리스트에서 유저 이전 토큰 보유자 주소를 반환한다.
 * @param {string} ca   컨트랙트 주소
 * @param {string} user 유저 계좌 주소
 * @return 이전 토큰 보유자 주소(string)
 * @author jhhong
 */
module.exports.prevOf = async function(ca, user) {
    try {
        let token = new web3.eth.Contract(abi, ca);
        return await token.methods.prevOf(user).call();
    } catch(error) {
        let action = `Action: prevOf
        - [ca]:   [${ca}],
        - [user]: [${user}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 토큰의 심볼을 반환한다.
 * @param {string} ca 컨트랙트 주소
 * @return 토큰의 심볼(string)
 * @author jhhong
 */
module.exports.symbol = async function(ca) {
    try {
        let token = new web3.eth.Contract(abi, ca);
        return await token.methods.symbol().call();
    } catch(error) {
        let action = `Action: symbol
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 마지막 토큰 보유자 주소를 반환한다.
 * @param {string} ca 컨트랙트 주소
 * @return 마지막 토큰 보유자 주소(string)
 * @author jhhong
 */
module.exports.tail = async function(ca) {
    try {
        let token = new web3.eth.Contract(abi, ca);
        return await token.methods.tail().call();
    } catch(error) {
        let action = `Action: tail
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 토큰의 총 통화량을 반환한다.
 * @param {string} ca 컨트랙트 주소
 * @return 토큰 총 통화량(uint256)
 * @author jhhong
 */
module.exports.totalSupply = async function(ca) {
    try {
        let token = new web3.eth.Contract(abi, ca);
        return await token.methods.totalSupply().call();
    } catch(error) {
        let action = `Action: totalSupply
        - [ca]: [${ca}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
    }
}

/**
 * @notice 토큰을 위임한다.
 * @param {string} ca       컨트랙트 주소
 * @param {string} cmder    명령 수행자의 주소
 * @param {string} privkey  명령 수행자의 private key
 * @param {string} spender  spender(토큰 위임자) 계좌 주소
 * @param {string} amount   토큰 위임양
 * @param {number} nonce    NONCE값
 * @param {number} gasprice GAS 가격 (wei단위), 디폴트 = 0
 * @return 성공 시 txhash, 실패 시 null
 * @author jhhong
 */
module.exports.approve = async function(ca, cmder, privkey, spender, amount, nonce, gasprice = 0) {
    try {
        let token = await new web3.eth.Contract(abi, ca);
        let gas  = await token.methods.approve(spender, amount).estimateGas({from: cmder});
        let data = await token.methods.approve(spender, amount).encodeABI();
        if (gasprice == 0) {
            gasprice = await web3.eth.getGasPrice();
        }
        let gphex = `0x${parseInt(gasprice).toString(16)}`;
        Log('DEBUG', `GAS (approve) = [${CYAN(gas)}], GAS-PRICE = [${CYAN(gasprice)}]`);
        const rawtx = {to: ca, nonce: web3.utils.toHex(nonce), gas: gas, gasPrice: gphex, data: data};
        let receipt = await sendTx(privkey, rawtx);
        return receipt.transactionHash;
    } catch(error) {
        let action = `Action: approve
        - [CA]:     [${ca}],
        - [cmder]:  [${cmder}],
        - [to]:     [${spender}],
        - [amount]: [${amount}],
        - [nonce]:  [${nonce}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return null;
    }
}

/**
 * @notice 토큰을 소각한다.
 * @param {string} ca       컨트랙트 주소
 * @param {string} cmder    명령 수행자의 주소
 * @param {string} privkey  명령 수행자의 private key
 * @param {string} amount   토큰 소각양
 * @param {number} nonce    NONCE값
 * @param {number} gasprice GAS 가격 (wei단위), 디폴트 = 0
 * @return 성공 시 txhash, 실패 시 null
 * @author jhhong
 */
module.exports.burn = async function(ca, cmder, privkey, amount, nonce, gasprice = 0) {
    try {
        let token = await new web3.eth.Contract(abi, ca);
        let gas  = await token.methods.burn(amount).estimateGas({from: cmder});
        let data = await token.methods.burn(amount).encodeABI();
        if (gasprice == 0) {
            gasprice = await web3.eth.getGasPrice();
        }
        let gphex = `0x${parseInt(gasprice).toString(16)}`;
        Log('DEBUG', `GAS (burn) = [${CYAN(gas)}], GAS-PRICE = [${CYAN(gasprice)}]`);
        const rawtx = {to: ca, nonce: web3.utils.toHex(nonce), gas: gas, gasPrice: gphex, data: data};
        let receipt = await sendTx(privkey, rawtx);
        return receipt.transactionHash;
    } catch(error) {
        let action = `Action: burn
        - [CA]:     [${ca}],
        - [cmder]:  [${cmder}],
        - [amount]: [${amount}],
        - [nonce]:  [${nonce}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return null;
    }
}

/**
 * @notice 토큰을 전송한다.
 * @param {string} ca       토큰 컨트랙트 주소
 * @param {string} cmder    명령 수행자의 주소
 * @param {string} privkey  명령 수행자의 private key
 * @param {string} to       to 계좌 주소
 * @param {string} amount   토큰 송금양
 * @param {number} nonce    NONCE값
 * @param {number} gasprice GAS 가격 (wei단위), 디폴트 = 0
 * @return 성공 시 txhash, 실패 시 null
 * @author jhhong
 */
module.exports.transfer = async function(ca, cmder, privkey, to, amount, nonce, gasprice = 0) {
    try {
        let token = await new web3.eth.Contract(abi, ca);
        let gas  = await token.methods.transfer(to, amount).estimateGas({from: cmder});
        let data = await token.methods.transfer(to, amount).encodeABI();
        if (gasprice == 0) {
            gasprice = await web3.eth.getGasPrice();
        }
        let gphex = `0x${parseInt(gasprice).toString(16)}`;
        Log('DEBUG', `GAS (transfer) = [${CYAN(gas)}], GAS-PRICE = [${CYAN(gasprice)}]`);
        const rawtx = {to: ca, nonce: web3.utils.toHex(nonce), gas: gas, gasPrice: gphex, data: data};
        let receipt = await sendTx(privkey, rawtx);
        return receipt.transactionHash;
    } catch(error) {
        let action = `Action: transfer
        - [CA]:     [${ca}],
        - [cmder]:  [${cmder}],
        - [to]:     [${to}],
        - [amount]: [${amount}],
        - [nonce]:  [${nonce}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return null;
    }
}

/**
 * @notice 토큰을 위임 전송한다.
 * @param {string} ca       토큰 컨트랙트 주소
 * @param {string} cmder    명령 수행자의 주소
 * @param {string} privkey  명령 수행자의 private key
 * @param {string} from     from 계좌 주소
 * @param {string} to       to 계좌 주소
 * @param {string} amount   토큰 송금양
 * @param {number} nonce    NONCE값
 * @param {number} gasprice GAS 가격 (wei단위), 디폴트 = 0
 * @return 성공 시 txhash, 실패 시 null
 * @author jhhong
 */
module.exports.transferFrom = async function(ca, cmder, privkey, from, to, amount, nonce, gasprice = 0) {
    try {
        let token = await new web3.eth.Contract(abi, ca);
        let gas  = await token.methods.transferFrom(from, to, amount).estimateGas({from: cmder});
        let data = await token.methods.transferFrom(from, to, amount).encodeABI();
        if (gasprice == 0) {
            gasprice = await web3.eth.getGasPrice();
        }
        let gphex = `0x${parseInt(gasprice).toString(16)}`;
        Log('DEBUG', `GAS (transferFrom) = [${CYAN(gas)}], GAS-PRICE = [${CYAN(gasprice)}]`);
        const rawtx = {to: ca, nonce: web3.utils.toHex(nonce), gas: gas, gasPrice: gphex, data: data};
        let receipt = await sendTx(privkey, rawtx);
        return receipt.transactionHash;
    } catch(error) {
        let action = `Action: transferFrom
        - [CA]:     [${ca}],
        - [cmder]:  [${cmder}],
        - [from]:   [${from}],
        - [to]:     [${to}],
        - [amount]: [${amount}],
        - [nonce]:  [${nonce}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return null;
    }
}

/**
 * @notice DkargoToken deploy를 수행한다.
 * @param {string} cmder    명령 수행자의 주소
 * @param {string} privkey  명령 수행자의 private key
 * @param {string} name     토큰 네임
 * @param {string} symbol   토큰 심볼
 * @param {string} supply   초기 발행량
 * @param {number} nonce    NONCE값
 * @param {number} gasprice GAS 가격 (wei단위), 디폴트 = 0
 * @return 성공 시 컨트랙트 주소, 실패 시 null
 * @author jhhong
 */
module.exports.deployToken = async function(cmder, privkey, name, symbol, supply, nonce, gasprice = 0) {
    try {
        let token = await new web3.eth.Contract(abi);
        let gas  = await token.deploy({data: bytecode, arguments:[name, symbol, supply]}).estimateGas({from: cmder});
        let data = await token.deploy({data: bytecode, arguments:[name, symbol, supply]}).encodeABI();
        if (gasprice == 0) {
            gasprice = await web3.eth.getGasPrice();
        }
        let gphex = `0x${parseInt(gasprice).toString(16)}`;
        Log('DEBUG', `GAS (deployToken) = [${CYAN(gas)}], GAS-PRICE = [${CYAN(gasprice)}]`);
        const rawtx = {nonce: web3.utils.toHex(nonce), gas: gas, gasPrice: gphex, data: data};
        let receipt = await sendTx(privkey, rawtx);
        return [receipt.contractAddress, receipt.blockNumber];
    } catch(error) {
        let action = `Action: deployToken
        - [cmder]:  [${cmder}],
        - [name]:   [${name}],
        - [symbol]: [${symbol}],
        - [supply]: [${supply}],
        - [nonce]:  [${nonce}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return null;
    }
}