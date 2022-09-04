import { documentReady, send } from './common'
import { runGetGameList, stopGetGameList } from './game-list'
import { joinGame } from './game';
// Код последней ошибки 3
/**Состояние игры после загрузки страницы */
declare var state: number;

documentReady(() => {
    // В зависимости от текущего состояния переходим в соответствующий режим
    switch (state) {
    case 0:
        // Не в игре
        SwitchScreen.toMain();
        runGetGameList();
        break;
    case 1:
        // В собственной игре
        SwitchScreen.toMasterGame();
        break;
    case 2:
        // Присоединённый к игре
        SwitchScreen.toSlaveGame();
        break;
    }
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

/**После нажатия на кнопку Создать новую игру */
function onGameCreated() {
    SwitchScreen.toMasterGame();
    stopGetGameList();
}

/**Выйти из игры */
export function onGameExit() {
    SwitchScreen.toMain();
    runGetGameList();
}

export function onJoinToGame(name: string) {
    joinGame(name);
    stopGetGameList();
}


export class SwitchScreen {
    public static toMain() {
        this.hideScreens();
        document.getElementById("main-screen").style.display = "";
    }

    public static toMasterGame() {
        this.hideScreens();
        document.getElementById("game-master").style.display = "";
    }

    public static toSlaveGame() {
        this.hideScreens();
        document.getElementById("game-slave").style.display = "";

    }

    private static hideScreens() {
        document.getElementById("main-screen").style.display = "none";
        document.getElementById("game-master").style.display = "none";
        document.getElementById("game-slave").style.display = "none";
    }
}