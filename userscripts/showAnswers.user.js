// ==UserScript==
// @name           juicemind show answers
// @description    thanks juicemind! more @ https://github.com/VillainsRule/Juicemind
// @icon           https://i.imgur.com/ORAaPzD.png
// @version        1.1

// @author         VillainsRule
// @namespace      https://github.com/VillainsRule/Juicemind

// @match          *://play.juicemind.com/*
// @run-at         document-start
// @grant          none
// ==/UserScript==

console.log('show answers init');

let _WebSocket = WebSocket = window.WebSocket;

WebSocket = window.WebSocket = class extends _WebSocket {
    constructor(...args) {
        super(...args);

        if (args[0].includes('firebaseio.com')) this.addEventListener('message', (m) => {
            try {
                let json = JSON.parse(m.data);
                let latestState = json?.d?.b?.d?.question;
                if (!latestState || !latestState.questionType) return;

                if (latestState.questionType == 'find-the-error')
                    document.querySelector('#answer').innerHTML = '<span>type: <b>find the error</b></span><span>error line: <b>' + (latestState.errorLine + 1) + '</b></span>';

                if (latestState.questionType == 'fill-in-the-code')
                    document.querySelector('#answer').innerHTML = '<span>type: <b>enter code</b></span>'

                if (latestState.questionType == 'multiple-choice')
                    document.querySelector('#answer').innerHTML = '<span>type: <b>multiple choice</b></span><span>answer: <b>' + latestState.multipleChoiceAnswerSelection + '</b></span>'
            } catch (e) {
                console.error(e);
            }
        });
    }
};

setTimeout(() => {
    document.body.insertAdjacentHTML('beforeend', `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap');

            .floating-div {
                position: fixed;
                bottom: 10px;
                left: 10px;
                width: 300px;
                height: 70px;
                background-color: black;
                color: white;
                font-family: 'Nunito', sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                z-index: 9999999999;
                font-weight: bold;
                border-radius: 5px;
            }
        </style>
    `);

    document.body.insertAdjacentHTML('beforeend', `
        <div class="floating-div" id="answer">game is loading...</div>
    `);
}, 1500);
