import { send } from './common';
import { environment } from './environment';
import { SwitchScreen } from './main';
import { GameList } from './game-list';
import * as toastr from 'toastr';
declare var Chessboard;
const Chess = require('chess.js');

export class Game {
    static getGameStateTimer = null;
    static isGameRunning = false;

    static game;
    static userColor;
    static isMaster = false;
    static movesLength;

    static inGame: { name: string, isActive: boolean }[] = [];

    /** Присоединившиеся игроки */
    static players: { name: string, isVoted: boolean, html: HTMLDivElement }[] = [];
    
    /**Создать игру */
    public static start(color: string) {
        if (Game.isGameRunning) return;
        Game.inGame.length = 0;
        Game.inGame = [];
        Game.isGameRunning = true;
        Game.getGameState();
        Game.userColor = color == 'b' ? 'black' : 'white';
        Game.game = new Chess();
        Game.SavePgn();
        Game.isMaster = true;
        Board.init("board-master");
    }

    /**Продолжить собственную игру */
    public static continueGame(color: string) {
        if (Game.isGameRunning) return;
        Game.inGame.length = 0;
        Game.inGame = [];
        Game.isGameRunning = true;
        Game.getGameState();
        Game.userColor = color == 'b' ? 'black' : 'white';

        send({
            method: "GET",
            url: environment.game.getpgn
        }).then((data: { pgn: string }) => {
            Game.game = new Chess();
            if (data.pgn != 'start') {
                Game.game.load_pgn(data.pgn);
            }
            Game.isMaster = true;
            Board.init("board-master");
        });
    }

    /**Присоединиться к игре */
    public static join(pgn: string, color: string) {
        if (Game.isGameRunning) return;
        Game.inGame.length = 0;
        Game.inGame = [];
        Game.isGameRunning = true;
        Game.getGameState();

        Game.userColor = color == 'black' ? 'black' : 'white';
        Game.isMaster = false;
        Game.game = new Chess();
        if (pgn != 'start') Game.game.load_pgn(pgn);
        (document.querySelector(".cancelVote") as HTMLElement).style.display = 'none';
        Game.RestoreVote();
        Game.movesLength = Game.game.history().length;
        Board.init("board-slave");
    }

    /**Восстановить голос (после обновления страницы) */
    public static RestoreVote() {
        send({
            method: "GET",
            url: environment.game.restorevote
        }).then((data: { from: string, to: string, moves: number }) => {
            if (data == null) return;
            if (Game.movesLength != data.moves) return;
            Game.game.move({ from: data.from, to: data.to });
            Board.setPosition(Game.game.fen());
            (document.querySelector(".cancelVote") as HTMLElement).style.display = '';
        });
    }

    /**Выйти из игры*/
    public static exit() {
        if (!Game.isGameRunning) return;
        Game.isGameRunning = false;
        if (Game.getGameStateTimer != null) {
            clearTimeout(Game.getGameStateTimer);
            Game.getGameStateTimer = null;
        }
    }

    /**Получить состояние игры */
    public static getGameState() {
        send({
            method: "GET",
            url: environment.game.check
        }).then((data: GameCheck) => {
            // Если человек не подключен к игре (например, игра закончилась)
            if (data.status == 0) {
                Game.exit();
                SwitchScreen.toMain();
                GameList.runUpdate();
                return;
            }

            var board: HTMLDivElement;
            if (Game.isMaster) {
                board = document.querySelector('#game-master');
            } else {
                board = document.querySelector('#game-slave');
            }

            // Заполняем список проголосовавших и людей в игре
            board.querySelector(".vote_counter").innerHTML = "Проголосовало: " + data.votes.length;
            board.querySelector(".online_counter").innerHTML = "В игре: " + (data.online.length + data.votes.length);

            var playerList = board.querySelector('.participants .list');
            var newPlayers: { name: string, isVoted: boolean, html: HTMLDivElement }[] = [];

            // Проходим по закешированному списку проголосовавших и не проголосовавших
            // Все изменения отображаем на странице
            for (var i = 0; i < data.online.length; i++) {
                let players = Game.players.filter(p => p.name == data.online[i]);
                if (players.length == 0) {
                    var html = document.createElement('div');
                    html.innerText = data.online[i];
                    newPlayers.push({
                        name: data.online[i],
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

            for (var i = 0; i < data.votes.length; i++) {
                let players = Game.players.filter(p => p.name == data.votes[i]);
                if (players.length == 0) {
                    var html = document.createElement('div');
                    html.classList.add('active');
                    html.innerText = data.votes[i];
                    newPlayers.push({
                        name: data.votes[i],
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
            for (var i = 0; i < Game.players.length; i++) {
                if (newPlayers.some(np => np.name == Game.players[i].name)) continue;
                Game.players[i].html.remove();
            }
            Game.players = newPlayers;

            if (Game.isMaster && data.votes != null && data.votes.length > 0) {
                (document.querySelector(".finishVote") as HTMLElement).style.display = '';
            }
            if (Game.isMaster) {
                if (Game.isGameRunning) Game.getGameStateTimer = setTimeout(Game.getGameState, 300);
                return;
            }

            if (Game.movesLength != data.moves) {
                send({
                    method: "GET",
                    url: environment.game.getpgn
                }).then((pgnData: { pgn: string }) => {
                    Game.game = new Chess();
                    if (pgnData.pgn != 'start') {
                        Game.game.load_pgn(pgnData.pgn);
                    }
                    Board.setPosition(Game.game.fen());
                    Game.movesLength = data.moves;
                    (document.querySelector(".cancelVote") as HTMLElement).style.display = 'none';
                });
            }

            if (Game.isGameRunning) Game.getGameStateTimer = setTimeout(Game.getGameState, 300);
        });
    }

    static SavePgn() {
        send({
            method: "GET",
            url: environment.game.savepgn + "?pgn=" + Game.game.pgn() + "&moves=" + Game.game.history().length
        }).then(() => { }, () => {
            toastr.error("Произошла ошибка. Обновите страницу и попробуйте снова");
        });
    }

    /**Сделать ход (добавить в голосование, либо выполнить ход и сохранить PGN) */
    static Move(from, to) {
        if (Game.isMaster) {
            Game.SavePgn();
            (document.querySelector(".finishVote") as HTMLElement).style.display = '';
            return;
        }

        send({
            method: "GET",
            url: environment.game.vote + "?from=" + from + "&to=" + to + "&moves=" + Game.movesLength
        }).then(
            () => {
                (document.querySelector(".cancelVote") as HTMLElement).style.display = '';
            },
            () => {
                toastr.warning("Произошла ошибка. Обновите страницу и попробуйте снова (код 4)");
            });
    }

    /**
     * Применить указанный ход и финишировать голосование
     * @param from
     * @param to
     */
    static FinishVote(from, to) {
        Game.game.move({ from: from, to: to });
        Board.setPosition(Game.game.fen());
        Game.SavePgn();
        (document.querySelector(".finishVote") as HTMLElement).style.display = 'none';

    }
}

export class Board {
    public static board;

    static init(htmlElementId: string) {
        Board.board = Chessboard(htmlElementId, {
            position: Game.game.fen(),
            orientation: Game.userColor,
            draggable: true,
            onDragStart: Board.onDragStart,
            onDrop: Board.onDrop,
            onSnapEnd: Board.onSnapEnd
        });
    }

    board = null;

    static setPosition(fen: string) {
        Board.board.position(fen);
    }
    
    static onDragStart(source, piece, position, orientation) {
        // do not pick up pieces if the game is over
        if (Game.game.game_over()) return false

        // only pick up pieces for the side to move
        if ((Game.game.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (Game.game.turn() === 'b' && piece.search(/^w/) !== -1)) {
            return false
        }

        if ((Game.game.turn() === 'w' && Game.userColor == 'black') ||
            (Game.game.turn() === 'b' && Game.userColor == 'white'))
            return false;
    }

    static onDrop(source, target) {
        // see if the move is legal
        var move = Game.game.move({
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        })

        // illegal move
        if (move === null) return 'snapback';
        Game.Move(source, target);
    }

    // update the board position after the piece snap
    // for castling, en passant, pawn promotion
    static onSnapEnd() {
        Board.board.position(Game.game.fen());
    }
}

/**Состояние игры */
class GameCheck {
    /**
     * Статус игры
     */
    public status: number;
    /**
     * Количество сделанных ходов
     */
    public moves: number;
    /**
     * Список проголосовавших игроков
     */
    public votes: string[];
    /**
     * Список не проголосовавших игроков
     */
    public online: string[];
}