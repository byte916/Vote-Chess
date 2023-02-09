﻿import { send } from './common';
import { environment } from './environment';
import { onGameExitClick, SwitchScreen } from './main';
import { GameList } from './game-list';
import * as toastr from 'toastr';
import { VotedList } from './components/fillVotedList';
import { historyResult, IChessJS } from './interfaces/chessjs';
import { IChessboardJS } from './interfaces/chessboardjs';
declare var Chessboard: Function;
declare var Fireworks;
const Chess: IChessJS = require('chess.js');

export class Game {
    private static getGameStateTimer = null;

    /** Является ли игрок в игре */
    private static isGameRunning = false;

    // Как часть получать состояние игры (в мс)
    private static checkStateInterval = 300;

    /** Объект текущей игры */
    public static game: IChessJS;

    public static gameIsFinished: boolean = false;

    /** Является ли текущий игрок создателем игры */
    public static isMaster = false;
    private static movesLength;

    /** Является ли текущий ход моим */
    public static isMyTurn = false;
    
    /**Создать игру */
    public static start(color: string) {
        if (Game.isGameRunning) return;
        Game.resetState();
        Game.isGameRunning = true;
        Game.isMaster = true;

        Game.getGameState();
        Game.game = new Chess();
        Game.SavePgn();
        Board.init("board-master", color);
    }

    /**Продолжить собственную игру */
    public static continueGame(color: string) {
        if (Game.isGameRunning) return;
        Game.resetState();
        Game.isGameRunning = true;
        Game.getGameState();

        send({
            method: "GET",
            url: environment.game.getpgn
        }).then((data: { pgn: string }) => {
            Game.game = new Chess();
            if (data.pgn != 'start') {
                Game.game.load_pgn(data.pgn);
            }
            Game.isMaster = true;
            Board.init("board-master", color);
        });
    }

    /**Присоединиться к игре */
    public static join(pgn: string, color: string) {
        if (Game.isGameRunning) return;
        Game.resetState();
        Game.isGameRunning = true;
        Game.getGameState();

        Game.isMaster = false;
        Game.game = new Chess();
        if (pgn != 'start') Game.game.load_pgn(pgn);
        (document.querySelector(".cancelVote") as HTMLElement).style.display = 'none';
        Board.init("board-slave", color);
        Game.RestoreVote();
        Game.movesLength = Game.game.history().length;
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
            Game.UpdateExtraButtons();
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

    /**При подключении сбрасываем состояние, которое могло быть изменено в прошлой игре */
    private static resetState() {
        document.querySelector('#game-slave .giveUpVote').classList.remove('green');
    }

    /**Получить состояние игры */
    public static getGameState() {
        if (!Game.isGameRunning) return;
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

            // Заполняем список проголосовавших людей
            VotedList.Fill(data.votes, data.online, Board.wrapper);

            // У мастера показывать кнопку "Завершить голосование" если есть проголосовавшие
            if (Game.isMaster && data.votes != null && data.votes.length > 0) {
                (document.querySelector(".finishVote") as HTMLElement).style.display = '';
            }
            // Если это мастер, то выходим здесь предварительно установив таймер для слеудющего получения состояния игры
            if (Game.isMaster) {
                Game.getGameStateTimer = setTimeout(Game.getGameState, Game.checkStateInterval);
                return;
            }

            // Если в игре изменилось количество ходов (мастер сделал ход), то получаем 
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
                    Game.UpdateExtraButtons();

                    Game.getGameStateTimer = setTimeout(Game.getGameState, Game.checkStateInterval);
                });
                return;
            }

            Game.getGameStateTimer = setTimeout(Game.getGameState, Game.checkStateInterval);
        });
    }

    public static FinishGame() {
        Game.gameIsFinished = true;
        const body = document.querySelector('body');
        var wrapperBc = document.createElement('div');
        wrapperBc.style.position = 'fixed';
        wrapperBc.style.top = '0px';
        wrapperBc.style.bottom = '0px';
        wrapperBc.style.left = '0px';
        wrapperBc.style.right = '0px';
        wrapperBc.id = 'fireworks-wrapper-bc';
        wrapperBc.style.backgroundColor = '#000';
        wrapperBc.style.opacity = '0.5';
        wrapperBc.style.overflow = 'hidden';
        body.appendChild(wrapperBc);

        var wrapper = document.createElement('div');
        wrapper.style.position = 'fixed';
        wrapper.style.top = '0';
        wrapper.style.bottom = '0';
        wrapper.style.left = '0';
        wrapper.style.right = '0';
        wrapper.id = 'fireworks-wrapper';
        body.appendChild(wrapper);

        var header = document.createElement('div');
        header.style.marginTop = '300px';
        header.style.position = 'fixed';
        header.style.top = '0';
        header.style.bottom = '0';
        header.style.left = '0';
        header.style.right = '0';
        header.style.fontSize = '32px';
        header.style.textAlign = 'center';
        header.textContent = 'ПОБЕДА';
        header.style.textShadow = '#BFB 0px 0px 10px ,#BBF 0px 0px 15px,#FBB 0px 0px 20px,#DFD 0px 0px 30px,#DDF 0px 0px 40px, #FDD 0px 0px 50px';
        body.appendChild(header);
        wrapperBc.addEventListener('click', () => {
            wrapperBc.remove();
            wrapper.remove();
            header.remove();
            Game.exit();
            SwitchScreen.toMain();

            send({
                method: "GET",
                url: environment.game.exit
            }).then(() => {
                GameList.runUpdate();
            });
        });
        header.addEventListener('click', () => {
            wrapperBc.remove();
            wrapper.remove();
            header.remove();
            Game.exit();
            SwitchScreen.toMain();

            send({
                method: "GET",
                url: environment.game.exit
            }).then(() => {
                GameList.runUpdate();
            });
        });
        wrapper.addEventListener('click', () => {
            wrapperBc.remove();
            wrapper.remove();
            header.remove();
            Game.exit();
            SwitchScreen.toMain();

            send({
                method: "GET",
                url: environment.game.exit
            }).then(() => {
                GameList.runUpdate();
            });
        });
        const fireworks = new Fireworks.default(wrapper, {
            opacity: 0.1,
            particles: 120
        });
        fireworks.start();
    }

    /**Сохранить PGN */
    private static SavePgn() {
        send({
            method: "GET",
            url: environment.game.savepgn + "?pgn=" + Game.game.pgn() + "&moves=" + Game.game.history().length
        }).then(() => { }, () => {
            toastr.error("Произошла ошибка. Обновите страницу и попробуйте снова");
        });
    }

    /**Сделать ход (добавить в голосование, либо выполнить ход и сохранить PGN) */
    public static Move(from, to) {
        Board.makeCellsHighlighted();
        if (Game.isMaster) {
            Game.SavePgn();
            (document.querySelector(".finishVote") as HTMLElement).style.display = '';
            Game.UpdateExtraButtons();
            return;
        }

        send({
            method: "GET",
            url: environment.game.vote + "?from=" + from + "&to=" + to + "&moves=" + Game.movesLength
        }).then(
            () => {
                (document.querySelector(".cancelVote") as HTMLElement).style.display = '';
                Game.UpdateExtraButtons();
            },
            () => {
                toastr.warning("Произошла ошибка. Обновите страницу и попробуйте снова (код 4)");
            });
    }

    /**Обновить видимость дополнительных кнопок */
    public static UpdateExtraButtons() {
        if (Game.isMaster) {
            var board = document.querySelector('#game-master');
            var giveUpButton = board.querySelector('.giveUpVote') as HTMLElement;
            var drawButton = board.querySelector('.drawVote') as HTMLElement;

            if (Board.isCanMove()) {
                giveUpButton.style.display = '';
                drawButton.style.display = '';
            } else {
                giveUpButton.style.display = 'none';
                drawButton.style.display = 'none';
            }
        } else {
            var board = document.querySelector('#game-slave');
            var giveUpButton = board.querySelector('.giveUpVote') as HTMLElement;
            var drawButton = board.querySelector('.drawVote') as HTMLElement;

            // Если наша очередь хода и мы можем еще двигаться, то разрешаем проголосовать за сдачу
            if (Board.isCanMove()) {
                giveUpButton.style.display = '';
            } else {
                giveUpButton.style.display = 'none';
            }
            // Если наша очередь хода, то можно проголосовать за ничью (независимо от того, походили или нет)
            if (Board.isCanMove() || (document.querySelector(".cancelVote") as HTMLElement).style.display == '') {
                drawButton.style.display = '';
            } else {
                drawButton.style.display = 'none';
            }
        }
    }

    /**
     * Применить указанный ход и финишировать голосование
     * @param from
     * @param to
     */
    public static FinishVote(from, to) {
        Game.game.move({ from: from, to: to });
        Board.setPosition(Game.game.fen());
        Game.SavePgn();
        (document.querySelector(".finishVote") as HTMLElement).style.display = 'none';
    }

    public static VoteGiveUp() {
        // Мастер сразу завершает игру
        if (Game.isMaster) {
            return;
        }
        send({ method: 'GET', url: environment.game.voteGiveUp + "?moves=" + Game.movesLength })
            .then((result: boolean) => {
                if (result) {
                    document.querySelector('#game-slave .giveUpVote').classList.add('green');
                } else {
                    document.querySelector('#game-slave .giveUpVote').classList.remove('green');
                }
            })
    }
}

/**Игровая доска */
export class Board {
    public static board: IChessboardJS;

    public static wrapper: HTMLDivElement;

    /**
     * Инициализация игровой доски
     * @param htmlElementId id html-элемента, где будет доска
     * @param color цвет - black или white
     */
    public static init(htmlElementId: string, color: string) {
        Board.board = Chessboard(htmlElementId, {
            position: Game.game.fen(),
            orientation: color,
            draggable: true,
            onDragStart: Board.onDragStart,
            onDrop: Board.onDrop,
            onSnapEnd: Board.onSnapEnd
        });
        if (Game.isMaster) {
            Board.wrapper = document.querySelector('#game-master');
        } else {
            Board.wrapper = document.querySelector('#game-slave');
        }
        Board.makeCellsHighlighted();
        Game.UpdateExtraButtons();
    }

    board = null;

    /**
     * Установить позицию на доске из fen
     * @param fen
     */
    public static setPosition(fen: string) {
        Board.board.position(fen);
        Board.makeCellsHighlighted();
        Game.UpdateExtraButtons();
    }
    
    private static onDragStart(source, piece, position, orientation) {
        // do not pick up pieces if the game is over
        if (Game.game.game_over()) return false

        // only pick up pieces for the side to move
        if ((Game.game.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (Game.game.turn() === 'b' && piece.search(/^w/) !== -1)) {
            return false
        }

        if (!Board.isCanMove())
            return false;
    }

    public static isCanMove() {
        return (Game.game.turn() === 'w' && Board.board.orientation() == 'white') ||
            (Game.game.turn() === 'b' && Board.board.orientation() == 'black');
    }

    private static onDrop(source, target) {
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
    private static onSnapEnd() {
        Board.board.position(Game.game.fen());
        Board.makeCellsHighlighted();
        Game.UpdateExtraButtons();
    }

    /**Подсветить последние ходы */
    public static makeCellsHighlighted() {
        var board: HTMLDivElement;
        if (Game.isMaster) {
            board = document.querySelector('#game-master');
        } else {
            board = document.querySelector('#game-slave');
        }

        board.querySelectorAll('.highlight-last-move').forEach(e => e.classList.remove('highlight-last-move'));

        var history = Game.game.history({ verbose: true }) as historyResult[];

        if (history.length > 1) {
            var move = history[history.length - 1];
            board.querySelector('.square-' + move.from).classList.add('highlight-last-move');
            board.querySelector('.square-' + move.to).classList.add('highlight-last-move');
        }
        Game.isMyTurn = Board.isCanMove();
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