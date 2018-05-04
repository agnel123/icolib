var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
var Svg = require('svgutils').Svg;
const makeIcon  = require('./utils').makeIcon;
app.use(express.static('icons'));
const Filehound = require('filehound');
const dirTree = require('directory-tree');

app.get('/category',function(req,res){ 
    
    var categoryname = req.query.categoryname;
    var iconname = req.query.iconname;
    if(categoryname) console.log(categoryname);
    if(iconname) console.log(iconname);

    var currentDirPath = path.resolve(__dirname)+'/icons'

    if(categoryname && iconname == undefined)
        currentDirPath = path.resolve(__dirname)+'/icons/' + categoryname;

    if(categoryname && iconname)
        currentDirPath = path.resolve(__dirname)+'/icons/' + iconname +'/'+ categoryname;

    console.log(currentDirPath);
    const tree = dirTree(currentDirPath, {extensions:/\.svg/});
    res.json(tree);
});

app.get('/icons/:categoryname/:iconname/:filename.svg',function(req,reply,next){    
    var size = 40;
    var requestedSize = req.query.size;
    if(requestedSize) size = requestedSize;
    var categoryname = req.params.categoryname;
    var iconname = req.params.iconname;
    var filename = req.params.filename + '.svg';
    
    var currenticon = fs.readFileSync(
        require.resolve(path.join(__dirname + '/icons/'+categoryname+'/'+iconname+'/'+filename)),
        'utf8'
      );
    
    makeIcon(currenticon, req.query)
    .then(res => {
      const referer = req.headers.referer || '';
      if (referer.indexOf(req.get('host')) < 0 && global.production) {
        req.visitor.event(
          {
            ec: req.baseUrl.substr(1),
            ea: req.params.icon,
            el: referer,
            uip: req.ip,
            dr: referer
          },
          err => (err ? console.error(err) : null)
        );
      }
      reply.type('image/svg+xml').send(res);
    }).catch(err => {
        console.error(err);
        next(err);
      });
    
 
});

var diretoryTreeToObj = function(dir, done) {
    var results = [];

    fs.readdir(dir, function(err, list) {
        if (err)
            return done(err);

        var pending = list.length;

        if (!pending)
            return done(null, {name: path.basename(dir), type: 'folder', children: results});

        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    diretoryTreeToObj(file, function(err, res) {
                        results.push({
                            name: path.basename(file),
                            type: 'folder',
                            children: res
                        });
                        if (!--pending)
                            done(null, results);
                    });
                }
                else {
                    results.push({
                        type: 'file',
                        name: path.basename(file)
                    });
                    if (!--pending)
                        done(null, results);
                }
            });
        });
    });
};

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

var port = process.env.PORT || 8080;

app.listen(port, function() {
	console.log('Our app is running on http://localhost:' + port);
});