using ChessVote.Enums;

namespace ChessVote.Model
{
    public class CheckModel
    {
        /// <summary> Состояние игры </summary>
        public GameStatus status { get; set; }

        /// <summary> Количество сделанных ходов в игре </summary>
        public int moves { get; set; }

        /// <summary> Количество голосов в игре </summary>
        public int votes { get; set; }

        /// <summary> Количество людей Онлайн </summary>
        public int online { get; set; }
    }
}
