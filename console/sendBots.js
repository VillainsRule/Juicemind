(() => {
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

    let gameId = findByKey(document.querySelector('#root'), 'gameRoomId');

    let numBots = Number(prompt('number of bots?'));
    if (isNaN(numBots) || numBots < 1) return alert('invalid number of bots. must be > 1 and a valid number');

    let botName = prompt('bot name?');

    for (let i = 0; i < numBots; i++) {
        fetch('https://us-central1-juicemind-a9d9e.cloudfunctions.net/joinQuiz', {
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                data: {
                    userId: Math.random().toString().slice(2),
                    gameRoomId: gameId,
                    nickname: botName
                }
            }),
            method: 'POST'
        });
    }

    alert('bots sent!');
})();
