const insertNewData = require('../models/insertData_model');
const inputDataByAcc = require('../models/updateData_model');
const matchOwner = require('../models/matchOwner');
const riderFilter = require('../models/riderFilter_model');
const findData = require('../models/findData_model');
const findOneData = require('../models/findOneData_model');
const rate = require('../models/rate');
const upload = require('../service/image');
const { ImgurClient } = require('imgur');

// sending email
const credentials = require('../models/credentials')
const from = credentials.gmail.user;
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        user: from,
        pass: credentials.gmail.pass,
    },
    tls: {
        rejectUnauthorized: false
    }
});

/*  global variables, for using the information conviniently.   
    password cannot be recorded in global variables for security. */
var LOCAL_INFO = {  
    account     : null,                                     //帳號
    name        : null,                                     //姓名
    phone       : null,                                     //電話
    email       : null,                                     //email
    identity    : null,                                      //上線身分 (owner / passenger)
    findPair    : null                                      //車主要找的乘客姓名 or 乘客要找的車主姓名
};

var LOCAL_O_DATA = {  
    account     : null,                                     //帳號
    status      : "offline",                                //上線狀態 (online / busy / offline)
    gender      : "secret",                                 //性別 (male / female)
    license     : null,                                     //車牌號碼
    helmet      : null,                                     //是否有安全帽 (yes / no)
    area        : null,                                     //可接送地點 <Array>
    workingTime : null,                                     //可載客時間 <Array>
    other       : "No other condition or comment.",         //其他說明
    denyReason  : null,                                     //拒絕原因
    remark      : null,                                     //備註
    rateTotal   : 0,                                        //總評分	
    rateCount   : 0,                                        //評分數量	
    comment     : null,                                     //評論
};

var LOCAL_P_DATA = {  
    account     : null,                                     //帳號
    gender      : "secret",                                 //性別 (male / female)
    helmet      : null,                                     //是否有安全帽 (yes / no)
    takingTime  : null,                                     //搭乘時間
    takingPlace : null,                                     //乘客上車地點
    destination : null,                                     //目的地
    other       : "No other condition or comment.",         //其他說明
    remark      : null,                                     //備註
};

/*  To avoid the data not changed to cover old data.  
    Must be called before call inputDataByAcc !!      */
function updateLocalInfo(identityData) { 
    LOCAL_INFO.account  = (identityData.account)  ? identityData.account  : LOCAL_INFO.account;    
    LOCAL_INFO.name     = (identityData.name)     ? identityData.name     : LOCAL_INFO.name;    
    LOCAL_INFO.phone    = (identityData.phone)    ? identityData.phone    : LOCAL_INFO.phone;  
    LOCAL_INFO.email    = (identityData.email)    ? identityData.email    : LOCAL_INFO.email;  
    LOCAL_INFO.identity = (identityData.identity) ? identityData.identity : LOCAL_INFO.identity;   
    LOCAL_INFO.findPair = (identityData.findPair) ? identityData.findPair : LOCAL_INFO.findPair;   
    
    console.log("[succ] update local info successfully." );
};
function updateLocalOData(ownerData) { 
    LOCAL_O_DATA.account     = (ownerData.account)     ? ownerData.account      : LOCAL_O_DATA.account;
    LOCAL_O_DATA.status      = (ownerData.status)      ? ownerData.status       : LOCAL_O_DATA.status;       
    LOCAL_O_DATA.gender      = (ownerData.gender && ownerData.gender != "null")      ? ownerData.gender       : LOCAL_O_DATA.gender;   
    LOCAL_O_DATA.license     = (ownerData.license)     ? ownerData.license      : LOCAL_O_DATA.license;
    LOCAL_O_DATA.helmet      = (ownerData.helmet)      ? ownerData.helmet       : LOCAL_O_DATA.helmet;
    LOCAL_O_DATA.area        = (ownerData.area)        ? ownerData.area         : LOCAL_O_DATA.area;
    LOCAL_O_DATA.workingTime = (ownerData.workingTime) ? ownerData.workingTime  : LOCAL_O_DATA.workingTime;
    LOCAL_O_DATA.other       = (ownerData.other)       ? ownerData.other        : LOCAL_O_DATA.other;
    LOCAL_O_DATA.denyReason  = (ownerData.denyReason)  ? ownerData.denyReason   : LOCAL_O_DATA.denyReason;
    LOCAL_O_DATA.rateTotal    = (ownerData.rateTotal ) ? ownerData.rateTotal    : LOCAL_O_DATA.rateTotal   ;
    LOCAL_O_DATA.rateCount    = (ownerData.rateCount ) ? ownerData.rateCount    : LOCAL_O_DATA.rateCount   ;
    LOCAL_O_DATA.comment      = (ownerData.comment   ) ? ownerData.comment      : LOCAL_O_DATA.comment     ;
    console.log("[succ] update local owner data successfully." );
};
function updateLocalPData(passengerData) { 
    LOCAL_P_DATA.account      = (passengerData.account     ) ? passengerData.account     : LOCAL_P_DATA.account     ;
    LOCAL_P_DATA.gender       = (passengerData.gender && passengerData.gender != "null") ? passengerData.gender    : LOCAL_P_DATA.gender        ;   
    LOCAL_P_DATA.helmet       = (passengerData.helmet      ) ? passengerData.helmet      : LOCAL_P_DATA.helmet      ;
    LOCAL_P_DATA.takingTime   = (passengerData.takingTime  ) ? passengerData.takingTime  : LOCAL_P_DATA.takingTime  ;
    LOCAL_P_DATA.takingPlace  = (passengerData.takingPlace ) ? passengerData.takingPlace : LOCAL_P_DATA.takingPlace ;
    LOCAL_P_DATA.destination  = (passengerData.destination ) ? passengerData.destination : LOCAL_P_DATA.destination ;
    LOCAL_P_DATA.other        = (passengerData.other       ) ? passengerData.other       : LOCAL_P_DATA.other       ;
    LOCAL_P_DATA.remark       = (passengerData.remark      ) ? passengerData.remark      : LOCAL_P_DATA.remark      ;
    console.log("[succ] update local passenger data successfully." );
};

//clear all lacal identity info (use in log out or no found data)
function clearLocalVar() { 
    LOCAL_INFO.account       = null;                            
    LOCAL_O_DATA.account     = null;                            
    LOCAL_P_DATA.account     = null;                            
    LOCAL_INFO.name          = null;                            
    LOCAL_INFO.phone         = null;                            
    LOCAL_INFO.email         = null;                            
    LOCAL_O_DATA.gender      = "secret";                        
    LOCAL_P_DATA.gender      = "secret";                        
    LOCAL_O_DATA.status      = "offline";                            
    LOCAL_O_DATA.license     = null;                            
    LOCAL_O_DATA.helmet      = null;                            
    LOCAL_O_DATA.area        = null;                            
    LOCAL_O_DATA.workingTime = null; 
    LOCAL_P_DATA.destination = null;  
    LOCAL_P_DATA.takingPlace = null; 
    LOCAL_P_DATA.takingTime  = null;                         
    LOCAL_O_DATA.other       = "No other condition or comment.";
    LOCAL_O_DATA.denyReason  = null;  
    LOCAL_P_DATA.remark      = null;                     
    LOCAL_INFO.findPair      = null; 
    LOCAL_O_DATA.rateTotal   = 0;
    LOCAL_O_DATA.rateCount   = 0;
    LOCAL_O_DATA.comment     = null;                               
    console.log("[succ] clear local variable successfully." );
};


module.exports = class member{

    postRegister(req, res, next){
    
        var registerData = {
            account: req.body.account,
            password: req.body.password,
            email: req.body.email
        };
        findOneData({account: registerData.account}, 'basicCollection')
        .then(result => {
            if(result) {
                console.log("[warn] This account had been registered.");
                res.json({
                    result: "had account"
                });
            }
            else {
                insertNewData(registerData, 'basicCollection');
                LOCAL_INFO.account = req.body.account;
                console.log(req.body.account );
                updateLocalInfo(registerData);
                res.json({
                    result: "register succ"
                });
            }
        });
    }

    postLogin(req, res, next){
        
        clearLocalVar();

        var signInData = {
            account:    req.body.account,
            password:   req.body.password
        };
        
        findOneData(signInData, 'basicCollection').then(result => {
            if(result){
                console.log("[succ] succ to login." );
                updateLocalInfo(result);
                updateDataFromDB(signInData.account).then(() => {
                    res.json({
                        result: "find user"
                    });
                });
            }
            else {
                console.log("[err] fail to login (no found data)." );
                clearLocalVar();
                res.json({
                    result: "no user"
                });
            }

        },(err) => {
            console.log("[err] login err." );
            console.log(err);
            res.json({
                result: "login err"
            });
        });
        
        
        async function updateDataFromDB(userAccount){
            await findOneData({account: userAccount}, 'ownerCollection')
            .then(result => {
                if(result)
                    updateLocalOData(result);
            });
            
            await findOneData({account: userAccount}, 'passengerCollection')
            .then(result => {
                if(result)
                    updateLocalPData(result);
            });
    
        }
    }

    postLogout(req, res, next){
        
        if(LOCAL_INFO.identity == "owner"){
            updateLocalOData({status : "offline"});
            ownerLogout().then(()=>{
                inputDataByAcc(LOCAL_O_DATA, 'ownerCollection');
                res.json({
                    result: "logout succ"
                });
            })
        }
        else{
            clearLocalVar();
            res.json({
                result: "logout succ"
            });
        }
        
    }

    postMatchOwner(req, res, next){     //乘客頁面列出車主
    
        var matchData = {
            status:     "online"
        };
        var returnArray = [];
        
        matchOwner(matchData, 'ownerCollection').then(result =>{
            addArr(result).then(()=>{
                res.json({
                    status: "match 成功",
                    result: returnArray
                });
            });
        });

        async function addArr(result){
            for(var i = 0; i < result.length; i++){
                var returnCompenent = {};
                await findOneData({account: result[i].account}, 'basicCollection').then(basicResult =>{
                    returnCompenent.name     = basicResult.name     ;
                    returnCompenent.phone    = basicResult.phone    ;
                    returnCompenent.email    = basicResult.email    ;
                    returnCompenent.identity = basicResult.identity ;
                    returnCompenent.findPair = basicResult.findPair ;
                },(err) =>{
                    console.log("[err] find matched owner data 失敗")
                });
                returnCompenent.account     = result[i].account     ;
                returnCompenent.status      = result[i].status      ;
                returnCompenent.gender      = result[i].gender      ;
                returnCompenent.license     = result[i].license     ;
                returnCompenent.helmet      = result[i].helmet      ;
                returnCompenent.area        = result[i].area        ;
                returnCompenent.workingTime = result[i].workingTime ;
                returnCompenent.other       = result[i].other       ;
                returnCompenent.denyReason  = result[i].denyReason  ;
                returnCompenent.remark      = result[i].remark      ;
                returnCompenent.rateTotal   = result[i].rateTotal   ;
                returnCompenent.rateCount   = result[i].rateCount   ;
                returnCompenent.comment     = result[i].comment     ;
                
                returnArray[i] = returnCompenent;
            }
        }
    }

    postChangeInfo(req, res, next){     // 修改資訊

        var changeBasicData = {
            account:    LOCAL_INFO.account,         //帳號
            name:       req.body.name,              //姓名
            phone:      req.body.phone,             //電話
            email:      req.body.email,             //email
            identity:   req.body.identity,          //登入身分
        };
        
        var changeOwnerData = {
            account:        LOCAL_INFO.account,     //帳號
            gender:         req.body.gender,        //性別
            license:        req.body.license,       //車牌
            helmet:         req.body.helmet,        //安全帽
            area:           req.body.area,          //接送區域
            workingTime:    req.body.workingTime,   //時間
            other:          req.body.other,         //其他資訊
            denyReason:     req.body.denyReason,    //拒絕原因
            remark:         req.body.remark,        //remark
            rateTotal:      req.body.rateTotal,
            rateCount:      req.body.rateCount,
            comment:        req.body.comment
        };
        
        var changePassengerData = {
            account:        LOCAL_INFO.account,     //帳號
            gender:         req.body.gender,        //性別
            helmet:         req.body.helmet,        //安全帽
            takingTime:     req.body.takingTime,    //接送區域
            takingPlace:    req.body.takingPlace,   //時間
            destination:    req.body.destination,   //其他資訊
            other:          req.body.other,         //拒絕原因
            remark:         req.body.remark,        //remark
        };

        updateLocalInfo(changeBasicData);
        inputDataByAcc(LOCAL_INFO, 'basicCollection').then(() => {
            if(LOCAL_INFO.identity == "owner") {
                updateLocalOData(changeOwnerData);
                inputDataByAcc(LOCAL_O_DATA, 'ownerCollection').then(() => {
                    console.log("[succ] change owner data 成功");
                    console.log(req.body);
                    console.log(req.body.gender);
                });
            }
            else if(LOCAL_INFO.identity == "passenger") {
                updateLocalPData(changePassengerData);
                inputDataByAcc(LOCAL_P_DATA, 'passengerCollection').then(() => {
                    console.log(req);
                    console.log("[succ] change passenger data 成功");
                });
            }
        });
    }

    postRiderFilter(req, res, next){
        
        var returnArray = [];
        var desData = {
            // account:     "peanut",
            // password:    "peanutPie",
            account:     LOCAL_INFO.account,
            destination: req.body.destination
        };
        // updateLocalVar(desData);
        // inputDataByAcc(LOCAL_INFO);
        console.log("destination" + req.body.destination);

        findData(desData, 'passengerCollection').then(result => {
            if(result.status == "succ"){
                console.log("[account]" + result[0].account);
                updateLocalVar(result[0]);
                inputDataByAcc(LOCAL_INFO, 'passengerCollection');
            }
            else if(result.status == "no found"){
                console.log("[err] fail to find." );
                clearLocalVar();
            }
        });
        var filterData = {
            /*name:       req.body.name,*/
            gender:     req.body.gender,
            helmet:     req.body.helmet,
            area:       req.body.area,
            takingPlace:req.body.takingPlace
        }
       
        console.log("[filter] gender: " + filterData.gender);
        riderFilter(filterData)
        .then(result => {
            console.log("[note] this is filter");
            
            addArr(result).then(() => {
                console.log("riderFilter = " + returnArray);
                res.json({
                    status: "match 成功",
                    result: returnArray
                })
            })
            
        },(err) => {
            console.log("[fail] fail to filt");
            res.json({
                status: "filt data 失敗",
                result: err
            })
        });

        async function addArr(result){
            for(var i = 0; i < result.length; i++){
                var returnCompenent = {};
                await findOneData({account: result[i].account}, 'basicCollection').then(basicResult =>{
                    returnCompenent.name     = basicResult.name     ;
                    returnCompenent.phone    = basicResult.phone    ;
                    returnCompenent.email    = basicResult.email    ;
                    returnCompenent.identity = basicResult.identity ;
                    returnCompenent.findPair = basicResult.findPair ;
                });
                returnCompenent.account     = result[i].account     ;
                returnCompenent.status      = result[i].status      ;
                returnCompenent.gender      = result[i].gender      ;
                returnCompenent.license     = result[i].license     ;
                returnCompenent.helmet      = result[i].helmet      ;
                returnCompenent.area        = result[i].area        ;
                returnCompenent.workingTime = result[i].workingTime ;
                returnCompenent.other       = result[i].other       ;
                returnCompenent.denyReason  = result[i].denyReason  ;
                returnCompenent.remark      = result[i].remark      ;
                returnCompenent.rateTotal   = result[i].rateTotal   ;
                returnCompenent.rateCount   = result[i].rateCount   ;
                returnCompenent.comment     = result[i].comment     ;

                returnArray[i] = returnCompenent;
            }
        }
    }

    postUploadPhoto(req, res, next){        //上傳照片
        upload(req, res, async () => {
            const client = new ImgurClient({
              clientId: '73d766fcb0de170',
              clientSecret: 'd15fa884f676e9c4d5ec0528b4c9f510ce72b76d',
              refreshToken: 'd6cd7b8e0e067ba6f6292f0e85a7d1c24543efcb',
            });
            const response = await client.upload({
                image: req.files[0].buffer.toString('base64'),
                type: 'base64',
                album: '4IcQTIb'
              });
              res.send({ url: response.data.link });
            })
    }

    postFindPassenger(req, res, next){   //列出車主 mainPage 的乘客資料
        
        var passengerDataQuery = {
            findPair: LOCAL_INFO.account,
            identity: "passenger"
        };
        var returnArray = [];

        findData(passengerDataQuery, 'basicCollection').then(result =>{
            addArr(result).then(() => {
                res.json({
                    status: "list 成功",
                    result: returnArray
                });
            });
        });

        async function addArr(result){
            for(var i = 0; i < result.length; i++){
                var returnCompenent = {};

                await findOneData({account : result[i].account}, 'passengerCollection').then(basicResult => {
                    returnCompenent.gender      = basicResult.gender;
                    returnCompenent.helmet      = basicResult.helmet;
                    returnCompenent.takingTime  = basicResult.takingTime;
                    returnCompenent.takingPlace = basicResult.takingPlace;
                    returnCompenent.destination = basicResult.destination;
                    returnCompenent.other       = basicResult.other;
                    returnCompenent.remark      = basicResult.remark;
                },(err)=> {
                    console.log("[err] find passenger request 失敗");
                });
                returnCompenent.account  = result[i].account;
                returnCompenent.name     = result[i].name;
                returnCompenent.phone    = result[i].phone;
                returnCompenent.email    = result[i].email;
                returnCompenent.identity = result[i].identity;
                returnCompenent.findPair = result[i].findPair;    
                returnArray[i] = returnCompenent
            }
        }
    }

    getCheckIdentify(req, res, next){   // 確認有無該身分

        LOCAL_INFO.identity = req.body.identity;
        if(LOCAL_INFO.identity == "owner") {
            console.log("[chk] it's owner");

            // change owner's data
            if (checkIdentity("owner")){
                LOCAL_O_DATA.status = "online";
                inputDataByAcc(LOCAL_O_DATA, 'ownerCollection')
                .then(() => {
                    console.log("chk result = find owner");
                    res.json({
                        status: "change owner data 成功",
                        result: "find owner"
                    });
                });
            }
            else{
                console.log("chk result = no owner");
                res.json({
                    status: "change owner data 失敗",
                    result: "no owner"
                });
            }
        }
        else if(LOCAL_INFO.identity == "passenger") {
            console.log("[chk] it's passenger");

            // change owner's status to offline
            if(checkIdentity("owner")){
                LOCAL_O_DATA.status = "offline";
                inputDataByAcc(LOCAL_O_DATA, 'ownerCollection');
            }

            // change passenger's data
            if(checkIdentity("passenger")){
                console.log("[succ] find passenger");
                res.json({
                    status: "change passenger data 成功",
                    result: "find passenger"
                });
            }
            else{
                console.log("[fail] no passenger");
                res.json({
                    status: "change passenger data 失敗",
                    result: "no passenger"
                });
            }
        }

        function checkIdentity(identityToCheck){
            if(identityToCheck == "owner") {
                return (LOCAL_O_DATA.account != null);
            }
            else if(identityToCheck == "passenger"){
                return (LOCAL_P_DATA.account != null);
            }
        }
    }

    postFindOwner(req, res, next){      //乘客送出訂單給車主
        
        updateLocalInfo({findPair : req.body.account});

        inputDataByAcc(LOCAL_INFO, 'basicCollection');
        // inputDataByAcc(LOCAL_P_DATA, 'passengerCollection');

        var myOwner = {
            identity:   "owner",
            account:     LOCAL_INFO.findPair
        }

        findOneData(myOwner, 'basicCollection').then(result =>{
            var sendContent = 
                "<p>叮咚! 有新的訂單囉!<br><a href='http://127.0.0.1:3000/mainPage.html'>來去海大共乘網看看~</a><br>";
            var sendData = {
                from:       from,
                to:         result.email,
                subject:    '海大共乘網 有您的新消息',
                html:       sendContent
            };
            transporter.sendMail(sendData).then(info => {
                console.log("[succ] send mail.");
            }).catch(console.error);
            
        },(err) => {
            console.log("err: " + err);
        });
    }

    postAcceptOrder(req, res, next){   //車主接收並回覆訂單給乘客
        updateLocalInfo({findPair : req.body.account});
        inputDataByAcc(LOCAL_INFO, 'basicCollection');

        updateLocalOData({status: "busy"});
        inputDataByAcc(LOCAL_O_DATA, 'ownerCollection');

        var myPassenger = {
            identity:   "passenger",
            account:    LOCAL_INFO.findPair
        }
        
        findOneData(myPassenger, 'basicCollection').then(result =>{

            var sendContent = 
                "<p>您的訂單已被接受</p>" +
                '<p>車主姓名 : '+ LOCAL_INFO.name + '<br>' + 
                '    性別 : '+ LOCAL_O_DATA.gender + '<br>' + 
                '    電話 : ' + LOCAL_INFO.phone + '<br>' +
                '    備註 : ' + LOCAL_O_DATA.other + '</p>' +
                '<p>有任何問題請電話詳細聯絡~</p>';

            var sendData = {
                from:       from,
                to:         result.email,
                subject:    '海大共乘網 有您的新消息',
                html:       sendContent
            };
            
            transporter.sendMail(sendData).then(info => {
                console.log("[succ] send mail.");
                res.json({
                    result: "accept request succ"
                });
            }).catch(console.error);
            
        },(err) => {
            console.log("err: " + err);
        });
        
    }

    postRate(req, res, next){                               //新增評分
        
        var rateData = {
            account : LOCAL_O_DATA.account,
            rateTotal : LOCAL_O_DATA.rateTotal,
            rateCount : LOCAL_O_DATA.rateCount,
            comment : LOCAL_O_DATA.comment,
            rate : req.body.rate,
            newComment : req.body.comment
        };

        rate(rateData).then(result =>{
            res.json({
                status: "rating 成功",
                result: result
            })
        },(err) => {
            res.json({
                result: err
            })
        })
    }
}
