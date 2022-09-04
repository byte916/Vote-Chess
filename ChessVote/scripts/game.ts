import { send } from './common'
import { SwitchScreen } from './main'
import * as toastr from "toastr"
import { environment } from './environment'

var getGameStatTimer = null;

export function joinGame(name: string) {
    send({
        method: "get",
        url: environment.game.join + "?id=" + name,
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
        url: environment.game.check,
        onSuccess: (data) => {}
    });
}