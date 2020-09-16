/**
 * @file router.js
 * @notice API 라우팅 기능 담당
 * @author jhhong
 */

//// COMMON
const colors = require('colors/safe'); // 콘솔 Color 출력

//// LIBs
const ApiAdmin    = require('./libs/libApiAdmin.js'); // 관리자 API
const ApiCompany  = require('./libs/libApiCompany.js'); // 물류사 API
const ApiOrder    = require('./libs/libApiOrder.js'); // 화주 API
const ApiToken    = require('./libs/libApiToken.js'); // 토큰 API
const getKeystore = require('../apis/libs/libApiCommon.js').getKeystore; // keystore File에서 Object 추출

//// LOGs
const Log = require('../libs/libLog.js').Log; // 로그 출력

//// DBs
require('./db.js'); // for mongoose schema import
const mongoose = require('mongoose');
const Work    = mongoose.model('ApiWork'); // Work schema
const Account = mongoose.model('ApiAccount'); // Account Schema

/**
 * @notice 물류사가 배송해야 할 배송업무 리스트를 획득한다.
 * @param {String} addr 물류사 주소
 * @return 물류사 배송업무 리스트 (json), 정보가 없거나 오류발생 시 'none'
 * @author jhhong
 */
let getWorks = async function(addr) {
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
        let action = `Action: getWork`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        return 'none';
    }
}

/**
 * @notice 물류사를 등록한다.
 * @param {String} addr 커맨드 수행 주소
 * @param {Object} params 파라메터 ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procRegister.json )
 * @return JSON type (ok: 필드로 성공, 실패 구분)
 * @author jhhong
 */
let cmdServiceRegisterCompanies = async function(addr, params) {
    try {
        let keystore = await getKeystore(addr);
        if (keystore == null) {
            throw new Error(`Keystore File does not exist! ADDR:[${addr}]`);
        }
        let exists = await Account.countDocuments({account: addr});
        if(exists > 1) {
            throw new Error(`DB Error! Account Duplicated! ADDR:[${addr}], COUNT:[${exists}]`);
        }
        if(exists == 0) {
            throw new Error(`Unlisted! \"AddAccounts\" need! ADDR:[${addr}]`);
        }
        let account = await Account.findOne({account: addr});
        if(account.status != 'idle') {
            throw new Error(`Account is busy! ADDR:[${addr}]`);
        }
        if(params.operation != 'procRegister') { // params 가용성 체크: OPERATION
            throw new Error('params: Invalid Operation');
        }
        let cbptrPre = async function(addr) {
            await Account.collection.updateOne({account: addr}, {$set: {status: 'proceeding'}});
            Log('DEBUG', `Start Procedure.... (REGISTER COMPANIES)`);
        }
        let cbptrPost = async function(addr) {
            await Account.collection.updateOne({account: addr}, {$set: {status: 'idle'}});
            Log('DEBUG', `End Procedure...... (REGISTER COMPANIES)`);
        }
        ApiAdmin.procRegister(keystore, account.passwd, params, cbptrPre, cbptrPost);
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdServiceRegisterCompanies`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}

/**
 * @notice 물류사를 등록해제한다.
 * @param {String} addr 커맨드 수행 주소
 * @param {Object} params 파라메터 ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procUnregister.json )
 * @return JSON type (ok: 필드로 성공, 실패 구분)
 * @author jhhong
 */
let cmdServiceUnregisterCompanies = async function(addr, params) {
    try {
        let keystore = await getKeystore(addr);
        if (keystore == null) {
            throw new Error(`Keystore File does not exist! ADDR:[${addr}]`);
        }
        let exists = await Account.countDocuments({account: addr});
        if(exists > 1) {
            throw new Error(`DB Error! Account Duplicated! ADDR:[${addr}], COUNT:[${exists}]`);
        }
        if(exists == 0) {
            throw new Error(`Unlisted! \"AddAccounts\" need! ADDR:[${addr}]`);
        }
        let account = await Account.findOne({account: addr});
        if(account.status != 'idle') {
            throw new Error(`Account is busy! ADDR:[${addr}]`);
        }
        if(params.operation != 'procUnregister') { // params 가용성 체크: OPERATION
            throw new Error('params: Invalid Operation');
        }
        let cbptrPre = async function(addr) {
            await Account.collection.updateOne({account: addr}, {$set: {status: 'proceeding'}});
            Log('DEBUG', `Start Procedure.... (UNREGISTER COMPANIES)`);
        }
        let cbptrPost = async function(addr) {
            await Account.collection.updateOne({account: addr}, {$set: {status: 'idle'}});
            Log('DEBUG', `End Procedure...... (UNREGISTER COMPANIES)`);
        }
        ApiAdmin.procUnregister(keystore, account.passwd, params, cbptrPre, cbptrPost);
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdServiceUnregisterCompanies`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}

/**
 * @notice 물류사를 등록해제한다.
 * @param {String} addr 커맨드 수행 주소
 * @param {Object} params 파라메터 ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procMarkOrderPayed.json )
 * @return JSON type (ok: 필드로 성공, 실패 구분)
 * @author jhhong
 */
let cmdServiceCheckPayments = async function(addr, params) {
    try {
        let keystore = await getKeystore(addr);
        if (keystore == null) {
            throw new Error(`Keystore File does not exist! ADDR:[${addr}]`);
        }
        let exists = await Account.countDocuments({account: addr});
        if(exists > 1) {
            throw new Error(`DB Error! Account Duplicated! ADDR:[${addr}], COUNT:[${exists}]`);
        }
        if(exists == 0) {
            throw new Error(`Unlisted! \"AddAccounts\" need! ADDR:[${addr}]`);
        }
        let account = await Account.findOne({account: addr});
        if(account.status != 'idle') {
            throw new Error(`Account is busy! ADDR:[${addr}]`);
        }
        if(params.operation != 'procMarkOrderPayed') { // params 가용성 체크: OPERATION
            throw new Error('params: Invalid Operation');
        }
        let cbptrPre = async function(addr) {
            await Account.collection.updateOne({account: addr}, {$set: {status: 'proceeding'}});
            Log('DEBUG', `Start Procedure.... (CHECK PAYMENTS)`);
        }
        let cbptrPost = async function(addr) {
            await Account.collection.updateOne({account: addr}, {$set: {status: 'idle'}});
            Log('DEBUG', `End Procedure...... (CHECK PAYMENTS)`);
        }
        ApiAdmin.procMarkOrderPayed(keystore, account.passwd, params, cbptrPre, cbptrPost);
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdServiceCheckPayments`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}

/**
 * @notice 관리되어야 할 계정을 추가한다.
 * @param {String} addr 커맨드 수행 주소
 * @param {Object} params 파라메터 ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procDeployToken.json )
 * @return JSON type (ok: 필드로 성공, 실패 구분)
 * @author jhhong
 */
let cmdTokenDeploy = async function(addr, params) {
    try {
        let keystore = await getKeystore(addr);
        if (keystore == null) {
            throw new Error(`Keystore File does not exist! ADDR:[${addr}]`);
        }
        let exists = await Account.countDocuments({account: addr});
        if(exists > 1) {
            throw new Error(`DB Error! Account Duplicated! ADDR:[${addr}], COUNT:[${exists}]`);
        }
        if(exists == 0) {
            throw new Error(`Unlisted! Need to \"ADD ACCOUNT\" ADDR:[${addr}]`);
        }
        let account = await Account.findOne({account: addr});
        if(account.status != 'idle') {
            throw new Error(`Account is busy! ADDR:[${addr}]`);
        }
        if(params.operation != 'procDeployToken') { // params 가용성 체크: OPERATION
            throw new Error('params: Invalid Operation');
        }
        await Account.collection.updateOne({account: addr}, {$set: {status: 'proceeding'}});
        ApiToken.procDeployToken(keystore, account.passwd, params, async function(addr) {
            await Account.collection.updateOne({account: addr}, {$set: {status: 'idle'}});
            Log('DEBUG', `All Done! (DEPLOY TOKEN)`);
        });
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdTokenDeploy`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}

/**
 * @notice 관리되어야 할 계정을 추가한다.
 * @param {Object} params 계정 정보들 ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procAddAccounts.json )
 * @return JSON type (ok: 필드로 성공, 실패 구분)
 * @author jhhong
 */
let cmdAddAccounts = async function(params) {
    try {
        if(params.operation != 'procAddAccounts') { // params 가용성 체크: OPERATION
            throw new Error('params: Invalid Operation');
        }
        let counts = params.data.count;
        let accounts = params.data.accounts;
        if(counts != accounts.length) { // params 가용성 체크: COUNT
            throw new Error(`Invalid Params! Count missmatch:[${counts}]`);
        }
        let keystores = new Array();
        for(let i = 0; i < counts; i++) { // address에 해당하는 KEYSTORE 파일이 API Server에 존재하는지 확인
            let keystore = await getKeystore(accounts[i].addr);
            if (keystore == null) {
                throw new Error(`Invalid Params! Not Exist:[${accounts[i].addr}]`);
            }
            keystores.push(keystore);
        }
        let total = 0;
        for(let i = 0; i < counts; i++) { // DB 조회: 이미 등록된 계정에 대해서는 별도의 처리를 하지 않음
            if(await Account.countDocuments({account: accounts[i].addr}) == 0) { // 등록되지 않은 계정 정보일 경우
                let item = new Account();
                item.account = accounts[i].addr;
                item.passwd = accounts[i].passwd;
                item.status = 'idle';
                await Account.collection.insertOne(item);
                total++;
            }
        }
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        ret.count = total;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdAddAccounts`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}

/**
 * @notice 관리되어야 할 계정을 삭제한다.
 * @param {Object} params 계정 정보들 ( @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procRemoveAccounts.json )
 * @return JSON type (ok: 필드로 성공, 실패 구분)
 * @author jhhong
 */
let cmdRemoveAccounts = async function(params) {
    try {
        if(params.operation != 'procRemoveAccounts') { // params 가용성 체크: OPERATION
            throw new Error('params: Invalid Operation');
        }
        let counts = params.data.count;
        let accounts = params.data.accounts;
        if(counts != accounts.length) { // params 가용성 체크: COUNT
            throw new Error(`Invalid Params! Count missmatch:[${counts}]`);
        }
        let keystores = new Array();
        for(let i = 0; i < counts; i++) { // address에 해당하는 KEYSTORE 파일이 API Server에 존재하는지 확인
            let keystore = await getKeystore(accounts[i].addr);
            if (keystore == null) {
                throw new Error(`Invalid Params! Not Exist:[${accounts[i].addr}]`);
            }
            keystores.push(keystore);
        }
        let total = 0;
        for(let i = 0; i < counts; i++) { // DB 조회: 이미 등록된 계정에 대해서는 별도의 처리를 하지 않음
            let exists = await Account.countDocuments({account: accounts[i].addr});
            if(exists > 1) { // 오류 사항 체크: DB에 저장된 항목이 1을 초과할 경우, 예외처리
                throw new Error(`Invalid Params! Not Exist:[${accounts[i].addr}]`);
            } else if(exists == 1) { // 등록된 계정 정보일 경우
                await Account.deleteOne({account: accounts[i].addr});
                total++;
            }
        }
        let ret = new Object(); // 응답 생성: SUCCESS
        ret.ok = true;
        ret.count = total;
        return JSON.stringify(ret);
    } catch(error) {
        let action = `Action: cmdAddAccounts`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        let ret = new Object(); // 응답 생성: FAILED
        ret.ok = false;
        ret.reason = error.message;
        return JSON.stringify(ret);
    }
}

/**
 * @notice API routing 수행 함수
 * @param {Object} app Express Object
 * @author jhhong
 */
module.exports = function(app) {
    app.get('/getWorks/:address', async function(req, res) {
        let ret = await getWorks(req.params.address);
        res.end(ret);
    });
    app.post('/cmdTokenTransfer/:address', async function(req, res) {
        console.log(req.params.address);
        console.log(req.body.data.name);
        res.json({ok: true});
    });
    app.post('/cmdTokenApprove/:address', async function(req, res) {
        console.log(req.body);
        res.json({ok: true});
    });
    app.post('/cmdTokenBurn/:address', async function(req, res) {
        console.log(req.body);
        res.json({ok: true});
    });
    app.post('/cmdOrdersDeploy/:address', async function(req, res) {
        console.log(req.body.data.name);
        res.json({ok: true});
    });
    app.post('/cmdOrdersSubmit/:address', async function(req, res) {
        console.log(req.body.data.name);
        res.json({ok: true});
    });
    app.post('/cmdOrderSetInfos/:address', async function(req, res) {
        console.log(req.body.data.name);
        res.json({ok: true});
    });
    app.post('/cmdCompanyDeploy/:address', async function(req, res) {
        console.log(req.body.data.name);
        res.json({ok: true});
    });
    app.post('/cmdCompanyLaunchOrders/:address', async function(req, res) {
        console.log(req.body.data.name);
        res.json({ok: true});
    });
    app.post('/cmdCompanyUpdateOrders/:address', async function(req, res) {
        console.log(req.body.data.name);
        res.json({ok: true});
    });
    app.post('/cmdCompanyAddOperators/:address', async function(req, res) {
        console.log(req.body.data.name);
        res.json({ok: true});
    });
    app.post('/cmdCompanyRemoveOperators/:address', async function(req, res) {
        console.log(req.body.data.name);
        res.json({ok: true});
    });
    app.post('/cmdCompanysetInfos/:address', async function(req, res) {
        console.log(req.body.data.name);
        res.json({ok: true});
    });
    /**
     * @notice 물류사 등록 프로시져
     * @dev 수행주체: ADMIN
     * @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procRegister.json
     * @author jhhong
     */
    app.post('/cmdServiceRegisterCompanies/:address', async function(req, res) {
        let ret = await cmdServiceRegisterCompanies(req.params.address, req.body);
        res.json(ret);
    });
    /**
     * @notice 물류사 등록해제 프로시져
     * @dev 수행주체: ADMIN
     * @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procUnregister.json
     * @author jhhong
     */
    app.post('/cmdServiceUnregisterCompanies/:address', async function(req, res) {
        let ret = await cmdServiceUnregisterCompanies(req.params.address, req.body);
        res.json(ret);
    });
    /**
     * @notice 물류사 주문 결제확인 프로시져
     * @dev 수행주체: ADMIN
     * @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procMarkOrderPayed.json
     * @author jhhong
     */
    app.post('/cmdServiceCheckPayments/:address', async function(req, res) {
        let ret = await cmdServiceCheckPayments(req.params.address, req.body);
        res.json(ret);
    });
    app.post('/cmdServiceSettleIncentives/:address', async function(req, res) {
        console.log(req.body.data.name);
        res.json({ok: true});
    });
    /**
     * @notice TOKEN DEPLOY COMMAND 처리
     * @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procDeployToken.json
     * @author jhhong
     */
    app.post('/cmdTokenDeploy/:address', async function(req, res) {
        let ret = await cmdTokenDeploy(req.params.address, req.body);
        res.json(ret);
    });
    /**
     * @notice SERVICE DEPLOY COMMAND 처리
     * @author jhhong
     */
    app.post('/cmdServiceDeploy/:address', async function(req, res) {
        let ret = await cmdServiceDeploy(req.params.address, req.body);
        res.json(ret);
    });
    /**
     * @notice 계정 추가 COMMAND 처리
     * @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procAddAccounts.json
     * @author jhhong
     */
    app.post('/cmdAddAccounts', async function(req, res) {
        let ret = await cmdAddAccounts(req.body);
        res.json(ret);
    });
    /**
     * @notice 계정 제거 COMMAND 처리
     * @see https://github.com/dKargo/dkargo-apis/tree/master/docs/protocols/procRemoveAccounts.json
     * @author jhhong
     */
    app.post('/cmdRemoveAccounts', async function(req, res) {
        let ret = await cmdRemoveAccounts(req.body);
        res.json(ret);
    });
}