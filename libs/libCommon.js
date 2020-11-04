/**
 * @file libCommon.js
 * @notice 유용한 lib Functions 및 constant 정의
 * @author jhhong
 */

//// WEB3
const web3 = require('./Web3.js').prov2; // web3 provider (web3.eth.Contract 사용용도: prov1, prov2 어느 것을 써도 관계 없음)
//// LOGs
const Log = require('./libLog.js').Log; // 로그 출력
//// LOG COLOR (console)
const RED = require('./libLog.js').consoleRed; // 콘솔 컬러 출력: RED
//// GLOBALs
const abiPrefix = require('../build/contracts/DkargoPrefix.json').abi; // 컨트랙트 ABI
const abiERC165 = require('../build/contracts/ERC165.json').abi; // 컨트랙트 ABI

/**
 * @notice ms만큼 딜레이를 수행한다.
 * @param {string} ms 딜레이 타임 (ms)
 * @return promise (setTimeout)
 * @author jhhong
 */
module.exports.delay = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @notice 16진수(HEX)을 ASCII로 반환한다.
 * @param hex 16진수(HEX) 문자열
 * @author jhhong
 */
module.exports.hex2a = async function(hex) {
    try {
        if(hex == undefined || hex == null || hex.length == 0) {
            throw new Error(`Invalid Hex String!`);
        }
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return str;
    } catch(error) {
        let action = `Action: hex2a
        - [hex]: [${hex}]`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return null;
    }
}

/**
 * @notice ca가 디카르고 컨트랙트 증명을 위한 인터페이스를 지원하는지 확인한다.
 * @param {string} ca 컨트랙트 주소
 * @return boolean (true: 지원(O), false: 지원(X))
 * @author jhhong
 */
module.exports.isDkargoContract = async function(ca) {
    try {
        let ERC165 = new web3.eth.Contract(abiERC165, ca);
        if(await ERC165.methods.supportsInterface('0x01ffc9a7').call() != true) {
            throw new Error(`<supportsInterface> Not Supported!`);
        }
        if(await ERC165.methods.supportsInterface('0x946edbed').call() != true) {
            throw new Error(`<getDkargoPrefix> Not Supported!`);
        }
        return true;
    } catch(error) {
        let action = `Action: isDkargoContract`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return false;
    }
}

/**
 * @notice 디카르고 컨트랙트의 Prefix를 읽어온다.
 * @param {string} ca 컨트랙트 주소
 * @return Prefix(String:정상수행) / null(오류발생)
 * @author jhhong
 */
module.exports.getDkargoPrefix = async function(ca) {
    try {
        let DkargoPrefix = new web3.eth.Contract(abiPrefix, ca);
        return await DkargoPrefix.methods.getDkargoPrefix().call();
    } catch(error) {
        let action = `Action: getDkargoPrefix`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return false;
    }
}

/**
 * @notice ZERO ADDRESS 정의
 * @author jhhong
 */
module.exports.ZEROADDR = '0x0000000000000000000000000000000000000000';