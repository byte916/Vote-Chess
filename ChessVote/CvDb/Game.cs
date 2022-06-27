namespace ChessVote.CvDb
{
    public class Game
    {
        /// <summary> Ид игры </summary>
        public int Id { get; set; }

        /// <summary> Создатель игры </summary>
        public string CreatorName { get; set; }

        public User Creator { get; set; }
    }
}