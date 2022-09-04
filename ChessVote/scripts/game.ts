import { send } from './common'
import { SwitchScreen, onGameExit } from './main'
import * as toastr from "toastr"

var getGameStatTimer = null;

export function joinGame(name: string) {
    send({
        method: "get",
        url: "game/join?id=" + name,
        onSuccess: () => {
            SwitchScreen.toSlaveGame();
            getGameStatTimer = setInterval(getGameState, 1000);
        },
        onError: () => {
            toastr.warning("Произошла ошибка (код ошибки 1)");
        }
    });
}


function getGameState() {
    send({
        method: "GET",
        url: "game/getstate",
        onSuccess: (data: { state: number }) => {
            if (data.state != 2) {
                onGameExit();
                if (getGameStatTimer != null) clearInterval(getGameStatTimer);
            }
        }
    });
}