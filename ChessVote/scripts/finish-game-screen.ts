import { send } from "./common";
import { environment } from "./environment";
import { Game } from "./game";
import { GameList } from "./game-list";
import { SwitchScreen } from "./main";

declare var Fireworks;

/**Завершить игру победой*/
export function FinishGameWin() {
    FinishGame('ПОБЕДА', true, 'green');
}

/**Закончить игру поражением*/
export function FinishGameLose() {
    FinishGame('ПОРАЖЕНИЕ', false, 'red');
}

/**Закончить игру ничьей*/
export function FinishGameDraw() {
    FinishGame('НИЧЬЯ', false, 'green');
}

/**Закончить игру
 @param title Надпись
 @param showFireworks Показывать феерверк
 @param color Цвет тени надписи
 */
function FinishGame(title: string, showFireworks: boolean, color: 'green'|'red') {
    Game.exit();
    Game.gameIsFinished = true;
    const body = document.querySelector('body');
    let wrapperBc = document.createElement('div');
    wrapperBc.style.position = 'fixed';
    wrapperBc.style.top = '0px';
    wrapperBc.style.bottom = '0px';
    wrapperBc.style.left = '0px';
    wrapperBc.style.right = '0px';
    wrapperBc.id = 'finishgame-wrapper-bc';
    wrapperBc.style.backgroundColor = '#000';
    wrapperBc.style.opacity = '0.5';
    wrapperBc.style.overflow = 'hidden';
    body.appendChild(wrapperBc);

    let wrapper
    if (showFireworks) {
        wrapper = document.createElement('div');
        wrapper.style.position = 'fixed';
        wrapper.style.top = '0';
        wrapper.style.bottom = '0';
        wrapper.style.left = '0';
        wrapper.style.right = '0';
        wrapper.id = 'finishgame-wrapper';
        body.appendChild(wrapper);
    }

    var rgb = ''
    if (color == 'green') {
        rgb = '#BFB'
    } else if (color == 'red') {
        rgb = '#FBB'
    }

    var header = document.createElement('div');
    header.style.marginTop = '300px';
    header.style.position = 'fixed';
    header.style.top = '0';
    header.style.bottom = '0';
    header.style.left = '0';
    header.style.right = '0';
    header.style.fontSize = '32px';
    header.style.textAlign = 'center';
    header.textContent = title;
    header.style.textShadow = rgb + ' 0px 0px 10px ,#BBF 0px 0px 15px,#FBB 0px 0px 20px,#DFD 0px 0px 30px,#DDF 0px 0px 40px, #FDD 0px 0px 50px';
    body.appendChild(header);

    let closeFunc = () => {
        wrapperBc.remove();
        if (showFireworks) wrapper.remove();
        header.remove();
        SwitchScreen.toMain();

        send({
            method: "GET",
            url: environment.game.exit
        }).then(() => {
            GameList.runUpdate();
        });
    };

    wrapperBc.addEventListener('click', closeFunc);
    header.addEventListener('click', closeFunc);

    if (showFireworks) {
        wrapper.addEventListener('click', closeFunc);
        const fireworks = new Fireworks.default(wrapper, {
            opacity: 0.1,
            particles: 120
        });
        fireworks.start();
    }
}