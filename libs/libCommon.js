/**
 * @file libCommon.js
 * @notice 유용한 lib Functions 정의
 * @author jhhong
 */

/**
 * @notice ms만큼 딜레이를 수행한다.
 * @param {string} ms 딜레이 타임 (ms)
 * @return promise (setTimeout)
 * @author jhhong
 */
module.exports.delay = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}