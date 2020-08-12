/**
 * @file eventMonitor.js
 * @notice Event 모니터링을 수행한다.
 * @author jhhong
 */
const colors = require('colors/safe'); // 콘솔 Color 출력
const web3 = require('../libs/Web3.js').prov2; // web3 provider (물류 관련 contract는 privnet에 올라간다 (prov2))
const abi = require('../build/contracts/DkargoService.json').abi; // Service Contract ABI
const initLog = require('../libs/libLog.js').initLog; // 로그 초기화 함수 (winston)
const Log = require('../libs/libLog.js').Log; // 로그 출력
const isDkargoContract = require('./libs/apiCommon.js').isDkargoContract; // 디카르고 컨트랙트 증명을 위한 인터페이스를 지원하는지 여부 확인을 위한 API
const getDkargoPrefix = require('./libs/apiCommon.js').getDkargoPrefix; // 디카르고 컨트랙트의 Prefix를 읽어오기 위한 API
require('./db.js'); // for mongoose schema import
const mongoose = require('mongoose');
const Block = mongoose.model('Block'); // Block schema
const Work = mongoose.model('Work'); // Work schema

/**
 * @notice 사용법 출력함수이다.
 * @author jhhong
 */
function usage() {
    const fullpath = __filename.split('/');
    const filename = fullpath[fullpath.length - 1];
    console.log(colors.green("Usage:"));
    console.log(`> node ${filename} [argv1] [argv2]`);
    console.log(`....[argv1]: Service Address`);
    console.log(`....[argv2]: Start Block`);
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
        Log('DEBUG', `block: [${colors.green(data.number)}] txnum: [${colors.green(data.transactions.length)}]`);
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
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
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
        if(await Block.countDocuments() == 0) {
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
                    `- [Matched]:      [${colors.green(ret.n)}],\n` +
                    `- [Successful]:   [${colors.green(ret.ok)}],\n` +
                    `- [DeletedCount]: [${colors.green(ret.deletedCount)}]`;
                    Log('DEBUG', `${action}`);
                }
                return latest.blockNumber;
            } else {
                throw new Error(`Need to reset DB! (latest < defaultblock)`);
            }
        }
    } catch(error) {
        let action = `Action: getStartBlock`;
        Log('ERROR', `exception occured!:\n${action}\n${colors.red(error.stack)}`);
        return 0;
    }
}

/**
 * @notice Event 모니터링 수행 함수
 * @author jhhong
 */
let RunProc = async function() {
    try {
        if(process.argv.length != 4) {
            throw new Error("Invalid Parameters!");
        }
        initLog(); // 로그 초기화
        let startblock = await getStartBlock(process.argv[2], process.argv[3]);
        let service = await new web3.eth.Contract(abi, process.argv[2]);
        Log('DEBUG', colors.gray(`Start Monitoring from BlockNumber:[${startblock}]`));

        /**
         * @notice 새 블록 구독
         *
         */
        web3.eth.subscribe('newBlockHeaders', async function(error) {
            if(error != null) {
                Log('ERROR', colors.red(`ERROR: ${error}`));
            }
        }).on('data', async (header) => {
            let data = await web3.eth.getBlock(header.hash, true);
            if(await Block.countDocuments() == 0) {
                let item = new Block();
                item.index = 1;
                item.blockNumber = data.number;
                await Block.collection.insertOne(item);
            } else {
                await Block.collection.updateOne({index: 1}, {$set: {blockNumber: data.number}});
            }
            let latest = await Block.findOne();
            Log('DEBUG', `New Block Detected: BLOCK:[${colors.blue(latest.blockNumber)}]`)
        }).on('error', async (log) => {
            Log('ERROR', colors.red(`ERROR occured: ${log}`));
        });
        /**
         * @notice 물류사 등록 이벤트 감지 루틴
         * @param company 등록된 물류사 컨트랙트 주소
         */
        service.events.CompanyRegistered({fromBlock: startblock}, async function(error) {
            if(error != null) {
                Log('ERROR', colors.red(`ERROR: ${error}`));
            }
        }).on('data', async (log) => {
            let {returnValues: {company}, event, blockNumber} = log;
            Log('INFO',  `[DkargoService] Event Detected: EVENT:[${colors.cyan(event)}], BLOCK:[${colors.blue(blockNumber)}]`);
            Log('DEBUG', `- address....: [${colors.green(company)}]`);
        }).on('error', async (log) => {
            Log('ERROR', colors.red(`ERROR occured: ${log}`));
        });
        /**
         * @notice 물류사 등록해제 이벤트 감지 루틴
         * @param company 등록해제된 물류사 컨트랙트 주소
         */
        service.events.CompanyUnregistered(async function(error) {
            if(error != null) {
                Log('ERROR', colors.red(`ERROR: ${error}`));
            }
        }).on('data', async (log) => {
            let {returnValues: {company}, event, blockNumber} = log;
            Log('INFO',  `[DkargoService] Event Detected: EVENT:[${colors.cyan(event)}], BLOCK:[${colors.blue(blockNumber)}]`);
            Log('DEBUG', `- address....: [${colors.green(company)}]`);
        }).on('error', async (log) => {
            Log('ERROR', colors.red(`ERROR occured: ${log}`));
        });
        /**
         * @notice 주문생성 이벤트 감지 루틴
         * @param order 주문 컨트랙트 주소
         * @param id 주문번호
         */
        service.events.OrderCreated(async function(error) {
            if(error != null) {
                Log('ERROR', colors.red(`ERROR: ${error}`));
            }
        }).on('data', async (log) => {
            let {returnValues: {order, id}, event, blockNumber} = log;
            Log('INFO',  `[DkargoService] Event Detected: EVENT:[${colors.cyan(event)}], BLOCK:[${colors.blue(blockNumber)}]`);
            Log('DEBUG', `- address....: [${colors.green(order)}]`);
            Log('DEBUG', `- id.........: [${colors.green(id)}]`);
        }).on('error', async (log) => {
            Log('ERROR', colors.red(`ERROR occured: ${log}`));
        });
        /**
         * @notice 주문 구간배송 완료 이벤트 감지 루틴
         * @param order 주문 컨트랙트 주소
         * @param from 구간배송 완료자
         * @param to 다음 구간배송 담당자
         * @param transportid 다음 구간배송 번호
         */
        service.events.OrderTransferred(async function(error) {
            if(error != null) {
                Log('ERROR', colors.red(`ERROR: ${error}`));
            }
        }).on('data', async (log) => {
            let {returnValues: {order, from, to, transportid}, event, blockNumber} = log;
            Log('INFO',  `[DkargoService] Event Detected: EVENT:[${colors.cyan(event)}], BLOCK:[${colors.blue(blockNumber)}]`);
            Log('DEBUG', `- order..........: [${colors.green(order)}]`);
            Log('DEBUG', `- from...........: [${colors.green(from)}]`);
            Log('DEBUG', `- to.............: [${colors.green(to)}]`);
            Log('DEBUG', `- transportid....: [${colors.green(transportid)}]`);
            if(transportid != 1) { // 주문의 최초상태변경이 아닌 경우, 이전 상태변경 이벤트가 반드시 존재함 -> 해당 이벤트의 execute 필드를 true로 변경해야 함
                console.log(`test....[${transportid}]`);
                let lasttid = transportid - 1;
                let data = await Work.findOneAndUpdate({$and: [{order: order}, {to: from}, {transportid: lasttid}]}, {$set: {executed: true}}, {new: true});
                if(data == null) {
                    let action = `Not Found Previous Event!\n` +
                    `- [ORDER]:       [${colors.blue(order)}]\n` +
                    `- [COMPANY]:     [${colors.blue(from)}]\n` +
                    `- [TRANSPORTID]: [${colors.blue(lasttid)}]`;
                    Log('DEBUG', `ERROR: ${action}`);
                }
            }
            let item = new Work();
            item.order = order;
            item.from = from;
            item.to = to;
            item.transportid = transportid;
            item.blocknumber = blockNumber;
            item.executed = false;
            await Work.collection.insertOne(item);
        }).on('error', async (log) => {
            Log('ERROR', colors.red(`ERROR occured: ${log}`));
        });
        /**
         * @notice 인센티브 갱신 이벤트 감지 루틴
         * @param addr 인센티브 수령 주소
         * @param value 증가될 인센티브 양
         */
        service.events.IncentiveUpdated(async function(error) {
            if(error != null) {
                Log('ERROR', colors.red(`ERROR: ${error}`));
            }
        }).on('data', async (log) => {
            let {returnValues: {addr, value}, event, blockNumber} = log;
            Log('INFO',  `[DkargoService] Event Detected: EVENT:[${colors.cyan(event)}], BLOCK:[${colors.blue(blockNumber)}]`);
            Log('DEBUG', `- addr.....: [${colors.green(addr)}]`);
            Log('DEBUG', `- value....: [${colors.green(value)}]`);
        }).on('error', async (log) => {
            Log('ERROR', colors.red(`ERROR occured: ${log}`));
        });
        /**
         * @notice 인센티브 정산 이벤트 감지 루틴
         * @param addr 인센티브 수령 주소
         * @param value 정산될 인센티브 양
         * @param rests 정산 후 남은 인센티브 양
         */
        service.events.Settled(async function(error) {
            if(error != null) {
                Log('ERROR', colors.red(`ERROR: ${error}`));
            }
        }).on('data', async (log) => {
            let {returnValues: {addr, value, rests}, event, blockNumber} = log;
            Log('INFO',  `[DkargoService] Event Detected: EVENT:[${colors.cyan(event)}], BLOCK:[${colors.blue(blockNumber)}]`);
            Log('DEBUG', `- addr.....: [${colors.green(addr)}]`);
            Log('DEBUG', `- value....: [${colors.green(value)}] DKA`);
            Log('DEBUG', `- rests....: [${colors.green(rests)}] DKA`);
        }).on('error', async (log) => {
            Log('ERROR', colors.red(`ERROR occured: ${log}`));
        });
     } catch(error) {
        Log('ERROR', `${colors.red(error)}`);
        usage();
        process.exit(1);
     }
 }
 RunProc();