namespace ChessVote.CvDb
{
    /// <summary> Таблица с голосованием </summary>
    public class Vote
    {
        /// <summary>  Ид игры </summary>
        public int GameId { get; set; }

        /// <summary> Имя голосующего </summary>
        public string UserName { get; set; }

        /// <summary> Номер хода </summary>
        public int Move { get; set; }

        /// <summary> Ход откуда </summary>
        public string From { get; set; }

        /// <summary> Ход куда </summary>
        public string To { get; set; }

        /// <summary> Было ли голосование за сдачу </summary>
        public bool GiveUp { get; set; }

        /// <summary> Было ли голосование за ничью </summary>
        public bool Draw { get; set; }

        public Game Game { get; set; }

        public User User { get; set; }
    }
}
