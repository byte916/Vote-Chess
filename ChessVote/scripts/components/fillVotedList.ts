/**Список  */
export class VotedList {
    /** Список игроков (проголосовавших и в игре) */
    private static players: { name: string, isVoted: boolean, html: HTMLDivElement }[] = [];

    /**
     * Заполнить список проголосовавших людей
     * @param votes Проголосовавшие люди
     * @param online Не проголосовавшие люди присоединившиеся к игре
     * @param boardWrapper DOM-элемент, в котором надо показать список проголосоваших людей
     */
    public static Fill(votes: string[], online: string[], boardWrapper: HTMLDivElement) {

        // Заполняем список проголосовавших и людей в игре
        boardWrapper.querySelector(".vote_counter").innerHTML = "Проголосовало: " + votes.length;
        boardWrapper.querySelector(".online_counter").innerHTML = "В игре: " + (online.length + votes.length);

        var playerList = boardWrapper.querySelector('.participants .list');
        var newPlayers: { name: string, isVoted: boolean, html: HTMLDivElement }[] = [];

        // Проходим по закешированному списку проголосовавших и не проголосовавших
        // Все изменения отображаем на странице
        for (var i = 0; i < online.length; i++) {
            let players = VotedList.players.filter(p => p.name == online[i]);
            if (players.length == 0) {
                var html = document.createElement('div');
                html.innerText = online[i];
                newPlayers.push({
                    name: online[i],
                    isVoted: false,
                    html: html
                });
                playerList.append(html);
                continue;
            }

            let player = players[0];
            newPlayers.push(player);
            if (!player.isVoted) continue;
            player.isVoted = false;
            player.html.classList.remove('active');
        }

        for (var i = 0; i < votes.length; i++) {
            let players = VotedList.players.filter(p => p.name == votes[i]);
            if (players.length == 0) {
                var html = document.createElement('div');
                html.classList.add('active');
                html.innerText = votes[i];
                newPlayers.push({
                    name: votes[i],
                    isVoted: true,
                    html: html
                });
                playerList.append(html);
                continue;
            }

            let player = players[0];
            newPlayers.push(player);
            if (player.isVoted) continue;
            player.isVoted = true;
            player.html.classList.add('active');
        }
        for (var i = 0; i < VotedList.players.length; i++) {
            if (newPlayers.some(np => np.name == VotedList.players[i].name)) continue;
            VotedList.players[i].html.remove();
        }
        VotedList.players = newPlayers;
    }
}