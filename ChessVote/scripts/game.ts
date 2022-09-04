import { send } from './common';
import { environment } from './environment';
import { SwitchScreen } from './main';
import { GameList } from './game-list';

export class Game {
    static getGameStatTimer = null;

    /**Присоединиться к игре */
    public static join() {
        Game.getGameStatTimer = setInterval(Game.getGameState, 1000);
    }

    public static exit() {
        if (Game.getGameStatTimer != null) clearInterval(Game.getGameStatTimer);
    }

    public static getGameState() {
        send({
            method: "GET",
            url: environment.game.check,
            onSuccess: (data: GameCheck) => {
                // Если человек не подключен к игре
                if (data.status == 0) {
                    Game.exit();
                    SwitchScreen.toMain();
                    GameList.runUpdate();
                }
            }
        });
    }
}

/**Состояние игры */
class GameCheck {
    public status: number;
}