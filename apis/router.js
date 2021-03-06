/**
 * @file router.js
 * @notice API 라우팅 기능 담당
 * @author jhhong
 */

//// COMMON
const colors = require('colors/safe'); // 콘솔 Color 출력

//// LIBs
const cmdTokenTransfer            = require('./routers/cmdToken.js').cmdTokenTransfer; // 토큰 CMD API: 토큰전송
const cmdTokenApprove             = require('./routers/cmdToken.js').cmdTokenApprove; // 토큰 CMD API: 토큰위임
const cmdTokenBurn                = require('./routers/cmdToken.js').cmdTokenBurn; // 토큰 CMD API: 토큰소각
const cmdOrdersDeploy             = require('./routers/cmdOrder.js').cmdOrdersDeploy; // 화주 CMD API: 주문 컨트랙트 DEPLOY
const cmdOrdersSubmit             = require('./routers/cmdOrder.js').cmdOrdersSubmit; // 화주 CMD API: 주문 등록요청
const cmdOrdersCreate             = require('./routers/cmdOrder.js').cmdOrdersCreate; // 화주 CMD API: 주문 생성 (주문 컨트랙트 DEPLOY + 주문 등록요청)
const cmdOrderSetInfos            = require('./routers/cmdOrder.js').cmdOrderSetInfos; // 화주 CMD API: 주문 정보설정
const cmdCompanyDeploy            = require('./routers/cmdCompany.js').cmdCompanyDeploy; // 물류사 CMD API: 물류사 컨트랙트 DEPLOY
const cmdCompanyLaunchOrders      = require('./routers/cmdCompany.js').cmdCompanyLaunchOrders; // 물류사 CMD API: 주문 접수
const cmdCompanyUpdateOrders      = require('./routers/cmdCompany.js').cmdCompanyUpdateOrders; // 물류사 CMD API: 주문 구간배송완료
const cmdCompanyAddOperators      = require('./routers/cmdCompany.js').cmdCompanyAddOperators; // 물류사 CMD API: 물류사 운용자 등록
const cmdCompanyRemoveOperators   = require('./routers/cmdCompany.js').cmdCompanyRemoveOperators; // 물류사 CMD API: 물류사 운용자 등록해제
const cmdCompanysetInfos          = require('./routers/cmdCompany.js').cmdCompanysetInfos; // 물류사 CMD API: 물류사 정보설정
const cmdAdminRegisterCompanies   = require('./routers/cmdAdmin.js').cmdAdminRegisterCompanies; // 관리자 CMD API: 물류사 등록
const cmdAdminUnregisterCompanies = require('./routers/cmdAdmin.js').cmdAdminUnregisterCompanies; // 관리자 CMD API: 물류사 등록해제
const cmdAdminSettleIncentives    = require('./routers/cmdAdmin.js').cmdAdminSettleIncentives; // 관리자 CMD API: 인센티브 정산
const cmdAdminAddAccounts         = require('./routers/cmdAdmin.js').cmdAdminAddAccounts; // 관리자 CMD API: 계정추가
const cmdAdminRemoveAccounts      = require('./routers/cmdAdmin.js').cmdAdminRemoveAccounts; // 관리자 CMD API: 계정해지
const getAccountStatus            = require('./routers/getAccount.js').getAccountStatus; // 계정 GET API: 계정의 상태정보 획득
const getCompanyWorks             = require('./routers/getCompany.js').getCompanyWorks; // 물류사 GET API: 물류사가 배송해야 할 업무 리스트 획득
const findOrderById               = require('./routers/getOrders.js').findOrderById; // 주문 GET API: 주문번호에 해당하는 주문의 정보 획득
const findOrderByAddress          = require('./routers/getOrders.js').findOrderByAddress; // 주문 GET API: 주문 컨트랙트 주소에 해당하는 주문의 정보 획득

/**
 * @notice API routing 수행 함수
 * @param {Object} app Express Object
 * @author jhhong
 */
module.exports = function(app) {
    /**
     * @notice 계정의 상태를 얻어온다.
     * @dev 수행주체: any
     * @author jhhong
     */
    app.get('/getAccountStatus/:address', async function(req, res) {
        let ret = await getAccountStatus(req.params.address);
        res.end(ret);
    });
    /**
     * @notice 물류사 담당 구간-배송 리스트를 얻어온다.
     * @dev 수행주체: any
     * @author jhhong
     */
    app.get('/getCompanyWorks/:address', async function(req, res) {
        let ret = await getCompanyWorks(req.params.address);
        res.end(ret);
    });
    /**
     * @notice 물류플랫폼사의 주문번호에 대응되는 주문 컨트랙트 주소를 얻어온다.
     * @dev 수행주체: any, For Demo:
     * @author jhhong
     */
    app.get('/findOrderById/:originId', async function(req, res) {
        let ret = await findOrderById(req.params.originId);
        res.end(ret);
    });
    /**
     * @notice 물류플랫폼사의 주문번호에 대응되는 주문 컨트랙트 주소를 얻어온다.
     * @dev 수행주체: any, For Demo:
     * @author jhhong
     */
    app.get('/findOrderByAddress/:originId', async function(req, res) {
        let ret = await findOrderByAddress(req.params.originId);
        res.end(ret);
    });
    /**
     * @notice 토큰 위임 프로시져
     * @dev 수행주체: 공용
     * @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procTokenApprove.json
     * @author jhhong
     */
    app.post('/cmdTokenApprove/:address', async function(req, res) {
        let ret = await cmdTokenApprove(req.params.address, req.body);
        res.json(ret);
    });
    /**
     * @notice 토큰 소각 프로시져
     * @dev 수행주체: 공용
     * @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procTokenBurn.json
     * @author jhhong
     */
    app.post('/cmdTokenBurn/:address', async function(req, res) {
        let ret = await cmdTokenBurn(req.params.address, req.body);
        res.json(ret);
    });
    /**
     * @notice 토큰 송금 프로시져
     * @dev 수행주체: 공용
     * @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procTokenTransfer.json
     * @author jhhong
     */
    app.post('/cmdTokenTransfer/:address', async function(req, res) {
        let ret = await cmdTokenTransfer(req.params.address, req.body);
        res.json(ret);
    });
    /**
     * @notice 주문 컨트랙트 DEPLOY 프로시져
     * @dev 수행주체: 화주
     * @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procOrderDeploy.json
     * @author jhhong
     */
    app.post('/cmdOrdersDeploy/:address', async function(req, res) {
        let ret = await cmdOrdersDeploy(req.params.address, req.body);
        res.json(ret);
    });
    /**
     * @notice 주문 등록요청 프로시져
     * @dev 수행주체: 화주
     * @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procOrderSubmit.json
     * @author jhhong
     */
    app.post('/cmdOrdersSubmit/:address', async function(req, res) {
        let ret = await cmdOrdersSubmit(req.params.address, req.body);
        res.json(ret);
    });
    /**
     * @notice 주문 생성 프로시져
     * @dev 수행주체: 화주
     * @dev cmdOrdersDeploy + cmdOrdersSubmit의 기능 수행
     * @dev params format은 cmdOrdersDeploy와 동일함
     * @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procOrderDeploy.json
     * @author jhhong
     */
    app.post('/cmdOrdersCreate/:address', async function(req, res) {
        let ret = await cmdOrdersCreate(req.params.address, req.body);
        res.json(ret);
    });
    /**
     * @notice 주문 상세정보 변경 프로시져
     * @dev 수행주체: 화주
     * @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procOrderSetInfo.json
     * @author jhhong
     */
    app.post('/cmdOrderSetInfos/:address', async function(req, res) {
        let ret = await cmdOrderSetInfos(req.params.address, req.body);
        res.json(ret);
    });
    /**
     * @notice 물류사 컨트랙트 DEPLOY 프로시져
     * @dev 수행주체: 물류사
     * @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procCompanyDeploy.json
     * @author jhhong
     */
    app.post('/cmdCompanyDeploy/:address', async function(req, res) {
        let ret = await cmdCompanyDeploy(req.params.address, req.body);
        res.json(ret);
    });
    /**
     * @notice 주문접수 프로시져
     * @dev 수행주체: 물류사
     * @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procCompanyLaunchOrders.json
     * @author jhhong
     */
    app.post('/cmdCompanyLaunchOrders/:address', async function(req, res) {
        let ret = await cmdCompanyLaunchOrders(req.params.address, req.body);
        res.json(ret);
    });
    /**
     * @notice 주문 구간배송완료 프로시져
     * @dev 수행주체: 물류사
     * @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procCompanyUpdateOrders.json
     * @author jhhong
     */
    app.post('/cmdCompanyUpdateOrders/:address', async function(req, res) {
        let ret = await cmdCompanyUpdateOrders(req.params.address, req.body);
        res.json(ret);
    });
    /**
     * @notice 물류사 운영자 등록 프로시져
     * @dev 수행주체: 물류사
     * @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procCompanyAddOperator.json
     * @author jhhong
     */
    app.post('/cmdCompanyAddOperators/:address', async function(req, res) {
        let ret = await cmdCompanyAddOperators(req.params.address, req.body);
        res.json(ret);
    });
    /**
     * @notice 물류사 운영자 등록해제 프로시져
     * @dev 수행주체: 물류사
     * @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procCompanyRemoveOperators.json
     * @author jhhong
     */
    app.post('/cmdCompanyRemoveOperators/:address', async function(req, res) {
        let ret = await cmdCompanyRemoveOperators(req.params.address, req.body);
        res.json(ret);
    });
    /**
     * @notice 물류사 정보 변경 프로시져
     * @dev 수행주체: 물류사
     * @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procCompanySetInfo.json
     * @author jhhong
     */
    app.post('/cmdCompanysetInfos/:address', async function(req, res) {
        let ret = await cmdCompanysetInfos(req.params.address, req.body);
        res.json(ret);
    });
    /**
     * @notice 물류사 등록 프로시져
     * @dev 수행주체: ADMIN
     * @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procAdminRegisterCompanies.json
     * @author jhhong
     */
    app.post('/cmdAdminRegisterCompanies/:address', async function(req, res) {
        let ret = await cmdAdminRegisterCompanies(req.params.address, req.body);
        res.json(ret);
    });
    /**
     * @notice 물류사 등록해제 프로시져
     * @dev 수행주체: ADMIN
     * @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procAdminUnregisterCompanies.json
     * @author jhhong
     */
    app.post('/cmdAdminUnregisterCompanies/:address', async function(req, res) {
        let ret = await cmdAdminUnregisterCompanies(req.params.address, req.body);
        res.json(ret);
    });
    /**
     * @notice 인센티브 정산 프로시져
     * @dev 수행주체: ADMIN
     * @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procAdminSettle.json
     * @author jhhong
     */
    app.post('/cmdAdminSettleIncentives/:address', async function(req, res) {
        let ret = await cmdAdminSettleIncentives(req.params.address, req.body);
        res.json(ret);
    });
    /**
     * @notice 계정 추가 COMMAND 처리
     * @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procAdminAddAccounts.json
     * @author jhhong
     */
    app.post('/cmdAdminAddAccounts', async function(req, res) {
        let ret = await cmdAdminAddAccounts(req.body);
        res.json(ret);
    });
    /**
     * @notice 계정 제거 COMMAND 처리
     * @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procAdminRemoveAccounts.json
     * @author jhhong
     */
    app.post('/cmdAdminRemoveAccounts', async function(req, res) {
        let ret = await cmdAdminRemoveAccounts(req.body);
        res.json(ret);
    });
}