import { send } from './common'
import { onJoinToGame } from './main';

/**Таймер получения списка игр */
var getGameListTimer = null;
/**Список игр */
var games: string[] = [];

/**Запустить механизм получения списка игр */
export function runGetGameList() {
    var table = document.querySelector("#main-screen table tbody") as HTMLTableElement;
    table.innerHTML = "";
    games.length = 0;
    games = [];
    getGameList();
    // Каждую секунду получаем список игр
    getGameListTimer = setInterval(getGameList, 1000);
}

export function stopGetGameList() {
    if (getGameListTimer != null) clearInterval(getGameListTimer);
}

function getGameList() {
    send({
        method: "GET",
        url: "game/getgamelist",
        onSuccess: (gameList: string[]) => {
            var table = document.querySelector("#main-screen table tbody") as HTMLTableElement;
            for (let i = 0; i < gameList.length; i++) {
                if (games.indexOf(gameList[i]) === -1) {
                    createGameListRow(gameList[i], table);
                    games.push(gameList[i]);
                    continue;
                }
            }
            for (let j = 0; j < games.length; j++) {
                if (gameList.indexOf(games[j]) === -1) {
                    table.removeChild(table.querySelector("[data-name=" + games[j] + "]"));
                    games.splice(j, 1);
                    j--;
                }
            }
        }
    });
}

/**
 * Добавить строку с игрок
 * @param name Название игрока, создавшего игру
 * @param tableBody
 */
function createGameListRow(name: string, tableBody: HTMLTableElement) {
    var row = document.createElement("tr");
    row.dataset.name = name;
    var nameCell = document.createElement("td");
    nameCell.innerText = name;
    row.appendChild(nameCell);
    var buttonCell = document.createElement("td");
    var button = document.createElement("a");
    button.onclick = () => { onJoinToGame(name); };
    button.classList.add("ui", "compact", "inverted", "cv-white-background", "grey", "basic", "button");
    button.innerText = "Присоединиться";
    buttonCell.appendChild(button);
    row.appendChild(buttonCell);
    tableBody.appendChild(row);
}