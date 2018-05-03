var fs = require('fs');
var path = './Logs'
var Logs = [];
function readDirectory(callback){
    fs.readdir(path, function(err, items) {
       Logs.push(items);
       callback(Logs);       
    }); 
}
exports.readDirectory = readDirectory;