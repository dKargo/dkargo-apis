/**
 * @file eventMonitor.js
 * @notice Event 모니터링을 수행한다.
 * @author jhhong
 */

//// WEB3
const web3 = require('../libs/Web3.js').prov2; // web3 provider (물류 관련 contract는 privnet에 올라간다 (prov2))
//// DBs
require('./db.js'); // for mongoose schema import
const mongoose = require('mongoose');
const Block = mongoose.model('ApiBlock'); // Block schema
const Work  = mongoose.model('ApiWork'); // Work schema
//// LOGs
const initLog       = require('../libs/libLog.js').initLog; // 로그 초기화 함수 (winston)
const enableLogFile = require('../libs/libLog.js').enableLogFile; // 로그 파일 출력기능 추가 함수
const Log           = require('../libs/libLog.js').Log; // 로그 출력
//// LOG COLOR (console)
const RED   = require('../libs/libLog.js').consoleRed; // 콘솔 컬러 출력: RED
const GREEN = require('../libs/libLog.js').consoleGreen; // 콘솔 컬러 출력: GREEN
const BLUE  = require('../libs/libLog.js').consoleBlue; // 콘솔 컬러 출력: BLUE
const GRAY  = require('../libs/libLog.js').consoleGray; // 콘솔 컬러 출력: GRAY
const CYAN  = require('../libs/libLog.js').consoleCyan; // 콘솔 컬러 출력: CYAN
//// ABIs & LIBs
const abiERC165  = require('../build/contracts/ERC165.json').abi; // 컨트랙트 ABI
const abiPrefix  = require('../build/contracts/DkargoPrefix.json').abi; // 컨트랙트 ABI
const abiService = require('../build/contracts/DkargoService.json').abi; // Service Contract ABI
const ZEROADDR   = require('../libs/libCommon.js').ZEROADDR; // ZERO-ADDRESS 상수

/**
 * @notice ca가 디카르고 컨트랙트 증명을 위한 인터페이스를 지원하는지 확인한다.
 * @param {string} ca 컨트랙트 주소
 * @return boolean (true: 지원(O), false: 지원(X))
 * @author jhhong
 */
let isDkargoContract = async function(ca) {
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
let getDkargoPrefix = async function(ca) {
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
 * @notice 블록에 service 컨트랙트가 실제로 존재하는지 확인한다.
 * @param {String} addr service 컨트랙트 주소
 * @param {Number} genesis service 컨트랙트가 deploy된 블록넘버
 * @return boolean (true: 존재함, false: 존재하지 않음)
 * @author jhhong
 */
let checkValidGenesis = async function(addr, genesis) {
    try {
        let data = await web3.eth.getBlock(genesis, true); // 제네시스 블록의 블록정보를 읽어옴
        if(data == null) {
            throw new Error(`null data received!`);
        }
        Log('DEBUG', `block: [${GREEN(data.number)}] txnum: [${GREEN(data.transactions.length)}]`);
        for(d in data.transactions) {
            const txdata = data.transactions[d];
            const receipt = await web3.eth.getTransactionReceipt(txdata.hash);
            if(txdata.input && txdata.input.length > 2 && txdata.to === null) { // CONTRACT DEPLOY를 수행하는 TX
                let ca = receipt.contractAddress.toLowerCase();
                if(ca == addr.toLowerCase() && await isDkargoContract(ca) == true) { // 해당 컨트랙트(ca)가 디카르고 컨트랙트 증명을 위한 인터페이스를 지원함
                    let prefix = await getDkargoPrefix(ca); // 해당 컨트랙트(ca)의 prefix를 읽어옴
                    if(prefix == 'service') {
                        return true;
                    }
                }
            }
        }
        return false;
    } catch(error) {
        let action = `Action: checkValidGenesis`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return false;
    }
}

/**
 * @notice 모니터링 시작 블록넘버를 구한다.
 * @param {String} addr service 컨트랙트 주소
 * @param {Number} defaultblock service 컨트랙트가 deploy된 블록넘버 (process.argv[3])
 * @return 모니터링 시작 블록넘버(Number)
 * @author jhhong
 */
let getStartBlock = async function(addr, defaultblock) {
    try {
        if(await checkValidGenesis(addr, defaultblock) == false) { // 파라메터 validation 체크
            throw new Error(`Invalid Genesis! BlockNumber: [${defaultblock}]`);
        }
        if(await Block.countDocuments({nettype: 'logistics'}) == 0) {
            if(await Work.countDocuments() == 0) { // DB에 저장된 내용이 없는 최초상태
                return defaultblock;
            } else {
                throw new Error(`Need to reset DB! (Work schema exist)`);
            }
        } else { // genesis block을 마지막 처리된 blockNumber로 설정
            let latest = await Block.findOne();
            if(latest.blockNumber >= defaultblock) { // 마지막 처리된 이벤트 내용을 Work Schema에서 삭제 (중복저장 방지)
                let ret = await Work.deleteMany({blocknumber: latest.blockNumber});
                if(ret != null) {
                    let action = `Work.deleteMany done!\n` +
                    `- [Matched]:      [${GREEN(ret.n)}],\n` +
                    `- [Successful]:   [${GREEN(ret.ok)}],\n` +
                    `- [DeletedCount]: [${GREEN(ret.deletedCount)}]`;
                    Log('DEBUG', `${action}`);
                }
                return latest.blockNumber;
            } else {
                throw new Error(`Need to reset DB! (latest < defaultblock)`);
            }
        }
    } catch(error) {
        let action = `Action: getStartBlock`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return 0;
    }
}

/**
 * @notice 이벤트 로그 파싱을 위한 테이블을 생성한다.
 * @return 이벤트 로그 파싱 테이블 (Object)
 * @author jhhong
 */
let createEventParseTable = async function() {
    try {
        let ret = new Array(); // 결과 테이블
        for(let i = 0; i < abiService.length; i++) {
            if(abiService[i].type == 'event') {
                let proto = `${abiService[i].name}(`; // 이벤트 시그니처를 계산하기 위한 이벤트 프로토타입
                for(let j = 0; j < abiService[i].inputs.length; j++) {
                    proto += (j == 0)? (`${abiService[i].inputs[j].type}`) : (`,${abiService[i].inputs[j].type}`);
                }
                proto += `)`;
                let sigret = await web3.eth.abi.encodeEventSignature(proto); // 이벤트 프로토타입에서 이벤트 시그니처를 추출한다.
                let obj = new Object();
                obj.name = abiService[i].name; // 이벤트 이름
                obj.inputs = abiService[i].inputs; // 이벤트 input 파라메터, 이벤트 파싱 시 호출되는 decodeLog의 파라메터로 필요한 값
                obj.signature = sigret; // 이벤트 시그니처, receipt의 logs.topics에 담겨오는 이벤트 식별자이다.
                ret.push(obj);
            }
        }
        return (ret.length > 0)? (ret) : (null);
    } catch(error) {
        Log('ERROR', `${RED(error)}`);
        return null;
    }
}

/**
 * @notice 이벤트의 아규먼트 정보를 획득한다.
 * @param {String} eventname 이벤트 이름
 * @param {Object} table EventLog Parsing 테이블
 * @param {Object} receipt getTransactionReceipt 결과물
 * @author jhhong
 */
let getEventArguments = async function(eventname, table, receipt) {
    try {
        let elmt = undefined;
        for(let i = 0; i < table.length; i++) {
            if(table[i].name == eventname) {
                elmt = table[i]; // eventname에 해당하는 table elmt 획득
                break;
            }
        }
        if(elmt != undefined) { // 매칭되는 table elmt가 존재할 경우
            let rets = new Array();
            for(let i = 0; i < receipt.logs.length; i++) {
                if(receipt.logs[i].topics[0] == elmt.signature) { // eventname에 해당하는 event log가 있다면
                    let data = receipt.logs[i].data; // receipt에서 data 추출
                    let topics = receipt.logs[i].topics.slice(1); // receipt에서 topics 추출
                    let ret = await web3.eth.abi.decodeLog(elmt.inputs, data, topics); // 아규먼트 정보 획득
                    rets.push(ret); // 결과 배열에 저장
                }
            }
            return (rets.length > 0)? (rets) : (null);
        }
        return null;
    } catch(error) {
        Log('ERROR', `${RED(error)}`);
        return null;
    }
}

/**
 * @notice 이벤트를 파싱한다.
 * @dev 트랜젝션이 디카르고 tx인지 판별, 디카르고 tx에 한해서 txtype에 맞는 schema로 데이터를 가공
 * @param {Object} table Event Log Parsing 테이블 (이벤트 이름 / inputs / signature 조합)
 * @param {Object} txdata 트랜젝션 정보 (eth.getTransaction)
 * @param {Object} receipt Receipt 정보 (eth.getTransactionReceipt)
 * @author jhhong
 */
let parseEvents = async function(table, txdata, receipt) {
    try {
        if(txdata.input && txdata.input.length > 2) { // 컨트랙트 트랜젝션
            if(txdata.to != null && await isDkargoContract(txdata.to) == true) { // 디카르고 컨트랙트인 경우에만 처리
                const selector = txdata.input.substr(0, 10);
                switch(selector) {
                case '0x4420e486': { // "register(address)"
                    let ret = await getEventArguments('CompanyRegistered', table, receipt); // 이벤트 파라메터 획득
                    if (ret != null) {
                        for(let idx = 0; idx < ret.length; idx++) {
                            Log('INFO',  `EVENT:[${CYAN('CompanyRegistered')}], BLOCK:[${BLUE(txdata.blockNumber)}]`);
                            Log('DEBUG', `- address....: [${GREEN(ret[idx].company)}]`);
                        }
                    }
                    break;
                }
                case '0x2ec2c246': { // "unregister(address)"
                    let ret = await getEventArguments('CompanyUnregistered', table, receipt); // 이벤트 파라메터 획득
                    if (ret != null) {
                        for(let idx = 0; idx < ret.length; idx++) {
                            Log('INFO',  `EVENT:[${CYAN('CompanyUnregistered')}], BLOCK:[${BLUE(txdata.blockNumber)}]`);
                            Log('DEBUG', `- address....: [${GREEN(ret[idx].company)}]`);
                        }
                    }
                    break;
                }
                case '0x6a256b29': { // "settle(address)"
                    let ret = await getEventArguments('Settled', table, receipt); // 이벤트 파라메터 획득
                    if (ret != null) {
                        for(let idx = 0; idx < ret.length; idx++) {
                            Log('INFO',  `EVENT:[${CYAN(`Settled`)}], BLOCK:[${BLUE(txdata.blockNumber)}]`);
                            Log('DEBUG', `- addr.....: [${GREEN(ret[idx].addr)}]`);
                            Log('DEBUG', `- value....: [${GREEN(ret[idx].value)}] DKA`);
                            Log('DEBUG', `- rests....: [${GREEN(ret[idx].rests)}] DKA`);
                        }
                    }
                    break;
                }
                case '0xe50097a9': { // "updateOrderCode(address,uint256,uint256)"
                    let ret = await getEventArguments('OrderTransferred', table, receipt); // 이벤트 파라메터 획득
                    if (ret != null) {
                        for(let idx = 0; idx < ret.length; idx++) {
                            Log('INFO',  `EVENT:[${CYAN(`OrderTransferred`)}], BLOCK:[${BLUE(txdata.blockNumber)}]`);
                            Log('DEBUG', `- order..........: [${GREEN(ret[idx].order)}]`);
                            Log('DEBUG', `- from...........: [${GREEN(ret[idx].from)}]`);
                            Log('DEBUG', `- to.............: [${GREEN(ret[idx].to)}]`);
                            Log('DEBUG', `- transportid....: [${GREEN(ret[idx].transportid)}]`);
                            if(ret[idx].transportid != 1) { // 주문의 최초상태변경이 아닌 경우, 이전 상태변경 이벤트가 반드시 존재함 -> 해당 이벤트의 execute 필드를 true로 변경해야 함
                                let lasttid = ret[idx].transportid - 1;
                                let data = await Work.findOneAndUpdate(
                                    {$and:[{order: ret[idx].order}, {to: ret[idx].from}, {transportid: lasttid}]},
                                    {$set: {executed: true}},
                                    {new: true});
                                if(data == null) {
                                    let action = `Not Found Previous Event!\n` +
                                    `- [ORDER]:       [${BLUE(ret[idx].order)}]\n` +
                                    `- [COMPANY]:     [${BLUE(ret[idx].from)}]\n` +
                                    `- [TRANSPORTID]: [${BLUE(lasttid)}]`;
                                    Log('DEBUG', `ERROR: ${action}`);
                                }
                            }
                            if(ret[idx].to != ZEROADDR) { // 마지막 배송 완료 이벤트의 경우 GETWORK 처리를 하지 않음
                                let item = new Work();
                                item.order = ret[idx].order;
                                item.from = ret[idx].from;
                                item.to = ret[idx].to;
                                item.transportid = ret[idx].transportid;
                                item.blocknumber = txdata.blockNumber;
                                item.executed = false;
                                await Work.collection.insertOne(item);
                            }
                        }
                    }
                    ret = await getEventArguments('IncentiveUpdated', table, receipt); // 이벤트 파라메터 획득
                    if (ret != null) {
                        for(let idx = 0; idx < ret.length; idx++) {
                            Log('INFO',  `EVENT:[${CYAN(`IncentiveUpdated`)}], BLOCK:[${BLUE(txdata.blockNumber)}]`);
                            Log('DEBUG', `- addr.....: [${GREEN(ret[idx].addr)}]`);
                            Log('DEBUG', `- value....: [${GREEN(ret[idx].value)}]`);
                        }
                    }
                    break;
                }
                case '0x786643c0': { // "submitOrderCreate()"
                    let ret = await getEventArguments('OrderCreated', table, receipt); // 이벤트 파라메터 획득
                    if (ret != null) {
                        for(let idx = 0; idx < ret.length; idx++) {
                            Log('INFO',  `EVENT:[${CYAN(`OrderCreated`)}], BLOCK:[${BLUE(txdata.blockNumber)}]`);
                            Log('DEBUG', `- address....: [${GREEN(ret[idx].order)}]`);
                            Log('DEBUG', `- id.........: [${GREEN(ret[idx].id)}]`);
                        }
                    }
                    ret = await getEventArguments('OrderTransferred', table, receipt); // 이벤트 파라메터 획득
                    if (ret != null) {
                        for(let idx = 0; idx < ret.length; idx++) {
                            Log('INFO',  `EVENT:[${CYAN(`OrderTransferred`)}], BLOCK:[${BLUE(txdata.blockNumber)}]`);
                            Log('DEBUG', `- order..........: [${GREEN(ret[idx].order)}]`);
                            Log('DEBUG', `- from...........: [${GREEN(ret[idx].from)}]`);
                            Log('DEBUG', `- to.............: [${GREEN(ret[idx].to)}]`);
                            Log('DEBUG', `- transportid....: [${GREEN(ret[idx].transportid)}]`);
                            if(ret[idx].transportid != 1) { // 주문의 최초상태변경이 아닌 경우, 이전 상태변경 이벤트가 반드시 존재함 -> 해당 이벤트의 execute 필드를 true로 변경해야 함
                                let lasttid = ret[idx].transportid - 1;
                                let data = await Work.findOneAndUpdate(
                                    {$and:[{order: ret[idx].order}, {to: ret[idx].from}, {transportid: lasttid}]},
                                    {$set: {executed: true}},
                                    {new: true});
                                if(data == null) {
                                    let action = `Not Found Previous Event!\n` +
                                    `- [ORDER]:       [${BLUE(ret[idx].order)}]\n` +
                                    `- [COMPANY]:     [${BLUE(ret[idx].from)}]\n` +
                                    `- [TRANSPORTID]: [${BLUE(lasttid)}]`;
                                    Log('DEBUG', `ERROR: ${action}`);
                                }
                            }
                            let item = new Work();
                            item.order = ret[idx].order;
                            item.from = ret[idx].from;
                            item.to = ret[idx].to;
                            item.transportid = ret[idx].transportid;
                            item.blocknumber = txdata.blockNumber;
                            item.executed = false;
                            await Work.collection.insertOne(item);
                        }
                    }
                    break;
                }
                default:
                    break;
                }
            }
        }
    } catch(error) {
        Log('ERROR', `${RED(error)}`);
    }
}

/**
 * @notice 과거의 블록정보에 대한 파싱작업을 수행한다.
 * @param {Number} startblock 스타트 블럭넘버
 * @param {Object} table Event Log Parsing 테이블
 * @author jhhong
 */
let syncPastBlocks = async function(startblock, table) {
    try {
        let curblock = startblock;
        while(await web3.eth.getBlockNumber() >= curblock) {
            let data = await web3.eth.getBlock(curblock, true);
            if(await Block.countDocuments({nettype: 'logistics'}) == 0) {
                let item = new Block();
                item.nettype = 'logistics';
                item.blockNumber = data.number;
                await Block.collection.insertOne(item);
            } else {
                await Block.collection.updateOne({nettype: 'logistics'}, {$set: {blockNumber: data.number}});
            }
            let latest = await Block.findOne({nettype: 'logistics'});
            Log('DEBUG', `New Block Detected: BLOCK:[${BLUE(latest.blockNumber)}]`);
            for(idx in data.transactions) {
                const txdata  = data.transactions[idx];
                const receipt = await web3.eth.getTransactionReceipt(txdata.hash);
                await parseEvents(table, txdata, receipt);
            }
            curblock++;
        }
        Log('INFO', `START BLOCK:[${curblock}]`);
    } catch(error) {
        Log('ERROR', `${RED(error)}`);
    }
}

/**
 * @notice Event 모니터링 수행 함수
 * @author jhhong
 */
let RunProc = async function() {
    try {
        await initLog(); // 로그 초기화
        await enableLogFile(`apis/sync`);
        if(process.argv.length != 4) {
            throw new Error("Invalid Parameters!");
        }
        let startblock = await getStartBlock(process.argv[2], process.argv[3]);
        if(startblock == 0) {
            throw new Error(`Need to reset DB! Exit!`);
        }
        Log('DEBUG', GRAY(`Start Monitoring from BlockNumber:[${startblock}]......`));
        let table = await createEventParseTable(); // Event Parsing Table 생성
        if (table == null) {
            throw new Error("\"EVENT TABLE\" create Failed!");
        }
        await syncPastBlocks(startblock, table);

        /**
         * @notice 새 블록 구독
         */
        web3.eth.subscribe('newBlockHeaders', async function(error) {
            if(error != null) {
                Log('ERROR', RED(`ERROR: ${error}`));
            }
        }).on('data', async (header) => {
            let data = await web3.eth.getBlock(header.hash, true);
            if(await Block.countDocuments() == 0) {
                let item = new Block();
                item.nettype = 'logistics';
                item.blockNumber = data.number;
                await Block.collection.insertOne(item);
            } else {
                await Block.collection.updateOne({nettype: 'logistics'}, {$set: {blockNumber: data.number}});
            }
            let latest = await Block.findOne();
            Log('DEBUG', `New Block Detected: BLOCK:[${BLUE(latest.blockNumber)}]`);
            for(idx in data.transactions) {
                const txdata  = data.transactions[idx];
                const receipt = await web3.eth.getTransactionReceipt(txdata.hash);
                await parseEvents(table, txdata, receipt);
            }
        }).on('error', async (log) => {
            Log('ERROR', RED(`ERROR occured: ${log}`));
        });
     } catch(error) {
        Log('ERROR', `${RED(error)}`);
        process.exit(1);
     }
 }
 RunProc();