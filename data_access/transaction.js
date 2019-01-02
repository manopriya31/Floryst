//methods for fetching mysql data  
var connection = require('../connection/MySQLConnect');  
var Crypto = require('crypto-js');
var forEach = require('async-foreach').forEach;
var smsApi=require('../sms_api/sms');
function Transaction() {  
       
    // get otp for every time mobile number is sent. 1-> existing mob:update otp and sent 2-> new mob: insert and send otp
        this.getOtp = function (mobile,res) {  
        // initialize database connection  
        connection.init();  
        // calling acquire methods and passing callback method that will be execute query  
        // return response to server   
        connection.acquire(function (err, con) {  
           const rn=Math.floor(1000 + Math.random() * 9000);
           const hashmob=Crypto.SHA1(mobile+rn).toString();
           const rnString=rn.toString();
           var post=[ [mobile,hashmob,rnString]];
            con.query("SELECT 1 FROM user WHERE mobile = '"+mobile+"' ORDER BY user_id LIMIT 1", function (err, result) {
                console.log(result.length);  
                if(result.length > 0){
                    const newotp=Math.floor(1000 + Math.random() * 9000);
                    const newhashmob=Crypto.SHA1(mobile+newotp).toString();
                    con.query("UPDATE user SET otp ='"+newotp+"',hashed_mobile='"+newhashmob+"' WHERE mobile='"+mobile+"'",function(err,rows){
                    con.release();
                        if(!err){
                            var newmessg="Your OTP is "+newotp+". Welcome to Floryst & Have a Nice Day.";
                         smsApi.callyourservice(mobile,newmessg,function(data){
                               console.log("message sent");
                           });
                            res.json({status:"success",data:{message:"OTP sent successfully"}});
                            res.end();
                        }
                        else{
                            res.json({status:"error"});
                            res.end();
                            console.log("update failed",+err);
                        }
                    });
                }
                else{
                    con.query('INSERT INTO user(mobile,hashed_mobile,otp) values ?',[post], function(err, rows, fields) {
                    con.release();
                    if(!err){
                        var insertmessage="Welcome to Floryst. Your OTP is"+rnString;
                        smsApi.callyourservice(mobile,insertmessage,function(data){
                            console.log("message sent successfully");
                        });
                        res.json({status:"success",data:{message:"OTP sent successfully"}});
                        console.log("otp sent");
                        res.end();
                    }
                    else{
                        res.json({status:"error"});
                        console.log("insert faailed");
                        res.end();
                    }
                    });
                }
             
            });  
        });  
    };  

    // get authentication for every valid mobile & otp request  
    this.getAuthentication = function (mob,otp,res) {  
        // initialize database connection  
        connection.init();  
        // calling acquire methods and passing callback method that will be execute query  
        // return response to server   
        connection.acquire(function (err, con) {  

            con.query("select 1 from user where mobile='"+mob+"' and otp='"+otp+"'", function (err, result) {  
                if(result.length > 0){
                    con.query("select hashed_mobile as authenticationCode from user where mobile='"+mob+"'",function(err,rows){
                    con.release();
                    rows.forEach((row)=>{
                        res.json({status:"success",data:row});
                        res.end();
                      });  
                    });
                }
                else{
                    res.status(400);
                    res.json({status:"error",data:{error:"invalid mobile/otp"}});
                }
             
            });  
        });  
    };  
  
    // get products for every valid auth code 
    this.getProducts = function (aCode,res) {  
        // initialize database connection  
        connection.init();  
        // calling acquire methods and passing callback method that will be execute query  
        // return response to server   
        connection.acquire(function (err, con) {  

            con.query("select 1 from user where hashed_mobile='"+aCode+"' ", function (err, result) {  
                if(result.length > 0){
                    con.query("CALL GetProductDetails();",function(err,rows){
                    con.release();
                   
                    var a=[];
                    for(var i=0;i<1;i++){
                        a=rows[i];
                    }
                        res.json({status:"success",data:{products:a}});      
                        res.end();
                    });
                }
                else{
                    res.status(401);
                    res.json({status:"error",data:{error:"unauthorized access"}});
                    res.end();
                }
             
            });  
        });  
    };  

// get product image urls for every valid product id 
     this.getProductsImgUrls = function (pid,res) {  
        // initialize database connection  
        connection.init();  
        // calling acquire methods and passing callback method that will be execute query  
        // return response to server   
        connection.acquire(function (err, con) {  

            con.query("select image_1_url,image_2_url,image_3_url,image_4_url from product where product_id='"+pid+"' ", function (err, result) {  
              con.release();
              if(!err){
                res.json({status:"success",data:{imgurls:result}});
              }
              else{
                res.json({status:"error",data:{error:"product doesnot exists"}});
              }
             
            });  
        });  
    };  


 // get products for every valid auth code 
 this.getProfileDetails = function (authCode,res) {  
    // initialize database connection  
    connection.init();  
    // calling acquire methods and passing callback method that will be execute query  
    // return response to server   
    connection.acquire(function (err, con) {  

        con.query("select 1 from user where hashed_mobile='"+authCode+"' ", function (err, result) { 
            if(err){
                console.log(err);
            } 
            else{
                if(result.length > 0){
                    con.query("CALL GetUserProfileDetails('"+authCode+"');",function(err,rows){
                    con.release();
                   
                    var profile=[];
                    for(var i=0;i<1;i++){
                        profile=rows[i];
                    }
                        res.json({status:"success",data:{profile}});      
                        res.end();
                    });
                }
                else{
                    res.status(401);
                    res.json({status:"error",data:{error:"unauthorized access"}});
                    res.end();
                }
            }
            
         
        });  
    });  
};  
  

this.addToBasket=function(authenCode,prod_id,quantity,res){
 // initialize database connection  
 connection.init();  
 // calling acquire methods and passing callback method that will be execute query  
 // return response to server   
 connection.acquire(function (err, con) {  

     con.query("select 1 from user where hashed_mobile='"+authenCode+"' ", function (err, result) { 
         if(err){
             console.log(err);
         } 
         else{
             if(result.length > 0){
                
                 //console.log("CALL GetUserProfileDetails("+user_id+","+prod_id+","+quantity+");");
                
                 con.query("CALL AddToBasket('"+authenCode+"',"+prod_id+","+quantity+");",function(err,rows){
                 con.release();
                 if(!err){
                    res.json({status:"success",data:{message:"product successfully added"}});      
                    res.end();
                 }
                 else{
                     console.log("error"+err);
                     res.send(400);
                     res.json({status:"error",data:{error:"invalid data"}});
                 }
                    
                 });
             }
             else{
                 res.status(401);
                 res.json({status:"error",data:{error:"unauthorized access"}});
                 res.end();
             }
         }
         
      
     });  
 });  
};

this.checkout=function(hCode,deliveryDate,timeSlot,desc,res){
    // initialize database connection  
    connection.init();  
    // calling acquire methods and passing callback method that will be execute query  
    // return response to server   
    connection.acquire(function (err, con) {  
   
        con.query("select 1 from user where hashed_mobile='"+hCode+"' ", function (err, result) { 
            if(err){
                console.log(err);
            } 
            else{
                if(result.length > 0){
                   
                    con.query("CALL InsertOrderCheckout('"+hCode+"','"+deliveryDate+"',"+timeSlot+",'"+desc+"');",function(err,rows){
                   
                    if(!err){
                        con.query("select mobile from user where hashed_mobile='"+hCode+"'",function(err,result){
                            con.release();
                            if(!err){
                                var orderMobile=result[0].mobile;
                                var ordersms="Your Order Has Been Placed Successfully! ";
                                smsApi.callyourservice(orderMobile,ordersms,function(data){
                                    console.log("order message sent");
                                });
                            }
                        });
                       
                       res.json({status:"success",data:{message:"order has been placed successfully"}});      
                       res.end();
                    }
                    else{
                        console.log("error"+err);
                        res.send(400);
                        res.json({status:"error",data:{error:"invalid data"}});
                    }
                       
                    });
                }
                else{
                    res.status(401);
                    res.json({status:"error",data:{error:"unauthorized access"}});
                    res.end();
                }
            }
            
        });  
    });  
   };
   this.getOrders=function(authKey,res){
    // initialize database connection  
    connection.init();  
    // calling acquire methods and passing callback method that will be execute query  
    // return response to server   
    connection.acquire(function (err, con) {  
   
        con.query("select 1 from user where hashed_mobile='"+authKey+"' ", function (err, result) { 
            if(err){
                console.log(err);
            } 
            else{
                if(result.length > 0){
                   
                    con.query("CALL GetOrderDetails('"+authKey+"');",function(err,rows){
                    con.release();
                    if(!err){
                        var orders=[];
                        for(var i=0;i<1;i++){
                            orders=rows[i];
                        }
                       res.json({status:"success",data:{products:orders}});      
                       res.end();
                    }
                    else{
                        console.log("error"+err);
                        res.send(400);
                        res.json({status:"error",data:{error:"invalid data"}});
                        res.end();
                    }
                       
                    });
                }
                else{
                    res.status(401);
                    res.json({status:"error",data:{error:"unauthorized access"}});
                    res.end();
                }
            }
            
        });  
    });  
   };


   this.getBasket=function(authenticationkey,res){
    // initialize database connection  
    connection.init();  
    // calling acquire methods and passing callback method that will be execute query  
    // return response to server   
    connection.acquire(function (err, con) {  
   
        con.query("select 1 from user where hashed_mobile='"+authenticationkey+"' ", function (err, result) { 
            if(err){
                console.log(err);
            } 
            else{
                if(result.length > 0){
                   
                    con.query("CALL GetUserCartDetails('"+authenticationkey+"');",function(err,rows){
                    con.release();
                    if(!err){
                        var cart=[];
                        for(var i=0;i<1;i++){
                            cart=rows[i];
                        }
                       res.json({status:"success",data:{products:cart}});      
                       res.end();
                    }
                    else{
                        console.log("error"+err);
                        res.send(400);
                        res.json({status:"error",data:{error:"invalid data"}});
                        res.end();
                    }
                       
                    });
                }
                else{
                    res.status(401);
                    res.json({status:"error",data:{error:"unauthorized access"}});
                    res.end();
                }
            }
            
        });  
    });  
   };

   this.getProductDetailsByGroupID=function(authentikey,gid,res){
    // initialize database connection  
    connection.init();  
    // calling acquire methods and passing callback method that will be execute query  
    // return response to server   
    connection.acquire(function (err, con) {  
   
        con.query("select 1 from user where hashed_mobile='"+authentikey+"' ", function (err, result) { 
            if(err){
                console.log(err);
            } 
            else{
                if(result.length > 0){
                   
                    con.query("CALL GetProductDetailsByGroupID("+gid+");",function(err,rows){
                    con.release();
                    if(!err){
                        var prod=[];
                        for(var i=0;i<1;i++){
                            prod=rows[i];
                        }
                       res.json({status:"success",data:{products:prod}});      
                       res.end();
                    }
                    else{
                        console.log("error"+err);
                        res.send(400);
                        res.json({status:"error",data:{error:"invalid data"}});
                        res.end();
                    }
                       
                    });
                }
                else{
                    res.status(401);
                    res.json({status:"error",data:{error:"unauthorized access"}});
                    res.end();
                }
            }
            
        });  
    });  
   };
   
 this.deleteFromBasket=function(aKey,prid,res){
    connection.init();  
    // calling acquire methods and passing callback method that will be execute query  
    // return response to server   
    connection.acquire(function (err, con) {  
   
        con.query("select 1 from user where hashed_mobile='"+aKey+"' ", function (err, result) { 
            if(err){
                console.log(err);
            } 
            else{
                if(result.length > 0){
                   
                    con.query("CALL DeleteFromCart('"+aKey+"',"+prid+");",function(err,rows){
                    con.release();
                    if(!err){
                       
                       res.json({status:"success",data:{message:"Product has been successfully Removed from Basket"}});      
                       res.end();
                    }
                    else{
                        console.log("error"+err);
                        res.send(400);
                        res.json({status:"error",data:{error:"invalid data"}});
                        res.end();
                    }
                       
                    });
                }
                else{
                    res.status(401);
                    res.json({status:"error",data:{error:"unauthorized access"}});
                    res.end();
                }
            }
            
        });  
    });  
 };

 this.cancelOrder=function(auKey,order_id,res){
    connection.init();  
    // calling acquire methods and passing callback method that will be execute query  
    // return response to server   
    connection.acquire(function (err, con) {  
   
        con.query("select 1 from user where hashed_mobile='"+auKey+"' ", function (err, result) { 
            if(err){
                console.log(err);
            } 
            else{
                if(result.length > 0){
                   
                    con.query("CALL CancelOrderByOrderID('"+auKey+"',"+order_id+");",function(err,rows){
                    if(!err){
                        con.query("select mobile from user where hashed_mobile='"+auKey+"'",function(err,result){
                            con.release();
                            if(!err){
                                var cancelMobile=result[0].mobile;
                                var cancelsms="Your Order Has Been Cancelled Successfully! ";
                                smsApi.callyourservice(cancelMobile,cancelsms,function(data){
                                    console.log("cancel message sent");
                                });
                            }
                        });
                       res.json({status:"success",data:{message:"Order has been Cancelled Successfully"}});      
                       res.end();
                    }
                    else{
                        console.log("error"+err);
                        res.status(400);
                        res.json({status:"error",data:{error:"invalid data"}});
                        res.end();
                    }
                       
                    });
                }
                else{
                    res.status(401);
                    res.json({status:"error",data:{error:"unauthorized access"}});
                    res.end();
                }
            }
            
        });  
    });  
 };

 this.registerUserDetails=function(autKey,name,address,area,city,pincode,res){
    connection.init();  
    // calling acquire methods and passing callback method that will be execute query  
    // return response to server   
    connection.acquire(function (err, con) {  
   
        con.query("select 1 from user where hashed_mobile='"+autKey+"' ", function (err, result) { 
            if(err){
                console.log(err);
            } 
            else{
                if(result.length > 0){
                   // console.log("CALL UpdateUserDetails('"+autKey+"','"+name+"','"+address+"','"+area+"','"+city+"','"+pincode+"')");
                   
                    con.query("CALL UpdateUserDetails('"+autKey+"','"+name+"','"+address+"','"+area+"','"+city+"','"+pincode+"');",function(err,rows){
                    con.release();
                    if(!err){
                       
                       res.json({status:"success",data:{message:"User Details has been Updated Successfully"}});      
                       res.end();
                    }
                    else{
                        console.log("error"+err);
                        res.send(400);
                        res.json({status:"error",data:{error:"invalid data"}});
                        res.end();
                    }
                       
                    });
                }
                else{
                    res.status(401);
                    res.json({status:"error",data:{error:"unauthorized access"}});
                    res.end();
                }
            }
            
        });  
    });  
 };

 this.postContactUs=function(hashKey,title,msg,res){
    // initialize database connection  
    connection.init();  
    // calling acquire methods and passing callback method that will be execute query  
    // return response to server   
    connection.acquire(function (err, con) {  
   
        con.query("select 1 from user where hashed_mobile='"+hashKey+"' ", function (err, result) { 
            if(err){
                console.log(err);
            } 
            else{
                if(result.length > 0){
                   
                    con.query("CALL InsertContactUsDetails('"+hashKey+"','"+title+"','"+msg+"');",function(err,rows){
                    con.release();
                    if(!err){
                       res.json({status:"success",data:{message:"your response is noted our team will contact you"}});      
                       res.end();
                    }
                    else{
                        console.log("error"+err);
                        res.send(400);
                        res.json({status:"error",data:{error:"invalid data"}});
                        res.end();
                    }
                       
                    });
                }
                else{
                    res.status(401);
                    res.json({status:"error",data:{error:"unauthorized access"}});
                    res.end();
                }
            }
            
        });  
    });  
   };


   this.errorMessage=function(res){
    // initialize database connection  
    connection.init();  
    // calling acquire methods and passing callback method that will be execute query  
    // return response to server   
    connection.acquire(function (err, con) {  
   
        con.query("select 1 from custom_config where name='FLORYST APP ERROR' and value='true'", function (err, result) { 
            if(err){
                console.log(err);
            } 
            else{
                if(result.length > 0){  
                       res.status(500);       
                       res.json({status:"success",data:{title:"Sorry for problem caused",message:"We will be unavailable to serve you from 25 to 30 of sep 2018"}});      
                       res.end();
                }
                else{
                    res.json({status:"error"});
                }
            }
            
        });  
    });  
   };
  
 this.forceUpdate=function(res){
    // initialize database connection  
    connection.init();  
    // calling acquire methods and passing callback method that will be execute query  
    // return response to server   
    connection.acquire(function (err, con) {  
   
        con.query("SELECT value FROM floryst_db.custom_config where name='FLORYST PLAY_STORE_APP_VERSION_CODE';", function (err, result) { 
            if(!err){
               const appversion=result[0].value;
               con.query("SELECT value FROM floryst_db.custom_config where name='FLORYST APP ERROR';",function(err,row){
                con.release();
                if(!err){
                    const errorStatus=row[0].value;
                    res.json({status:"success",data:{version:appversion,errorStatus:errorStatus}});
                }
                else{
                    res.json({status:"error"});
                }
               });
            } 
            else{
                console.log(err);
            }
            
        });  
    });  
   };

   this.getNotification=function(auth,res){
    connection.init();  
    // calling acquire methods and passing callback method that will be execute query  
    // return response to server   
    connection.acquire(function (err, con) {  
   
        con.query("select 1 from user where hashed_mobile='"+auth+"' ", function (err, result) { 
            if(err){
                console.log(err);
            } 
            else{
                if(result.length > 0){
                   
                    con.query("CALL GetNotificationByUser('"+auth+"');",function(err,rows){
                    con.release();
                    if(!err){
                        var notification=[];
                        for(var i=0;i<1;i++){
                            notification=rows[i];
                        }
                       res.json({status:"success",data:{updates:notification}});      
                       res.end();
                    }
                    else{
                        console.log("error"+err);
                        res.send(400);
                        res.json({status:"error",data:{error:"invalid data"}});
                        res.end();
                    }
                       
                    });
                }
                else{
                    res.status(401);
                    res.json({status:"error",data:{error:"unauthorized access"}});
                    res.end();
                }
            }
            
        });  
    });  
 };

 // get authentication for every valid mobile & otp request  
 this.updateExistingMobile = function (authorization,newmob,res) {  
    // initialize database connection  
    connection.init();  
    // calling acquire methods and passing callback method that will be execute query  
    // return response to server   
    connection.acquire(function (err, con) {  

        con.query("select otp from user where hashed_mobile='"+authorization+"'", function (err, result) { 
             
            if(result.length > 0){
              var existingOtp=result[0].otp;
             
           var updateMobMessage="Your Otp is "+existingOtp;
            smsApi.callyourservice(newmob,updateMobMessage,function(data){
                console.log("message sent");
            });
            res.json({status:"success",data:{message:"OTP successfully sent"}});      
            }
            else{
                res.status(400);
                res.json({status:"error",data:{error:"invalid mobile/otp"}});
            }
         
        });  
    });  
};  

// get authentication for every valid mobile & otp request  
this.getUpdatedMobileAuthentication = function (authoriCode,updatedMobile,updatedOtp,res) {  
    // initialize database connection  
    connection.init();  
    // calling acquire methods and passing callback method that will be execute query  
    // return response to server   
    connection.acquire(function (err, con) {  

        con.query("select 1 from user where hashed_mobile='"+authoriCode+"' and otp="+updatedOtp, function (err, result) { 
    
            if(result.length > 0){
                const updatedHashedMobile=Crypto.SHA1(updatedMobile+updatedOtp).toString();
                con.query("UPDATE user SET mobile='"+updatedMobile+"',hashed_mobile='"+updatedHashedMobile+"' WHERE hashed_mobile='"+authoriCode+"' and otp="+updatedOtp,function(err,result){
               
                if(!err){
                    con.query("select hashed_mobile as authenticationCode from user where mobile='"+updatedMobile+"'",function(err,rows){
                        con.release();
                        rows.forEach((row)=>{
                            res.json({status:"success",data:row});
                            res.end();
                          });  
                        });
                   // res.json({status:"success",data:{message:"Mobile Number Updated Successfully"}})
                }
            });
                
            }
            else{
                res.status(400);
                res.json({status:"error",data:{error:"invalid mobile/otp"}});
            }
         
        });  
    });  
};  

}  
  
module.exports = new Transaction();  