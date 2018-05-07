	var graph = null;
	var data = new vis.DataSet();
	data.add({
	    x: 1,
	    y: 1,
	    z: 1
	});
	acturator_menbrane_view = true;
	var options = {
	    width: "100%",
	    height: "100%",
	    style: 'surface',
	    showPerspective: true,
	    showGrid: true,
	    showShadow: false,
	    xMax: 1,
	    xMin: -1,
	    yMax: 1,
	    yMin: -1,
	    zMax: 10,
	    zMin: -10,
	    keepAspectRatio: true,
	    verticalRatio: 0.2
	};
	var container = document.getElementById('mygraph');
	graph = new vis.Graph3d(container, data, options);

	responses = {}

	function load_oko_responses() {
	    JSZipUtils.getBinaryContent('static/responses.zip', function(err, data) {
	        if (err) {
	            alert("Can not load response file.");
	            throw err; // or handle err
	        }
	        JSZip.loadAsync(data).then(function(zip) {
	            for (let each in zip.files) {
	                zip.file(each).async("string").then(function(json_content) {
	                    responses[each] = JSON.parse(json_content);
	                });
	            }
	        });
	    });
	}
	load_oko_responses();


	function GetRequest() {
	    var url = location.search;
	    var theRequest = new Object();
	    if (url.indexOf("?") != -1) {
	        var str = url.substr(1);
	        strs = str.split("&");
	        for (var i = 0; i < strs.length; i++) {
	            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
	        }
	    }
	    return theRequest;
	}
	//get server URL
	var req = GetRequest();
	if (req["server"]) {
	    var server = req["server"];
	} else {
	    var server = "ws://127.0.0.1:8887/";
	}

	//websocket
	var ws = new ReconnectingWebSocket(server);

	function autoupdate_handler() {
	    ws.send("update");
	};
	ws.onopen = function(event) {
	    autoupdate_timer = setTimeout(autoupdate_handler, 500);
	}
	ws.onmessage = function(event) {
	    clearTimeout(autoupdate_timer);
	    var input = JSON.parse(event.data);
	    var mirror = null;
	    var offset=0.0;
	    var scale=1.0;
	    var resp_sacle=1.0;
	    var resp_offset=0.0;
	    if (input.length == 37) {
		    mirror = "oko";
		    resp_sacle=5e6;
		}else {
			scale=2.0;
			offset=-1.0;
	    	if (input.length == 43) {
		    	mirror = "thorlabs";
		    	resp_sacle=20;
		    	resp_offset=25.0;
	    	}else{
		    	mirror = "alpao";
		    	resp_sacle=8/97;
		    }
	    }
	    resp_sacle*=parseFloat(document.getElementById("slider1").value);
	    var data = new vis.DataSet();
	    var t = responses[mirror+".json"];
	    if (t){
	    	var nelem = t.wfx.length;
		    for (var z = 0; z < nelem; z++) {
	            var A=0;
	            for (var act = 0; act < input.length; act++) {
		            A += ((t.resp[act][z]+resp_offset)*resp_sacle)*(input[act]*scale+offset);
		        }

	            data.add({x:t.wfx[z],y: t.wfy[z],z:A})
	        }
	        graph.setData(data);

	    }else{
	    	console.error(mirror+" config not found.")
	    }
	    autoupdate_timer = setTimeout(autoupdate_handler, 500);
	};
	function clear_graph() {
	    var data = new vis.DataSet();
	    data.add({
	        x: 1,
	        y: 1,
	        z: 1
	    });
	    graph.setData(data);
	}
	ws.onclose =function (event) {clear_graph()};
