import { documentReady, send } from './common'
import { GameList } from './game-list'
import { Game, Board } from './game';
import { environment } from './environment';
import * as toastr from "toastr"
// Код последней ошибки 3
/**Состояние игры после загрузки страницы */
declare var state: number;

documentReady(() => {
    // В зависимости от текущего состояния переходим в соответствующий режим
    switch (state) {
    case 0:
        // Не в игре
        SwitchScreen.toMain();
        GameList.runUpdate();
        break;
    case 1:
        // В собственной игре
        SwitchScreen.toMasterGame();
        Game.continue();
        break;
    case 2:
        // Присоединённый к игре
        onRejoinToGame();
        break;
    }
    // Нажатие на кнопку "Создать новую игру"
    document.getElementById('btn_create_game').addEventListener('click', onGameCreateClick);

    document.querySelectorAll(".exit").forEach(element => {
        element.addEventListener('click', onGameExitClick);
    });
});

/**Нажатие на кнопку Создать новую игру */
function onGameCreateClick() {
    send({
        method: "GET",
        url: environment.game.create,
        onSuccess: () => {
            SwitchScreen.toMasterGame();
            GameList.stopUpdate();
            Game.start();
        }
    });
}

/**Выйти из игры */
export function onGameExitClick() {
    if (!confirm("Точно выйти?")) return;
    send({
        method: "GET",
        url: environment.game.exit,
        onSuccess: () => {
            SwitchScreen.toMain();
            GameList.runUpdate();
        }
    });
}

export function onJoinToGameClick(name: string) {
    send({
        method: "get",
        url: environment.game.join + "?id=" + name,
        onSuccess: (data:{pgn: string}) => {
            SwitchScreen.toSlaveGame();
            GameList.stopUpdate();
            Game.join(data.pgn);
        },
        onError: () => {
            toastr.warning("Произошла ошибка (код ошибки 1)");
        }
    });
}

/**Переподключиться к чужой игре (после восстановления связи) */
function onRejoinToGame() {
    send({
        method: "get",
        url: environment.game.rejoin,
        onSuccess: (data: { pgn: string }) => {
            SwitchScreen.toSlaveGame();
            GameList.stopUpdate();
            Game.join(data.pgn);
        },
        onError: () => {
            toastr.warning("Произошла ошибка (код ошибки 1)");
        }
    });
}


export class SwitchScreen {
    public static toMain() {
        SwitchScreen.hideScreens();
        document.getElementById("main-screen").style.display = "";
    }

    public static toMasterGame() {
        SwitchScreen.hideScreens();
        document.getElementById("game-master").style.display = "";
    }

    public static toSlaveGame() {
        SwitchScreen.hideScreens();
        document.getElementById("game-slave").style.display = "";

    }

    private static hideScreens() {
        document.getElementById("main-screen").style.display = "none";
        document.getElementById("game-master").style.display = "none";
        document.getElementById("game-slave").style.display = "none";
    }
}