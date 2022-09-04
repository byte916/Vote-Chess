import { send } from './common'
import { onJoinToGameClick } from './main';
import { environment } from './environment'

/**Управление списком игроков */
export class GameList {
/**Таймер получения списка игр */
    static getGameListTimer = null;

    /**Список игр */
    static games: string[] = [];

    /**Запустить механизм получения списка игр */
    public static runUpdate() {
        var table = document.querySelector("#main-screen table tbody") as HTMLTableElement;
        table.innerHTML = "";
        GameList.games.length = 0;
        GameList.games = [];
        // Каждую секунду получаем список игр
        GameList.getGameListTimer = setInterval(() => {
            new GameList().getGameList();
        }, 1000);
    }

    public static stopUpdate() {
        if (GameList.getGameListTimer != null) clearInterval(GameList.getGameListTimer);
    }

    private getGameList() {
        var list = new GameList();
        send({
            method: "GET",
            url: environment.gameList.get,
            onSuccess: (gameList: string[]) => {
                var table = document.querySelector("#main-screen table tbody") as HTMLTableElement;
                for (let i = 0; i < gameList.length; i++) {
                    if (GameList.games.indexOf(gameList[i]) === -1) {
                        list.createGameListRow(gameList[i], table);
                        GameList.games.push(gameList[i]);
                        continue;
                    }
                }
                for (let j = 0; j < GameList.games.length; j++) {
                    if (gameList.indexOf(GameList.games[j]) === -1) {
                        table.removeChild(table.querySelector("[data-name=" + GameList.games[j] + "]"));
                        GameList.games.splice(j, 1);
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
    private createGameListRow(name: string, tableBody: HTMLTableElement) {
        var row = document.createElement("tr");
        row.dataset.name = name;
        var nameCell = document.createElement("td");
        nameCell.innerText = name;
        row.appendChild(nameCell);
        var buttonCell = document.createElement("td");
        var button = document.createElement("a");
        button.onclick = () => { onJoinToGameClick(name); };
        button.classList.add("ui", "compact", "inverted", "cv-white-background", "grey", "basic", "button");
        button.innerText = "Присоединиться";
        buttonCell.appendChild(button);
        row.appendChild(buttonCell);
        tableBody.appendChild(row);
    }
}