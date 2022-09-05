import { send } from './common';
import { environment } from './environment';
import { SwitchScreen } from './main';
import { GameList } from './game-list';
import * as toastr from 'toastr';
declare var Chessboard;
const Chess = require('chess.js');

export class Game {
    static getGameStatTimer = null;
    static game;
    static userColor;
    static isMaster = false;
    static movesLength;
    
    /**Создать игру */
    public static start() {
        if (Game.getGameStatTimer != null) return;
        Game.getGameStatTimer = setInterval(Game.getGameState, 1000);
        Game.userColor = 'white';
        Game.game = new Chess();
        Game.SavePgn();
        Game.isMaster = true;
        Board.init("board-master");
    }

    /**Продолжить собственную игру */
    public static continue() {
        if (Game.getGameStatTimer != null) return;
        Game.getGameStatTimer = setInterval(Game.getGameState, 1000);
        Game.userColor = 'white';

        send({
            method: "GET",
            url: environment.game.getpgn,
            onSuccess: (data: { pgn: string }) => {
                Game.game = new Chess();
                if (data.pgn != 'start') {
                    Game.game.load_pgn(data.pgn);
                }
                Game.isMaster = true;
                Board.init("board-master");
            }
        });
    }

    /**Присоединиться к игре */
    public static join(pgn: string) {
        if (Game.getGameStatTimer != null) return;
        Game.getGameStatTimer = setInterval(Game.getGameState, 1000);
        
        Game.userColor = 'black';
        Game.game = new Chess();
        if (pgn != 'start') Game.game.load_pgn(pgn);
        Game.movesLength = Game.game.history().length;
        Board.init("board-slave");
    }


    
    public static exit() {
        if (Game.getGameStatTimer != null) {
            clearInterval(Game.getGameStatTimer);
            Game.getGameStatTimer = null;
        }
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
                    return;
                }
                document.querySelectorAll(".vote_counter").forEach(i => i.innerHTML = "Проголосовало: " + data.votes);
                if (Game.isMaster) return;
                if (Game.movesLength != data.moves) {
                    send({
                        method: "GET",
                        url: environment.game.getpgn,
                        onSuccess: (pgnData: { pgn: string }) => {
                            Game.game = new Chess();
                            if (pgnData.pgn != 'start') {
                                Game.game.load_pgn(pgnData.pgn);
                            }
                            console.log(Game.game.history().length);
                            Game.movesLength = data.moves;
                        }
                    });
                }
            }
        });
    }

    static SavePgn() {
        send({
            method: "GET",
            url: environment.game.savepgn + "?pgn=" + Game.game.pgn() + "&moves=" + Game.game.history().length,
            onError: () => {
                toastr.error("Произошла ошибка. Обновите страницу и попробуйте снова");
            }
        });
    }

    /**Сделать ход (добавить в голосование, либо выполнить ход и сохранить PGN) */
    static Move(from, to) {
        if (Game.isMaster) {
            Game.SavePgn();
            return;
        }

        send({
            method: "GET",
            url: environment.game.vote + "?from=" + from + "&to=" + to + "&moves=" + Game.movesLength,
            onError: () => {
                toastr.warning("Произошла ошибка. Обновите страницу и попробуйте снова (код 4)");
            }
        });
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
     * Количество проголосовавших людей
     */
    public votes: number;
}