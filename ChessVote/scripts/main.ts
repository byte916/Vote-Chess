import { documentReady, send } from './common'
import { GameList } from './game-list'
import { Game, Board } from './game';
import { environment } from './environment';
import * as toastr from "toastr"
// Код последней ошибки 4
/**Состояние игры после загрузки страницы */
declare var state: number;
declare var color: string;

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
            Game.continueGame(color);
        break;
    case 2:
        // Присоединённый к игре
        onRejoinToGame();
        break;
    }
    // Нажатие на кнопку "Создать новую игру"
    document.getElementById('btn_white_create_game').addEventListener('click', () => { onGameCreateClick("w") });
    document.getElementById('btn_black_create_game').addEventListener('click', () => { onGameCreateClick("b") });

    document.querySelectorAll(".exit").forEach(element => {
        element.addEventListener('click', onGameExitClick);
    });

    document.querySelector(".finishVote").addEventListener('click', onFinishVoteClick);

    document.querySelector(".cancelVote").addEventListener('click', onCancelVoteClick);
});



/**Нажатие на кнопку Создать новую игру */
function onGameCreateClick(color: string) {
    GameList.stopUpdate();
    SwitchScreen.toMasterGame();
    send({
        method: "GET",
        url: environment.game.create + "?color=" + color,
    }).then(() => {
        Game.start(color);
    });
}

/**Отменить голос */
function onCancelVoteClick() {
    var undo = Game.game.undo();
    if (undo == null) return;
    send({
        method: "GET",
        url: environment.game.undovote
    }).then(() => {
        Board.setPosition(Game.game.fen());
        (document.querySelector(".cancelVote") as HTMLElement).style.display = 'none';
    });
}

/**Клик на кнопку "Завершить голосование */
function onFinishVoteClick() {
    send({
        method: "GET",
        url: environment.game.finishvote
    }).then((data: { result: string, from: string, to: string }) => {
        if (data.result == '') {
            toastr.warning("Несколько ходов набрали равное количество голосов. Нужны новые голоса или чтобы кто-то переголосовал.");
            return;
        }
        Game.FinishVote(data.from, data.to);
        toastr.success("За этот ход проголосовало " + data.result);
    });
}

/**Выйти из игры */
export function onGameExitClick() {
    if (Game.isMaster && !confirm("Игра будет завершена")) {
        return;
    }
    if (!confirm("Точно выйти?")) return;

    Game.exit();
    SwitchScreen.toMain();

    send({
        method: "GET",
        url: environment.game.exit
    }).then(() => {
        GameList.runUpdate();
    });
}

export function onJoinToGameClick(name: string) {
    GameList.stopUpdate();
    SwitchScreen.toSlaveGame();
    send({
        method: "get",
        url: environment.game.join + "?id=" + name
    }).then((data: { pgn: string, color: string }) => {
        Game.join(data.pgn, data.color);
    }, () => {
        toastr.warning("Произошла ошибка (код ошибки 1)");
    });
}

/**Переподключиться к чужой игре (после восстановления связи) */
function onRejoinToGame() {
    GameList.stopUpdate();
    SwitchScreen.toSlaveGame();
    send({
        method: "get",
        url: environment.game.rejoin
    }).then((data: { pgn: string, color: string }) => {
        Game.join(data.pgn, data.color);
    }, () => {
        toastr.warning("Произошла ошибка (код ошибки 1)");
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