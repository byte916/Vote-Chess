import { ready, send } from './common'
import { runGetGameList, stopGetGameList } from './game-list'
import { joinGame } from './game';
// Код последней ошибки 3

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

    document.querySelectorAll(".exit").forEach(element => {
        element.addEventListener('click',
            () => {
                send({
                    method: "GET",
                    url: "game/exit",
                    onSuccess: onGameExit
                });
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
                    hideAllScreens("main-screen");
                    runGetGameList();
                    break;
                case 1:
                    // В собственной игре
                    hideAllScreens("game-master");
                    break;
                case 2:
                    // Присоединённый к игре
                    hideAllScreens("game-slave");
                    break;
            }
        }
    });
}

/**После нажатия на кнопку Создать новую игру */
function onGameCreated() {
    hideAllScreens("game-master");
    stopGetGameList();
}

function onGameExit() {
    hideAllScreens("main-screen");
    runGetGameList();
}

export function onJoinToGame(name: string) {
    joinGame(name);
    stopGetGameList();
}

/**
 * Скрыть все блоки
 * @param except блок, который останется видимым
 */
export function hideAllScreens(except: string) {
    document.getElementById("main-screen").style.display = "none";
    document.getElementById("game-master").style.display = "none";
    document.getElementById("game-slave").style.display = "none";

    document.getElementById(except).style.display = "";
}