﻿export var environment = {
    gameList: {
        get: 'gamelist/get'
    },
    game: {
        create: 'game/create',
        join: 'game/join',
        rejoin: 'game/rejoin',
        check: 'game/check',
        exit: 'game/exit',

        savepgn: 'game/savepgn',
        /**
         * Получить PGN (при возобновлении своей игры или при выполнении хода)
         */
        getpgn: 'game/getpgn',

        finishvote: 'game/finishvote',
        vote: 'game/vote',
        undovote: 'game/undovote',
        /**
         * Получить последний отданный голос (после обновления страницы)
         */
        restorevote: 'game/restorevote'
    }
}