var page = require('webpage').create();
page.open('http://old.reddit.com/', function() {
  page.render('github.png');
  phantom.exit();
});