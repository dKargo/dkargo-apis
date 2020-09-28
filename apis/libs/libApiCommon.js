/**
 * @file libApiCommon.js
 * @notice Api libs에서 공용으로 사용될 funcion 모음
 * @author jhhong
 */

//// COMMON
const fs   = require('fs'); // Keystore 경로 획득을 위함
const path = require('path'); // .env 경로 추출을 위함
//// LOGs
const Log = require('../../libs/libLog.js').Log; // 로그 출력
//// LOG COLOR (console)
const RED = require('../../libs/libLog.js').consoleRed; // 콘솔 컬러 출력: RED
//// DOTENV
require('dotenv').config({ path: path.join(__dirname, '../../.env') }); // 지정된 경로의 환경변수 사용 (.env 파일 참조)

/**
 * @notice 계좌 주소에 해당하는 Keystore 파일 오브젝트를 반환한다.
 * @param addr 계좌주소
 * @return 정상처리: Keystore 파일 오브젝트, 실패: null
 * @author jhhong
 */
module.exports.getKeystore = async function(addr) {
    try {
        let dir = `${process.env.KEYSTOREPATH}`;
        let filelist = fs.readdirSync(dir);
        let keyaddr = addr.split('0x')[1];
        for(let idx = 0; idx < filelist.length; idx++) {
            if(filelist[idx].split(keyaddr).length > 1) {
                return JSON.parse(fs.readFileSync(dir+'/'+filelist[idx], 'utf-8'));
            }
        }
        return null;
    } catch(error) {
        let action = `Action: getKeystore`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return null;
    }
}