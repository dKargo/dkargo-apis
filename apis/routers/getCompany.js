/**
 * @file getCompany.js
 * @notice 물류사 GET API 처리함수 정의
 * @author jhhong
 */

//// DBs
require('../db.js'); // for mongoose schema import
const mongoose = require('mongoose');
const Work     = mongoose.model('ApiWork'); // Work Schema
//// LOGs
const Log = require('../../libs/libLog.js').Log; // 로그 출력
//// LOG COLOR (console)
const RED = require('../../libs/libLog.js').consoleRed; // 콘솔 컬러 출력: RED

/**
 * @notice 물류사가 배송해야 할 배송업무 리스트를 획득한다.
 * @param {String} addr 물류사 주소
 * @return 물류사 배송업무 리스트 (json), 정보가 없거나 오류발생 시 'none'
 * @author jhhong
 */
module.exports.getCompanyWorks = async function(addr) {
    try {
        let data = await Work.find({$and: [{to: addr}, {executed: false}]}).lean(true); // addr이 아직 실행하지 않은 이벤트들에 대해 리스트업
        if( data != null && data.length > 0) { // 리스트업할 정보가 있을 경우 Json Object 생성
            let ret = new Object();
            ret.company = addr; // 물류사 주소
            ret.count = data.length; // 실행하지 않은 이벤트 개수
            let orders = new Array();
            for(let i = 0; i < data.length; i++) { // 이벤트 상세내역
                let orderinfo = new Object();
                orderinfo.addr = data[i].order; // 주문 컨트랙트 주소
                orderinfo.transportid = data[i].transportid; // 배송번호
                orders.push(orderinfo);
            }
            ret.orders = orders;
            return JSON.stringify(ret);
        } else {
            return 'none';
        }
    } catch(error) {
        let action = `Action: getCompanyWorks`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return 'none';
    }
}