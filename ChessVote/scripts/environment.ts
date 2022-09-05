export var environment = {
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
         * Получить PGN (при возобновлении своей игры)
         */
        getpgn: 'game/getpgn'
    }
}