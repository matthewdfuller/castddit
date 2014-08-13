var app = require('./app').init(4000);
var url = require('url');

var locals = {
        title: 		 'Castddit',
        description: 'Cast images from Reddit to Your Chromecast',
        author: 	 '',
        _layoutFile: true
    };
    
var ad_pages = [
        '/r/earthporn',
        '/r/waterporn',
        '/r/skyporn',
        '/r/fireporn',
        '/r/winterporn',
        '/r/autumnporn',
        '/r/weatherporn',
        '/r/cityporn',
        '/r/villageporn',
        '/r/abandonedporn',
        '/r/machineporn',
        '/r/carporn',
        '/r/spaceporn',
        '/r/humanporn',
        '/r/pics',
        '/r/funny',
        '/r/all',
        '/r/gifs',
        '/r/aww',
        '/r/gaming',
        '/r/InternetIsBeautiful',
        '/r/food',
        '/r/dataisbeautiful',
        '/r/art',
        '/r/space',
        '/r/foodporn',
        '/r/cringepics',
        '/r/nfl',
        '/r/hockey',
        '/r/gameofthrones',
        '/r/cats',
        '/r/anime',
        '/r/fffffffuuuuuuuuuuuu',
        '/r/starcraft',
        '/r/wallpapers',
        '/r/progresspics',
        '/r/australia',
        '/r/science',
        '/r/technology',
        '/r/adviceanimals',
        '/r/tatoos',
        '/r/geek',
        '/r/futurology',
        '/r/gadgets',
        
]
//for (var page in routes.pages) {
//        var pageConfig = routes.pages[page];
//        app.get(pageConfig.path, function (req, res) {
//                        res.render(pageConfig.file, locals);
//                }
//        );
//}

app.get('/', function(req, res){
        res.render('home.ejs', locals);
});

app.get('/*', function(req, res){
        //console.log(req);
        locals.url = req.url;
        
        // Loop through valid ad pages
        if (ad_pages.indexOf(req.url) > -1) {
                locals.ad = 'yes';
        } else {
                locals.ad = 'no';
        }
        
        //console.log(locals);
        res.render('reddit.ejs', locals);
});

/* The 404 Route (ALWAYS Keep this as the last route) */
app.get('/*', function(req, res){
    res.render('404.ejs', locals);
});
