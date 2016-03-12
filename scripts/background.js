var MIN = 60000;

var settings = {
    repeatTime: 10,
    notificationDuration: 5000
};

var dictionary = {};
var lastWord = "";

function saveObj (key, value) {
    var savingObj = {};
    savingObj[key] = value;
    chrome.storage.sync.set(savingObj, function() {
        console.log(key + ' saved');
    });

    if(dictionary) {
        dictionary[key] = value;
    }
}



function init () {
    chrome.storage.sync.get(null, function (items) {
        dictionary = items;

        chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {
                var key,
                    value,
                    savingObj;
                if(request.saveNew) {
                    key = request.word;
                    value = { mainDef: request.mainDef, otherDefs: request.otherDefs, known: false };
                    lastWord = request;
                    lastWord.lastWord = true;
                    lastWord.saveNew = false;
                    saveObj(key, value);
                    sendResponse({});
                } else if(request.update) {
                    if(lastWord) {
                        chrome.storage.sync.remove(lastWord.word, function () {
                            key = request.word;
                            value = { mainDef: request.mainDef, otherDefs: lastWord.otherDefs, known: false };
                            lastWord = request;
                            lastWord.update = false;
                            saveObj(key, value);
                        });
                    }
                    sendResponse({});
                } else if(request.getLastWord) {
                    sendResponse(lastWord);
                }
        });

        console.log(dictionary);
        var wordShowingTimer = setInterval(function() {
            var dictKeys = Object.keys(dictionary);
            var wordIndex = Math.floor(Math.random() * dictKeys.length);
            var word = dictKeys[wordIndex];
            var translData = dictionary[word];

            var items = [];
            for(var i = 0; i < translData.otherDefs.length; i++) {
                var newElem = {};
                newElem.title = translData.otherDefs[i].defs.join(', ');
                newElem.message = translData.otherDefs[i].pos;
                items.push(newElem);
            }

            var options = {
                type: 'list',
                title: dictKeys[wordIndex].toString() + ' - ' + translData.mainDef.toString(),
                message: translData.mainDef,
                items: items,
                buttons: [{title: 'I know'}],
                iconUrl: 'images/128.png'
            };

            chrome.notifications.create('', options, function(notificationId) {
                chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
                    if (notifId === notificationId) {
                        if (btnIdx === 0) {
                            translData.known = true;
                            saveObj(word, translData);
                            chrome.notifications.clear(notificationId);
                        }
                    }
                });

                setTimeout(function(){
                    chrome.notifications.clear(notificationId);
                }, settings.notificationDuration);
            });


        }, settings.repeatTime * MIN);
    });
}

init();