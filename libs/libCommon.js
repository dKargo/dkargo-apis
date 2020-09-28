/**
 * @file libCommon.js
 * @notice 유용한 lib Functions 및 constant 정의
 * @author jhhong
 */

//// LOGs
const Log = require('./libLog.js').Log; // 로그 출력
//// LOG COLOR (console)
const RED = require('./libLog.js').consoleRed; // 콘솔 컬러 출력: RED

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
 * @notice ZERO ADDRESS 정의
 * @author jhhong
 */
module.exports.ZEROADDR = '0x0000000000000000000000000000000000000000';