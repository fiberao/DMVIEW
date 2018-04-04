	function GetRequest() {  
	   var url = location.search;
	   var theRequest = new Object(); 
	   if (url.indexOf("?") != -1) { 
		  var str = url.substr(1); 
		  strs = str.split("&");  
		  for(var i = 0; i < strs.length; i ++) {  
			 theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
			}  
		}  
		return theRequest;  
	}
	var peer = new Peer({key: '811qtkwqpi5ghkt9'});

	//get server URL
	var req = GetRequest();
	if (req["server"]){
		var server = req["server"];
		conn = peer.connect(server);
		
		conn.on('open', function() {
			conn.send('Hello from client!');
			conn.on('data', function(data) {
				   document.getElementById("test").innerHTML+= data+"\n";
				});
		});
	}else{
		broadcast_list = [];
		peer.on('open', function(id) {
			document.getElementById("test").innerHTML+='My peer ID is: ' + id+"\n";
		});
		peer.on('connection', function(conn) { 
			conn.on('open', function() {
				// Receive messages
				conn.on('data', function(data) {
				   document.getElementById("test").innerHTML+= data+"\n";
				});
				broadcast_list.push(conn);
				// Send messages
				conn.send('Hello from server!');
			});
		});
	}
	function broadcast(text){
		for (var conn in broadcast_list) {
			
  			broadcast_list[conn].send(text);
		}
	}