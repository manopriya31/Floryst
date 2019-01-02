//custom route for fetching data  
var transactions = require('../data_access/transaction');  
  
module.exports = {  
    //set up route configuration that will be handle by express server  
    configure: function (app) {  

        app.post('/api/getOtp',function(req,res){
            var mobile=req.body.mobile;
            transactions.getOtp(mobile,res);
        });
  
        // adding route for users, here app is express instance which provide use  
        // get method for handling get request from http server.   
        app.post('/api/getAuthentication', function (req, res) {
            var mobile=req.body.mobile;
            var otp=req.body.otp;  
            transactions.getAuthentication(mobile,otp,res);  
        });  

        app.get('/api/getProducts',function(req,res){
            var authCode=req.get('Authorization');
            transactions.getProducts(authCode,res);
        });
        
        app.get('/api/getProductImgUrls',function(req,res){
            var pid=req.get('product_id');
            transactions.getProductsImgUrls(pid,res);
        });

        
        app.get('/api/getProfileDetails',function(req,res){
            var aCode=req.get('Authorization');
            transactions.getProfileDetails(aCode,res);
        });

        app.post('/api/addToBasket',function(req,res){
            var authenCode=req.get('Authorization');
            var product_id=req.body.prod_id;
            var quantity=req.body.quantity;
            transactions.addToBasket(authenCode,product_id,quantity,res);
        });

        app.post('/api/checkoutCart',function(req,res){
            var hCode=req.get('Authorization');
            var deliveryDate=req.body.date;
            var deliveryTime=req.body.time;
            var checkoutDescription=req.body.description;
            transactions.checkout(hCode,deliveryDate,deliveryTime,checkoutDescription,res);
        });

        app.get('/api/getOrders',function(req,res){
            var authKey=req.get('Authorization');
            transactions.getOrders(authKey,res);
        });

        app.get('/api/getBasket',function(req,res){
            var authenticationkey=req.get('Authorization');
            transactions.getBasket(authenticationkey,res);
        });

        app.post('/api/getProductDetailsByGroupID',function(req,res){
            var authentikey=req.get('Authorization');
            var gid=req.body.group_id;
            transactions.getProductDetailsByGroupID(authentikey,gid,res);
        });

        app.post('/api/deleteFromBasket',function(req,res){
            var aKey=req.get('Authorization');
            var pro=req.body.produ_id;
            transactions.deleteFromBasket(aKey,pro,res);
        });

        app.post('/api/cancelOrder',function(req,res){
            var auKey=req.get('Authorization');
            var oid=req.body.order_id;
            transactions.cancelOrder(auKey,oid,res);
        });


        app.post('/api/registerUserDetails',function(req,res){
            var autKey=req.get('Authorization');
            var fullname=req.body.name;
            var fulladdress=req.body.address;
            var areaname=req.body.area;
            var cityname=req.body.city;
            var pin=req.body.pincode;
            transactions.registerUserDetails(autKey,fullname,fulladdress,areaname,cityname,pin,res);
        });

        app.post('/api/contactUs',function(req,res){
            var hashkey=req.get('Authorization');
            var titlemsg=req.body.title;
            var msg=req.body.message;
            transactions.postContactUs(hashkey,titlemsg,msg,res);
        });

        app.get('/api/errorStatus',function(req,res){
            transactions.errorMessage(res);
        });

        app.get('/api/appStatus',function(req,res){
            transactions.forceUpdate(res);
        });

        app.get('/api/getNotification',function(req,res){
            var auth=req.get('Authorization');
            transactions.getNotification(auth,res);
        });

        app.post('/api/updateExistingMobile',function(req,res){
            var authori=req.get('Authorization');
            var updateMobile=req.body.NewMobile;
            transactions.updateExistingMobile(authori,updateMobile,res);
        });

        app.post('/api/getUpdatedMobileAuthentication',function(req,res){
            var authriCode=req.get('Authorization');
            var newUpdateMob=req.body.UpdatedMobile;
            var newUpdatedOtp=req.body.UpdatedOtp;
            transactions.getUpdatedMobileAuthentication(authriCode,newUpdateMob,newUpdatedOtp,res);
        });
    }  
};  