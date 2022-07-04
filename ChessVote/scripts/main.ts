import { ready, send } from './common'
import { runGetGameList, stopGetGameList } from './game-list'


ready(() => {
    getState();
    // Нажатие на кнопку "Создать новую игру"
    document.getElementById('btn_create_game').addEventListener('click', () => {
        send({
            method: "GET",
            url: "game/create",
            onSuccess: onGameCreated
        });
    });

    document.getElementById("exit").addEventListener('click', () => {
        send({
            method: "GET",
            url: "game/exit",
            onSuccess: onGameExit
        });
    });
});

/**Получить состояние */
function getState() {
    send({
        method: "GET",
        url: "game/getstate",
        onSuccess: (data: { state: number }) => {
            switch (data.state) {
                case 0:
                    // Не в игре
                    document.getElementById("main-screen").style.display = "";
                    document.getElementById("game").style.display = "none";
                    runGetGameList();
                    break;
                case 1:
                    // В игре
                    document.getElementById("main-screen").style.display = "none";
                    document.getElementById("game").style.display = "";
                    break;
            }
        }
    });
}

/**После нажатия на кнопку Создать новую игру */
function onGameCreated() {
    stopGetGameList();
    document.getElementById("main-screen").style.display = "none";
    document.getElementById("game").style.display = "";
}

function onGameExit() {
    document.getElementById("main-screen").style.display = "";
    document.getElementById("game").style.display = "none";
    runGetGameList();
}