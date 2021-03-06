/**
 * @file Web3.js
 * @notice 환경설정파일(.env)에 기반한 web3 provider 생성
 * @author jhhong
 */

//// COMMON
const path = require('path'); // .env 경로 추출을 위함
//// WEB3
const WEB3 = require('web3'); // web3 모듈 패키지
//// ETHEREUMJS-TX
const Tx = require('ethereumjs-tx').Transaction; // Ethereum tx 생성 패키지
//// ETHEREUMJS-COMMON
const Custom = require('ethereumjs-common').default; // Ethereum Custom network 정의
//// DOTENV
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // 지정된 경로의 환경변수 사용 (.env 파일 참조)
//// LOGs
const Log = require('./libLog.js').Log; // 로그 출력
//// LOG COLOR (console)
const RED   = require('./libLog.js').consoleRed; // 콘솔 컬러 출력: RED
const GREEN = require('./libLog.js').consoleGreen; // 콘솔 컬러 출력: GREEN
//// GLOBALs
let prov1; // chain1을 제어할 Web3 Provider 생성
if(process.env.PROVIDER_TYPE1 == `http`) { // HTTP
    prov1 = new WEB3(new WEB3.providers.HttpProvider(`http://${process.env.PROVIDER_INFO1}`));
} else if(process.env.PROVIDER_TYPE1 == `websocket`) { // WEBSOCKET
    prov1 = new WEB3(new WEB3.providers.WebsocketProvider(`ws://${process.env.PROVIDER_INFO1}`));
} else if(process.env.PROVIDER_TYPE1 == `ipc`) { // IPC
    prov1 = new WEB3(new WEB3.providers.IpcProvider(`${process.env.PROVIDER_INFO1}`));
} else { // unsupported
    prov1 = null;
}
let prov2; // chain2을 제어할 Web3 Provider 생성
if(process.env.PROVIDER_TYPE2 == `http`) { // HTTP
    prov2 = new WEB3(new WEB3.providers.HttpProvider(`http://${process.env.PROVIDER_INFO2}`));
} else if(process.env.PROVIDER_TYPE2 == `websocket`) { // WEBSOCKET
    prov2 = new WEB3(new WEB3.providers.WebsocketProvider(`ws://${process.env.PROVIDER_INFO2}`));
} else if(process.env.PROVIDER_TYPE2 == `ipc`) { // IPC
    prov2 = new WEB3(new WEB3.providers.IpcProvider(`${process.env.PROVIDER_INFO2}`));
} else { // unsupported
    prov2 = null;
}
let txopt1; // chain1의 tx options 정보
switch(process.env.CHAIN_ID1) {
    case '1': // mainnet
        txopt1 = {chain: 'mainnet', hardfork: process.env.EVM_VERSION1};
        break;
    case '3': // ropsten testnet
        txopt1 = {chain: 'ropsten', hardfork: process.env.EVM_VERSION1};
        break;
    case '15': // privatenet
        const cutominfo = Custom.forCustomChain('mainnet', {chainId: Number(process.env.CHAIN_ID1)}, process.env.EVM_VERSION1);
        txopt1 = {common: cutominfo};
        break;
    default: // unsupported
        txopt1 = null;
        break;
}
let txopt2; // chain2의 tx options 정보
switch(process.env.CHAIN_ID2) {
    case '1': // mainnet
        txopt2 = {chain: 'mainnet', hardfork: process.env.EVM_VERSION2};
        break;
    case '3': // ropsten testnet
        txopt2 = {chain: 'ropsten', hardfork: process.env.EVM_VERSION2};
        break;
    case '15': // privatenet
        const cutominfo = Custom.forCustomChain('mainnet', {chainId: Number(process.env.CHAIN_ID2)}, process.env.EVM_VERSION2);
        txopt2 = {common: cutominfo};
        break;
    default: // unsupported
        txopt2 = null;
        break;
}

module.exports.prov1 = prov1; // Chain1의 Web3 Provider
module.exports.prov2 = prov2; // Chain2의 Web3 Provider

/**
 * @notice 트랜젝션을 생성하여 블록체인에 전송한다.(provider1 전용)
 * @param {object} privkey 서명자의 private key
 * @param {object} rawtx   트랜젝션 Raw Data
 * @return receipt 정보
 */
module.exports.prov1SendTx = async function(privkey, rawtx) {
    try {
        if(prov1 == null || prov1 == undefined) {
            throw new Error("invalid web3 provider!");
        }
        if(txopt1 == null || txopt1 == undefined) {
            throw new Error("invalid chain description!");
        }
        const tx = new Tx(rawtx, txopt1); // Transaction 생성
        const key = Buffer.from(privkey, 'hex'); // 환경설정파일(.env)에서 Private Key 획득
        tx.sign(key); // Private Key를 이용하여 Transaction 서명 수행
        const serialized = tx.serialize(); // Serialize
        const rawdata = '0x' + serialized.toString('hex'); // Raw data 생성
        let receipt = await prov1.eth.sendSignedTransaction(rawdata)
        .on('transactionHash', async function(txhash) {
            Log('DEBUG', `TX:['${GREEN(txhash)}'] Created!`);
        }); // 서명된 Transaction 전송
        return receipt; // receipt 정보 반환
    } catch(error) {
        let action = `Action: prov1SendTx`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return null;
    }
}

/**
 * @notice 트랜젝션을 생성하여 블록체인에 전송한다.(provider2 전용)
 * @param {object} privkey 서명자의 private key
 * @param {object} rawtx   트랜젝션 Raw Data
 * @return receipt 정보
 */
module.exports.prov2SendTx = async function(privkey, rawtx) {
    try {
        if(prov2 == null || prov2 == undefined) {
            throw new Error("Invalid web3 provider!");
        }
        if(txopt2 == null || txopt2 == undefined) {
            throw new Error("Invalid chain description!");
        }
        const tx = new Tx(rawtx, txopt2); // Transaction 생성
        const key = Buffer.from(privkey, 'hex'); // 환경설정파일(.env)에서 Private Key 획득
        tx.sign(key); // Private Key를 이용하여 Transaction 서명 수행
        const serialized = tx.serialize(); // Serialize
        const rawdata = '0x' + serialized.toString('hex'); // Raw data 생성
        let receipt = await prov2.eth.sendSignedTransaction(rawdata)
        .on('transactionHash', async function(txhash) {
            Log('DEBUG', `TX:['${GREEN(txhash)}'] Created!`);
        }); // 서명된 Transaction 전송
        return receipt; // receipt 정보 반환
    } catch(error) {
        let action = `Action: prov2SendTx`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return null;
    }
}

/**
 * @notice PROV1과 PROV2가 동일한 PROVIDER인지 확인한다.
 * @return Boolean (true: 같음, false: 다르거나 PROVIDER 오류)
 */
module.exports.isSameProvider = async function() {
    try {
        if(prov1._requestManager.provider.url == undefined || prov2._requestManager.provider.url == undefined) {
            throw new Error("Invalid web3 provider!");
        }
        return (prov1._requestManager.provider.url == prov2._requestManager.provider.url)? (true) : (false);
    } catch(error) {
        let action = `Action: isSameProvider`;
        Log('ERROR', `exception occured!:\n${action}\n${RED(error.stack)}`);
        return false;
    }
}