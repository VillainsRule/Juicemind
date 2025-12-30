(() => {
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

    let lastState = null;
    let interval = null;

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

    setInterval(() => {
        const latestState = getLatestState();
        if (lastState == latestState) return;

        lastState = latestState;

        if (latestState.questionType == 'find-the-error') {
            let properLine = latestState.errorLine;
            document.querySelector('#answer').innerHTML = '<span>type: <b>find the error</b></span><span>error line: <b>' + properLine + '</b></span>'
        }

        if (latestState.questionType == 'fill-in-the-code') {
            clearInterval(interval);

            interval = setInterval(() => {
                try {
                    let editor = ace.edit('ace-editor');
                    editor.setValue(latestState.solutionCode);
                } catch { }
            }, 1);

            document.querySelector('#answer').innerHTML = '<span>type: <b>enter code</b></span>'
        }

        if (latestState.questionType == 'multiple-choice')
            document.querySelector('#answer').innerHTML = '<span>type: <b>multiple choice</b></span><span>answer: <b>' + latestState.multipleChoiceAnswerSelection + '</b></span>'
    }, 20);
})();
