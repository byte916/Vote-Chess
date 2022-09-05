namespace ChessVote.CvDb
{
    public class Game
    {
        /// <summary> Ид игры </summary>
        public int Id { get; set; }

        /// <summary> Создатель игры </summary>
        public string CreatorName { get; set; }

        public User Creator { get; set; }

        /// <summary> Игра в процессе </summary>
        public bool IsInProgress { get; set; }

        /// <summary> Список участников игры </summary>
        public List<User> Participants { get; set; }
        
        /// <summary> PGN игры </summary>
        public string PGN { get; set; }
    }
}