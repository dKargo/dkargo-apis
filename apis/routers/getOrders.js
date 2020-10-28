/**
 * @file getOrders.js
 * @notice 주문 GET API 처리함수 정의
 * @author jhhong
 */

//// DBs
require('../db.js'); // for mongoose schema import
const mongoose = require('mongoose');
const OrderMap = mongoose.model('ApiOrderMap'); // OrderMap Schema
//// LOGs
const Log = require('../../libs/libLog.js').Log; // 로그 출력
//// LOG COLOR (console)
const RED = require('../../libs/libLog.js').consoleRed; // 콘솔 컬러 출력: RED

/**
 * @notice 물류플랫폼사가 관리하는 주문번호에 해당하는 주문 정보를 획득한다.
 * @dev 주문 정보: 물류플랫폼사가 관리하는 주문번호, 주문 컨트랙트 주소, 현재 배송 코드, 운송번호 리스트
 * @dev For Demo: Hooking 모듈 연동 데모 전용
 * @param {String} originid 물류플랫폼사가 관리하는 주문번호
 * @return 존재할 경우 "주문 정보", 존재하지 않을 경우 'none', 처리 오류일 경우 'error'
 * @author jhhong
 */
module.exports.findOrderById = async function(originid) {
    try {
        let exists = await OrderMap.countDocuments({originId: originid});
        if (exists > 1) {
            throw new Error(`DB Error! OriginID Duplicated! ID:[${originid}], COUNT:[${exists}]`);
        }
        if (exists == 0) {
            return 'none';
        }
        let ordermap = await OrderMap.findOne({originId: originid});
        let obj = new Object();
        obj.address  = ordermap.address; // 주문 컨트랙트 주소
        obj.originId = ordermap.originId; // 물류플랫폼사가 관리하는 주문번호
        obj.latest   = ordermap.latest; // 현재 배송 코드
        let tids = new Array();
        tids.push(ordermap.code10);
        tids.push(ordermap.code20);
        tids.push(ordermap.code30);
        tids.push(ordermap.code40);
        tids.push(ordermap.code60);
        tids.push(ordermap.code70);
        obj.transportids = tids; // 운송번호 리스트
        let ret = JSON.stringify(obj);
        return ret;
    } catch(error) {
        let action = `Action: findOrderById`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return 'error';
    }
}

/**
 * @notice 주문 컨트랙트 주소에 해당하는 주문 정보를 획득한다.
 * @dev 주문 정보: 물류플랫폼사가 관리하는 주문번호, 주문 컨트랙트 주소, 현재 배송 코드, 운송번호 리스트
 * @dev For Demo: Hooking 모듈 연동 데모 전용
 * @param {String} addr 주문 컨트랙트 주소
 * @return 존재할 경우 "주문 정보", 존재하지 않을 경우 'none', 처리 오류일 경우 'error'
 * @author jhhong
 */
module.exports.findOrderByAddress = async function(addr) {
    try {
        let exists = await OrderMap.countDocuments({address: addr});
        if (exists > 1) {
            throw new Error(`DB Error! Address Duplicated! ID:[${addr}], COUNT:[${exists}]`);
        }
        if (exists == 0) {
            return 'none';
        }
        let ordermap = await OrderMap.findOne({address: addr});
        let obj = new Object();
        obj.address  = ordermap.address; // 주문 컨트랙트 주소
        obj.originId = ordermap.originId; // 물류플랫폼사가 관리하는 주문번호
        obj.latest   = ordermap.latest; // 현재 배송 코드
        let tids = new Array();
        tids.push(ordermap.code10);
        tids.push(ordermap.code20);
        tids.push(ordermap.code30);
        tids.push(ordermap.code40);
        tids.push(ordermap.code60);
        tids.push(ordermap.code70);
        obj.transportids = tids; // 운송번호 리스트
        let ret = JSON.stringify(obj);
        return ret;
    } catch(error) {
        let action = `Action: findOrderByAddress`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return 'error';
    }
}