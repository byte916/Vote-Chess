import { send } from './common'
import { hideAllScreens } from './main'
import * as toastr from "toastr"

export function joinGame(name: string) {
    send({
        method: "get",
        url: "game/join?id=" + name,
        onSuccess: () => {
            hideAllScreens("game-slave");
        },
        onError: () => {
            toastr.warning("Произошла ошибка (код ошибки 1)");
        }
    });
}