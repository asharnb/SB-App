var chosenEntry = null;
var scanButton = document.getElementById('submit');
var chooseDirButton = document.getElementById('choosedir');
var chooseSession = document.getElementById('choosesession');
var label = document.getElementById('return');
var label2 = document.getElementById('return2');

var background = chrome.runtime.getBackgroundPage(function() {});

var output = document.querySelector('output');
var textarea = document.querySelector('textarea');

var sessionid = document.getElementById('sessionid');
var currentid = document.getElementById('currentid');
var scandir = document.getElementById('scandir');

var currentid = '';
var serveradd = 'http://localhost/sbtest';

var filesarray = [];
var oldarray = [];
var newarray = [];

var identifier = '';
var dirEntryStr;
var folderid = '';
var sessionno = '';
var imageseq;
var currentsequence;
var localsequence;
var colorvariant = '';
var message_color = '';
var message_identifier = '';

var checksequence;

var scannumber = 1;
var globalSession;

var initial_image_sequence = 0;
var current_file_number = 0;
var is_rescanned = false;
var isSending = false;

var imagequeue = [];

//error handler

function errorHandler(e) {
    console.error(e);
    return true;
}

//Get global session variable
chrome.runtime.getBackgroundPage(function(bgpage) {
    globalSession = bgpage.globalData;
    //console.log(globalSession);
});



//disconnect message to be sent
// chrome.app.window.current().onClosed.addListener(function() {
//     //console.log('closeevent');
//     $.ajax({
//         type: "GET",
//         url: serveradd + "/ca/appconnect.php?r=disconnect&id=" + globalSession
//     });
// });


//check directory first time
checkDirectory('1');
//Event listener for choose directory 
chooseDirButton.addEventListener('click', function(e) {
    checkDirectory();
});
//Event listener for choose session
chooseSession.addEventListener('click', function(e) {
    changesession();
});
//Check if a directory has been selected and start app connection
function checkDirectory(scanfirst) {
    chrome.fileSystem.chooseEntry({
        type: 'openDirectory'
    }, function(theEntry) {
        if (!theEntry) {
            $("#scandir").html('No scan folder has been selected, please select a directory to continue');
            $("#scandir").removeClass("text text-success").addClass("text text-danger");
            return;
        } else {
            chrome.storage.local.set({
                'chosenFile': chrome.fileSystem.retainEntry(theEntry)
            });
            dirEntryStr = theEntry;
            $("#scandir").html(theEntry.name);
            $("#scandir").removeClass("text text-danger").addClass("text text-success");

            loadDirEntry(theEntry, 'true', '');
            waitForMsg(scanfirst);
        }
    });

}




function waitForMsg(scanfirst) {

    var rand = Math.floor((Math.random() * 1000000) + 1);
    $.ajax({
      
        type: "GET",
        url: serveradd + '/studio/session/'+ globalSession + '/'+rand+'?_format=json', 
        headers: {
          "authorization": "Basic a3Jpc2huYToxMjM0",
          "content-type": "application/hal+json",
          //"cache-control": "no-cache",
          //"postman-token": "54574d50-e846-6642-51d0-038790477b9a"
        },

        async: true,
        cache: false,
        timeout: 1000,

        success: function(data) {

            //parse data
            var response = (data);
            
            console.log(response);
            //console.log(data);
            $("#serverstatus").html("<i class='fa fa-circle text-success'></i> Connected</div>");
            $("#sessionid").removeClass('text text-danger').addClass('text text-success');
            $("#currentid").removeClass('text text-danger').addClass('text text-success');
            $("#currentid").html(data.color);
            $("#sessionid").html(data.id);
            identifier = data.color;
            concept = data.concept;
            colorvariant = data.color;
            sessionno = data.id;

            if(data.color.length !== 0){
               message_color = data.color;
            } else{
               message_color = '';
            }
            
            if(data.concept.length !== 0){
               message_concept = data.concept;
            } else{
               message_concept = '';
            }


            if (data.color != currentid) {
              //console.log('change');
              is_rescanned = false;




                if ((dirEntryStr === '') || (dirEntryStr === undefined)) {} else {
                    if (data.color !== '') {
                        //newsequence = imageseq;
                        createfolder(dirEntryStr, colorvariant);
                        //$("#return2").html(filesarray);
                        filesarray = [];
                        initial_image_sequence = 0;
                        //initial_image_sequence = 0;


                    }
                }

                if (message_color !== ''){
                var notification = chrome.notifications.create(
                    'nNew', {
                        type: "list",
                        iconUrl: 'icons/icon128.png',
                        title: "New Product",
                        message: "New product has been scanned.",
                        items: [{
                            title: "Variant",
                            message: message_color,
                        }, {
                            title: "Concept",
                            message: message_concept,
                        }]
                    },

                    function() {}

                );
                }

                setTimeout(function() {
                    chrome.notifications.clear('nNew');
                }, 3000);
            }

            currentid = data.color;
            setTimeout(
                waitForMsg,
                100);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            //addmsg("error", textStatus + " (" + errorThrown + ")");
            $("#sessionid").html('Not Available');
            $("#currentid").html('Not Available');
            $("#sessionid").removeClass('text text-success').addClass('text text-danger');
            $("#currentid").removeClass('text text-success').addClass('text text-danger');
            $("#serverstatus").html("<i class='fa fa-circle text-warning'></i> Server Error or Busy</div>");
            //console.log(errorThrown);
            setTimeout(
                waitForMsg,
                100);
        }


    });
    if (scannumber == 1) {} else {
        checkforNewFiles();
    }

}




function createfolder(theEntry, foldername) {

    var foldernames = "'" + foldername + "'";
    var theEntries = theEntry;
    if ((theEntries === undefined) || (theEntries === '')) {} else {
        chrome.fileSystem.getWritableEntry(theEntries, function(entry) {
            entry.getDirectory(foldername, {
                create: true,
                exclusive: false
            }, function(entry) {

            });

        });
    }
}




function checkforNewFiles() {

    oldarray = filesarray;
    // console.log(filesarray);

    loadDirEntry(dirEntryStr, 'false', 'new');

    if (newarray.length !== 0) {
        filesarray = newarray;
    }
    newarray = [];

}
//Send file to server


function loadDirEntry(_chosenEntry, sendfilebol, calltype) {

    chosenEntry = _chosenEntry;

    chrome.storage.local.set({
        'chosenFile': chrome.fileSystem.retainEntry(chosenEntry)
    });


    if (chosenEntry.isDirectory) {
        var dirReader = chosenEntry.createReader();
        var entries = [];


        // Call the reader.readEntries() until no more results are returned.
        var readEntries = function() {
            dirReader.readEntries(function(results) {

                if (!results.length) {
                    textarea.value = entries.join("\n");
                   // displayEntryData(chosenEntry);

                } else {

                    //clear the array
                    results.sort();
                    results.forEach(function(item) {
                        entries = entries.concat(item.fullPath);


 //console.log(item.name);

                           if(item.name == '.DS_Store')
                            {
                              return false;
                            }
                         // console.log(item.name);

                               for (var i = 0; i <= 10; i++) {
                          if(item.name === '.euTemp_'+i+'.JPG_TMP')
                            {
                              

                              console.log('temp file found');
                              return false;
                            }
                                }



                                if(item.isDirectory){}else{
                               if(inArray(item.name,filesarray)===false){
                               console.log(is_rescanned);

                                readAsImage(item, 1);
                                filesarray.push(item.name);

                                }
                                }

                    });
                    readEntries();
                }
            }, errorHandler);
        };

        readEntries(); // Start reading dirs.
    }
    scannumber++;
}


function readfiles() {

    chrome.fileSystem.chooseEntry({
        type: 'openDirectory'
    }, function(theEntry) {
        if (!theEntry) {
            output.textContent = 'No Directory selected.';
            return;
        }
        chrome.storage.local.set({
            'chosenFile': chrome.fileSystem.retainEntry(theEntry)
        });
        dirEntryStr = theEntry;
        //console.log(dirEntryStr);

        loadDirEntry(theEntry, 'true', '');

    });
}

function readAsText(fileEntry, callback) {

    fileEntry.file(function(file) {
        var reader = new FileReader();

        reader.onerror = errorHandler;
        reader.onload = function(e) {
            callback(e.target.result);
        };

        reader.readasDataURL(file);
    });
}

function readAsImage(fileEntry, sequence) {
    fileEntry.file(function(file) {
        // if (file.type.match(/image.jpeg/)) {


            var reader = new FileReader();

            reader.onerror = errorHandler;

            reader.onload = function(e) {

                //$("#displayimage").attr("src", reader.result);

                var rand = Math.floor((Math.random() * 1000000) + 1);
                var rand2 = Math.floor((Math.random() * 2000000) + 2);
                chrome.fileSystem.getWritableEntry(dirEntryStr, function(entry) {
                    entry.getDirectory(colorvariant, {
                        create: false,
                        exclusive: false
                    }, function(entry) {
                        fileEntry.moveTo(entry, 'IMG' + '_' + rand + rand2 + '.jpg',function() {
                          //console.log('file moved: ' + colorvariant + '_' + localsequence);
                          //console.log(isSending);
                            // if(isSending===false){
                            //   console.log('was sending file');
                            // sendfile(reader.result, sequence);
                            // }
                            imagequeue.push(reader.result);
                            if(imagequeue.length===1){
                              //console.log('firstcall');
                              processinQueueFiles();
                            }
                        });
                       // localsequence++;


                    });

                });

            };



            reader.readAsDataURL(file);

        // }
    });
}


function inArray(needle, haystack) {
    var count = haystack.length;
    for (var i = 0; i < count; i++) {
        if (haystack[i] === needle) {
            return true;
        }
    }
    return false;
}




function changesession() {


    //closewindow
    chrome.app.window.create('sessionselect.html', {
        // singleton: true,
        //id: "StudioBridge-Listener",
        bounds: {
            'width': 667,
            'height': 295
        }
        //frame: none
    });

    //open session window
    chrome.app.window.current().close();



}

function sendfile(theFile, sequence) {


    var filename = theFile.replace('data:image/jpeg;base64',"");


        var formData = {
            _links: {
                type: {
                    href: serveradd + '/rest/type/file/image'
                }
            },
            filename: [{
                value: "test.jpg"
            }],
            filemime: [{
                value: "image/jpeg"
            }],
            field_session: [{
                target_id: globalSession //get global session
            }],
            filesize: [{
                value: "488" //get filesize
            }],
            type: [{
                target_id: "image" //static
            }],
            data: [{
                value: filename
            }],

        };
        
        //console.log(JSON.stringify(formData));
        

    $.ajax({
        
        //processData: false,
        //contentType: false,
        async: true,
        url: serveradd + "/entity/file?_format=hal_json",
        method: "POST",
        headers: {
          "authorization": "Basic a3Jpc2huYToxMjM0",
          "content-type": "application/hal+json",
          //"cache-control": "no-cache",
          //"postman-token": "54574d50-e846-6642-51d0-038790477b9a"
        },
        data: JSON.stringify(formData),

        success: function(data) {
            //console.log('sent');
            imagequeue.shift();
            processinQueueFiles();
            isSending = false;

        }


    });


}



function processinQueueFiles() {
console.log(imagequeue.length);
//take all the files in queue and send them
if(imagequeue.length===0){ } else{

  sendfile(imagequeue[0],1);
}
}

