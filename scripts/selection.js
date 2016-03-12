function findNodeById (nodesArr, id) {
    for(var i = 0; i < nodesArr.length; i++) {
        if( nodesArr[i].classList && 
            nodesArr[i].id === id) return nodesArr[i];
    }
    return null;
}


function parseGoogleTranslatePopUp(mutation) {
    if (!mutation.addedNodes) return;

    var gtxHostNode = findNodeById(mutation.addedNodes, 'gtx-host');
    if(!gtxHostNode) return;

    var contentNode = gtxHostNode.shadowRoot.childNodes[1];
    var translationBlock = contentNode.childNodes[0].childNodes[0];
    var wordNode = translationBlock.childNodes[2];
    var mainDefNode = translationBlock.childNodes[6];
    var otherDefTable = translationBlock.childNodes[7];
    var otherDefNodesArr = otherDefTable.childNodes[0].childNodes;

    var otherDefArr = [];
    for(var i = 0; i < otherDefNodesArr.length; i++) {
        var newElem = {};
        newElem.pos = otherDefNodesArr[i].childNodes[0].childNodes[0].textContent;
        newElem.defs = otherDefNodesArr[i].childNodes[1].textContent.split(', ');
        otherDefArr.push(newElem);
    }

    var addBtnCrt = document.createElement('div');
    addBtnCrt.innerHTML = '<p class="btnText">+</p>';
    addBtnCrt.id = 'addWordBtn';
    gtxHostNode.parentNode.appendChild(addBtnCrt);

    var translationData = {};

    translationData.word = wordNode.textContent;
    translationData.mainDef = mainDefNode.textContent;
    translationData.otherDefs = otherDefArr;
    translationData.saveNew = true;
    console.log(translationData);

    addBtnCrt.addEventListener('click', function (e) {
        chrome.runtime.sendMessage(translationData,  function(response) {
            console.log('Added');
        });
    });
}

var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function(mutation) {
        parseGoogleTranslatePopUp(mutation);
    });

});

var observConfig = { childList: true, characterData: true, subtree: true };

observer.observe(document.body, observConfig);