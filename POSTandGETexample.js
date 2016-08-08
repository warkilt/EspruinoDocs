var page = "<!DOCTYPE html>\n<html>\n  <head>\n    <title>Sprinkler System</title>\n    <script>\n      function response(arr,type){//arr is in JSON\n        if(type===\"get\"){\n          document.getElementById(\"get\").style.backgroundColor=arr.color;\n        }else{\n          document.getElementById(\"post\").style.backgroundColor=arr.color;\n        }\n      }\n      \n      function postServer(color){\n        var req = new XMLHttpRequest(),\n        obj = {'color':color,'the':'rest','are':'test','Red':'red','Purple':'purple','Green':'green','Yellow':'yellow'},\n        arr;\n        req.open(\"POST\",\"/\", true);\n        req.setRequestHeader(\"Content-type\", \"application/json\");\n        req.onreadystatechange = function(){\n          if(req.readyState === 4){\n            var status = req.status;\n            if(status>=200 && status <300 || status === 304){\n              arr=req.responseText;\n              arr=JSON.parse(arr);\n              response(arr,\"post\");\n            }else{\n              alert(\"something bad\");\n            }\n          }\n        }\n        \n        obj=JSON.stringify(obj);\n        console.log(obj);\n        req.send(obj);\n      }\n      function postControl(){\n        var color = document.getElementById(\"post\").style.backgroundColor;\n        postServer(color);\n        \n      }\n      \n      function getServer(color){\n        var req=new XMLHttpRequest(),\n        arr;\n        req.open(\"GET\", \"?color=\"+color, true);\n        req.onreadystatechange = function(){\n          if(req.readyState === 4){\n            var status = req.status;\n            if(status>=200 && status <300 || status === 304){\n              arr=req.responseText;\n              arr=JSON.parse(arr);\n              response(arr,\"get\");\n            }else{\n              alert(\"something bad\");\n            }\n          }\n        }\n        req.send(null);\n      }\n      function getControl(){\n        var color = document.getElementById(\"get\").style.backgroundColor;\n        getServer(color);\n      }\n    </script>\n  </head>\n  <body>\n    <button style=\"background-color:red\" id=\"post\" type=\"button\" onclick=\"postControl()\">POST</button>\n    <button style=\"background-color:red\" id=\"get\" type=\"button\" onclick=\"getControl()\">GET</button>\n  </body>\n</html>";
/*
server side javascript
*/
function colorChange(data){
  var obj = {'color': null},
  color = data.color;
  if(color === "red"){
    obj.color = 'green';
  }else{
    obj.color = 'red';
  }
  return obj;
}

function pageHandler(req, res) {
  var info, data='';
  if (req.method=="POST") {
    // If it's a POST, save the data
    req.on('data',function(chunk){
      if(chunk){
        data+=chunk;
      }
      if(data.length>=Number(req.headers['Content-Length'])){
        data = JSON.parse(data);
        data = colorChange(data);
        res.writeHead(200);
        res.end(JSON.stringify(data));
      }else{
        res.writeHead(200);
        res.end(alert("data was corrupted"));
      }
    });
  } else {
    
    // otherwise write the page out
    if (req.url=="/") {
      res.writeHead(200);
      res.end(page);
    } else {
      info = url.parse(req.url, true);
      if (info.query && "color" in info.query){
        data = colorChange(info.query);
        res.writeHead(200);
        res.end(JSON.stringify(data));
      } else {
        res.writeHead(404);
        res.end("404: Not found");
      }
    }
  }
}

//WIFI
var WIFI_NAME = "Kaupp2.4";
var WIFI_PASS = "password";


digitalWrite(B9,1); // enable on Pico Shim V2
Serial2.setup(115200, { rx: A3, tx : A2 });
function onInit(){
  var wifi = require("ESP8266WiFi_0v25").connect(Serial2, function(err) {
    if (err) throw err;
    wifi.reset(function(err) {
      if (err) throw err;
      console.log("Connecting to WiFi");
      wifi.connect(WIFI_NAME, WIFI_PASS, function(err) {
        if (err) {
          onInit();
          throw err;
        }
        console.log("Connected");
        // print IP address
        wifi.getIP(console.log);
        // Create a server
        require("http").createServer(pageHandler).listen(80);
      });
    });
  });
}

onInit();