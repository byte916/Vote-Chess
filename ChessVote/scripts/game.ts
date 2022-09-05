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


    /**Создать игру */
    public static start() {
        Game.userColor = 'white';
        Game.game = new Chess();
        Game.SavePgn();
        Board.init("board-master");
    }

    /**Продолжить собственную игру */
    public static continue() {
        Game.userColor = 'white';

        send({
            method: "GET",
            url: environment.game.getpgn,
            onSuccess: (data: { pgn: string }) => {
                if (data.pgn == 'start') {
                    Game.game = new Chess();
                } else {
                    Game.game = new Chess(data.pgn);
                }
                Board.init("board-master");
            }
        });
    }

    /**Присоединиться к игре */
    public static join(pgn: string) {
        if (Game.getGameStatTimer != null) return;
        Game.getGameStatTimer = setInterval(Game.getGameState, 1000);
        
        Game.userColor = 'black';
        if (pgn == 'start') Game.game = new Chess();
        else Game.game = new Chess(pgn);
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
                }
            }
        });
    }

    static SavePgn() {
        send({
            method: "GET",
            url: environment.game.savepgn + "?pgn=" + Game.game.pgn(),
            onError: () => {
                toastr.error("Произошла ошибка. Обновите страницу и попробуйте снова");
            }
        });
    }

    /**Сделать ход (добавить в голосование, либо выполнить ход и сохранить PGN) */
    static Move(from, to) {

    }
}

export class Board {
    public static board;

    static init(htmlElementId: string) {
        console.log(htmlElementId, {
            position: Game.game.fen(),
            orientation: Game.userColor,
            draggable: true,
            onDragStart: Board.onDragStart,
            onDrop: Board.onDrop,
            onSnapEnd: Board.onSnapEnd
        });
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
    public status: number;
}