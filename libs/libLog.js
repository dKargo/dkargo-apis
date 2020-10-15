/**
 * @file libLog.js
 * @notice Log Library Functions 정의 (Based winston)
 * @author jhhong
 */

//// COMMON
const callsites = require('callsites'); // callsites: v8 자바스크립트 엔진 호출 스택 (Call-Stack) 분석기
const colors    = require('colors/safe'); // 콘솔 Color 출력
const fs        = require("fs"); // file-system: 로그 파일 처리를 위함
const path      = require('path'); // path: 로그 파일 처리를 위함
//// WINSTON
const createLogger = require("winston").createLogger; // winston: logger 객체 생성
const format       = require("winston").format; // winston: 출력 포맷
const transports   = require("winston").transports; // winston: logger 출력 속성 (console, file, http, ...)
require("winston-daily-rotate-file"); // winston 데일리 파일 패키지
//// GLOBAL VARs
let logger        = undefined; // 로거객체 (undefined로 초기화)
let transConsole  = undefined; // console transport
let transFiles    = undefined; // file transport
let colorful      = true; // 컬러 출력을 허용할지 여부 플래그 변수 (CONSOLE만 사용할 경우 true / 로그파일 저장할 경우 false)
const propConsole = { // 콘솔 출력속성 정의
    level: "debug", // 디폴트 로그레벨: debug
    format: format.combine( // 로그포맷 정의: 아래 포맷들이 결합되어 출력
        format.timestamp({format: "YYYY-MM-DD HH:mm:ss"}), // 로그포맷: timestamp 형식 정의
        format.colorize(), // 로그포맷: 글자 칼러 enable
        format.printf(data => `${data.timestamp} ${data.level}: ${data.message}`) // 출력포맷--> timestamp level: 내용
    )
};

/**
 * @notice 로그 모듈 초기화를 수행한다.
 * @dev 디폴트로 Console Transport가 활성화된다.
 * @return 성공 시 'ok', 실패 시 null을 반환
 * @author jhhong
 */
module.exports.initLog = async function() {
    try {
        if(logger != undefined) {
            throw new Error('Logger is aleady initialized!');
        }
        transConsole = new transports.Console(propConsole);
        logger = createLogger({transports: [transConsole]});
        return 'ok';
    } catch(error) {
        console.log(error);
        return null;
    }
}

/**
 * @notice File Transport를 활성화한다.
 * @param {string} id 로그 폴더 구분자
 * @return 성공 시 'ok', 실패 시 null을 반환
 * @author jhhong
 */
module.exports.enableLogFile = async function(id) {
    try {
        if(logger == undefined) {
            throw new Error('Logger is not initialized!');
        }
        const logdir = path.resolve(__dirname, '..', `logs`, `${id}`); // 로그 저장 경로
        if(!fs.existsSync(logdir)) {
            fs.mkdirSync (logdir, {recursive: true});
        }
        const propFiles = { // 파일 (daily-rotate) 출력속성 정의
            level: "debug", // 디폴트 로그레벨: debug
            filename: `${logdir}/%DATE%.log`, // 파일명명법: DATE정보.log
            datePattern: "YYYY-MM-DD", // filename: 텝의 DATE정보 format 정의 --> 로그파일이름 예시: 2020-06-10.log
            zippedArchive: false, // 압축 아카이브 사용할 것인지 --> false
            maxSize: "100m", // 파일 하나의 max size: 100MB
            maxFiles: "14d", // 파일 보관일수: 14일 (14일 지나면 제거)
            format: format.combine( // 로그포맷 정의: 아래 포맷들이 결합되어 출력
                format.timestamp({format: "YYYY-MM-DD HH:mm:ss"}), // 로그포맷: timestamp 형식 정의
                format.simple(),
                format.printf(data => `${data.timestamp} ${data.level}: ${data.message}`) // 출력포맷--> timestamp level: 내용
            )
        };
        transFiles = new transports.DailyRotateFile(propFiles);
        logger.add(transFiles);
        colorful = false;
        return 'ok';
    } catch(error) {
        console.log(error);
        return null;
    }
}

/**
 * @notice 로그를 출력한다.
 * @dev initLog 선행 필수
 * @param {string} prefix 로그레벨 지정자 (ERROR, WARN, INFO, DEBUG, VERBOSE, SILLY)
 * @param {string} str    출력할 데이터 (문자열)
 * @author jhhong
 */
module.exports.Log = async function(prefix, str) {
    if(logger != undefined) {
        let fullpath = callsites()[1].getFileName().split('/');
        const filename = fullpath[fullpath.length - 1];
        const linenumber = callsites()[1].getLineNumber();
        switch(prefix) {
        case 'ERROR':
            logger.error(`<${filename}:${linenumber}> ${str}`);
            break;
        case 'WARN':
            logger.warn(` <${filename}:${linenumber}> ${str}`);
            break;
        case 'INFO':
            logger.info(` <${filename}:${linenumber}> ${str}`);
            break;
        case 'DEBUG':
            logger.debug(`<${filename}:${linenumber}> ${str}`);
            break;
        case 'VERBOSE':
            logger.verbose(`<${filename}:${linenumber}> ${str}`);
            break;
        case 'SILLY':
            logger.silly(`<${filename}:${linenumber}> ${str}`);
            break;
        default:
            break;
        }
    }
}

/**
 * @notice RED COLOR 출력을 위한 태그가 추가된다.
 * @dev enableLogFile이 호출되면 비활성화됨
 * @param {string} str 출력할 데이터 (문자열)
 * @author jhhong
 */
module.exports.consoleRed = function(str) {
    return (colorful == true)? (colors.red(str)) : (str);
}

/**
 * @notice GREEN COLOR 출력을 위한 태그가 추가된다.
 * @dev enableLogFile이 호출되면 비활성화됨
 * @param {string} str 출력할 데이터 (문자열)
 * @author jhhong
 */
module.exports.consoleGreen = function(str) {
    return (colorful == true)? (colors.green(str)) : (str);
}

/**
 * @notice BLUE COLOR 출력을 위한 태그가 추가된다.
 * @dev enableLogFile이 호출되면 비활성화됨
 * @param {string} str 출력할 데이터 (문자열)
 * @author jhhong
 */
module.exports.consoleBlue = function(str) {
    return (colorful == true)? (colors.blue(str)) : (str);
}

/**
 * @notice CYAN COLOR 출력을 위한 태그가 추가된다.
 * @dev enableLogFile이 호출되면 비활성화됨
 * @param {string} str 출력할 데이터 (문자열)
 * @author jhhong
 */
module.exports.consoleCyan = function(str) {
    return (colorful == true)? (colors.cyan(str)) : (str);
}

/**
 * @notice GRAY COLOR 출력을 위한 태그가 추가된다.
 * @dev enableLogFile이 호출되면 비활성화됨
 * @param {string} str 출력할 데이터 (문자열)
 * @author jhhong
 */
module.exports.consoleGray = function(str) {
    return (colorful == true)? (colors.gray(str)) : (str);
}