const request = require('request');
const cheerio = require('cheerio');
const URL = require('url-parse');
const fs = require('fs');
const iconv = require('iconv-lite');
const { Buffer } = require('buffer');
var START_URL = "https://www.zoomit.ir/";
var robots_txt = "https://www.zoomit.ir/robots.txt";
var MAX_PAGES_TO_VISIT =300;
var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var url = new URL(START_URL);
var sizeOfPages = 0;
var sizeOfUrls = 0;
var outDegree = 0;
var i = 0;
var baseUrl = url.protocol + "//" + url.hostname;

request(robots_txt, function (error, response, body) {
  console.log("Status code: " + response.statusCode);
  var pageBody = JSON.stringify(response.body);
  fs.writeFile('D:/htmls/robots.txt', pageBody, (error) => { 
    console.log(error);
  });
  console.log("robots.txt is written");
});

pagesToVisit.push(START_URL);
crawl();

function crawl() {
  if (numPagesVisited >= MAX_PAGES_TO_VISIT) {
    sizeOfFile();
    console.log("Reached max limit of number of pages to visit.");
    return;
  }
  var nextPage = pagesToVisit.pop();
  if (nextPage in pagesVisited) {
    crawl(); 
  } else {
    fetcher(nextPage, crawl);
  }
}

function fetcher(url, callback) {
  // Add page to our set
  pagesVisited[url] = true;
  numPagesVisited++;

  // Make the request
  console.log(i++ + " Visiting page " + url);
  sizeOfUrls += Buffer.byteLength(url);
  console.log(Buffer.byteLength(url));
  var requestOptions = { encoding: null, method: "GET", uri: url};
  request(requestOptions, function (error, response, body) {
    if (error instanceof URIError) {
        res.status(400).send();
    }

    // Check status code (200 is HTTP OK)
    console.log("Status code: " + response.statusCode);
    var pageBody = body;
    fs.writeFile('D:/htmls/' + numPagesVisited + '.html', pageBody, (error) => { 
      console.log(error);
    });
    console.log("site is written");
    if (response.statusCode !== 200) {
        callback();
        return;
    }
    
     // Parse the document body
    var $ = cheerio.load(pageBody);
    parser($);
       
    // In this short program, our callback is just calling crawl()
    callback();   
  });
}

function parser($) {
  var relativeLinks = $("a[href^='/']");
  console.log("Found " + relativeLinks.length + " relative links on page");
  outDegree += relativeLinks.length;
  relativeLinks.each(function () {
    pagesToVisit.push(iconv.decode(new Buffer(baseUrl + $(this).attr('href')), "ISO-8859-1"));
  });
}

function sizeOfFile() {
  var i;
  for (i = 1; i < numPagesVisited; i++){
    var stats = fs.statSync("D:/htmls/" + i + ".html");
    var fileSizeInBytes = stats.size;
    var fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
    sizeOfPages += fileSizeInMegabytes;
     
  }
  console.log("out degree: " + outDegree);
  console.log("Mean out degree: " + outDegree / numPagesVisited);
  console.log("size of each link: " + sizeOfUrls);
  console.log("Mean size of each link: " + sizeOfUrls * 2 / numPagesVisited);
  console.log("Mean size of each page without compression: " + sizeOfPages / numPagesVisited);

  
}
