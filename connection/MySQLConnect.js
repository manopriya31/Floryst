// establish Mysql Connection  
var mysql = require('mysql');  
  
function MySQLConnect() {  
  
  this.pool = null;  
    
  // Init MySql Connection Pool   
  this.init = function() {  
    this.pool = mysql.createPool({  
      connectionLimit: 10,  
      host     : '103.233.79.15',  
      user     : 'root',  
      password : 'CTej*rvgkxu7K4c$',  
      database: 'floryst_db'  

    });  
  };  
  
  // acquire connection and execute query on callbacks  
  this.acquire = function(callback) {  
  
    this.pool.getConnection(function(err, connection) {  
      callback(err, connection);  
    });  
  
  };  
  
}  
  
module.exports = new MySQLConnect();  