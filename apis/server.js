/**
 * @file server.js
 * @notice Api Server Backend 메인파일 (express)
 * @author jhhong
 */
const colors = require('colors/safe'); // 콘솔 Color 출력
const express = require('express'); // express 패키지
const app = express(); // express Object
const cors = require('cors'); // CORS 관리 패키지

/**
 * @notice 사용법 출력함수이다.
 * @author jhhong
 */
function usage() {
    const fullpath = __filename.split('/');
    const filename = fullpath[fullpath.length - 1];
    console.log(colors.green("Usage:"));
    console.log(`> node ${filename} [argv1]`);
    console.log(`....[argv1]: Port Number`);
}

/**
 * @notice 메인 실행함수이다.
 * @author jhhong
 */
let RunProc = async function() {
    try {
        if(process.argv.length != 3) {
            throw new Error("invalid paramters!");
        }
        let port = process.argv[2];
        await app.listen(port);
        console.log(colors.gray(`API EXPRESS SERVER HAS STARTED ON PORT [${colors.cyan(port)}]`));
        app.use(express.json());
        app.use(express.urlencoded({extended: true}));
        app.use(cors());
        require('./router')(app);
    } catch(error) {
        console.log(colors.red(error));
        usage();
        process.exit(1);
    }
}
RunProc();