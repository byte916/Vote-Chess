using ChessVote.Enums;

namespace ChessVote.Model
{
    public class CheckModel
    {
        /// <summary> Состояние игрока </summary>
        public PlayerStatus status { get; set; }

        /// <summary> Состояние игры </summary>
        public GameStatus game { get; set; }

        /// <summary> Количество сделанных ходов в игре </summary>
        public int moves { get; set; }

        /// <summary> Список проголосовавших людей </summary>
        public List<string> votes { get; set; }

        /// <summary> Список людей онлайн, которые не проголосовали </summary>
        public List<string> online { get; set; }
    }
}
