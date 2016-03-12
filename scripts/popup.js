var lastWord = '';

function setDefault() { 
    var saveBtn = document.getElementById('saveBtn');
    var wordInput = document.getElementById('word');
    var defInput = document.getElementById('def');
    if(lastWord) {
        wordInput.value = lastWord.word;
        defInput.value = lastWord.mainDef;
    }
    saveBtn.addEventListener('click', saveCorrection);
}

function saveCorrection () {
    var wordInput = document.getElementById('word');
    var defInput = document.getElementById('def');
    var word = wordInput.value;
    var def = defInput.value;
    if(word && def) {
        var sendData = {
            word: word,
            mainDef: def,
            update: true
        };
        chrome.runtime.sendMessage(sendData, function (response) {
            console.log('Word changed');
        });
    }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(request);
    if(request.lastWord){
        lastWord = request;
    }
    sendResponse({});
});

console.log('init poput');
chrome.runtime.sendMessage({getLastWord: true}, function(response) {
    lastWord = response;
    setDefault();
});