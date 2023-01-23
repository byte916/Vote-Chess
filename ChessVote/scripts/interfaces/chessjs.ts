/**Интерфейс для объекта игры chess.js */
export interface IChessJS {
    new(): IChessJS;

    /**
     * Загрузить PGN-строку в игру
     * @param pgn
     */
    load_pgn(pgn: string): void;

    /**
     * Массив списка ходов
     * @param options
     */
    history(options?: historyOptions): string[] | historyResult[];

    /**
     * Сделать ход
     * @param options
     */
    move(options: moveOptions): void;

    /**Вернуть строку FEN для текущей позиции */
    fen(): string;


    /**Вернуть игру в PGN формате */
    pgn(): string;

    /**Возвращает true, если игра закончилась матом,  */
    game_over(): boolean;

    /**Возвращает чья очередь хода */
    turn(): 'w' | 'b';

    /** Отменить последний полуход. Возвращает отменённый ход, если отмена удалась, Null если нет */
    undo(): historyResult;
}

/**Параметры получения истории */
export class historyOptions {
    /** Если true, то возвращается подробная история, если false, то просто список ходов */
    verbose: boolean;
}

/**
 * История ходов
 * https://github.com/jhlywa/chess.js/tree/v0.12.1#history-options-
 */
export class historyResult {
    /** Цвет игрока */
    public color: 'w' | 'b';
    /** Исходная клетка */
    public from: string;
    /** Целевая клетка */
    public to: string;
    public flags: string;
    public piece: string;
    public captured ?: string;
    public san: string;
}

/**
 * https://github.com/jhlywa/chess.js/tree/v0.12.1#movemove--options-
 */
export class moveOptions {
    public from: string;
    public to: string;
    /** Если происходит превращение пешки, то в какую фигуру она превратится */
    public promotion?: 'q';
}