namespace ChessVote.CvDb
{
    /// <summary> Пользователь </summary>
    public class User
    {
        /// <summary> Lichess Name </summary>
        public string Name { get; set; }

        /// <summary> Ид игры, к которой присоединился игрок </summary>
        public int? GameId { get; set; }

        /// <summary> Игра, к которой присоединился участник </summary>
        public Game Game { get; set; }

        public List<Vote> Votes { get; set; }

        /// <summary> Время, когда человек был онлайн </summary>
        public DateTime Online { get; set; }
    }
}
