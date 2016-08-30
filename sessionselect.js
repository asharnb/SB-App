
var choosesession = document.getElementById('choosesession');
var serveradd = 'http://localhost/sbtest';
var sessionselect = $("#session");
var globSession;

var background = chrome.runtime.getBackgroundPage(function(){});

		$(function () {
	        //Initialize Select2 Elements
	        $("#session").select2();
	    });


   function getSessions(scanfirst){



        $.ajax({
            type: "GET",
            url: serveradd + "/studio/open/sessions/"+Math.floor((Math.random() * 52412) + 5241)+"?_format=json",
            headers: {
              "authorization": "Basic a3Jpc2huYToxMjM0",
              "content-type": "application/hal+json",
              //"cache-control": "no-cache",
              //"postman-token": "54574d50-e846-6642-51d0-038790477b9a"
            },
            datatype: 'JSON',
            cache: false,
            //timeout:1000,

            success: function(data){

              //parse data
              var response = (data);
              console.log(response);
              $("#serverstatus").html("<i class='fa fa-circle text-success'></i> Connected</div>");
    
              $.each(response, function(key, value) {
                console.log(value);
                  sessionselect.append($("<option />").val(value).text("Session Number: "+value));

              });

            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                console.log(errorThrown);
            }
        });


   }

getSessions();


choosesession.addEventListener('click', function(e) {
  selectsession();
});

function selectsession(){

  var sessionid;
  //get session
  sessionid = sessionselect.val();
  //console.log(sessionid);
  if((sessionid === null)||(sessionid === undefined)||(sessionid === '')){
    $("#displaymessage").html('Please select a session to continue');
    $("#displaymessage").removeClass('text text-success').addClass('text text-danger');
  }else{



chrome.runtime.getBackgroundPage(function(bgpage) {
  bgpage.globalData = sessionid;
    console.log(bgpage.globalData);
});


  //closewindow
  chrome.app.window.create('scansession.html', {
   // singleton: true,
   //id: "StudioBridge-Listener",
    bounds: {
     'width': 343,
     'height': 317
    }
    //frame: none
  });

  //open session window
chrome.app.window.current().close() ;


  } //end if


}
