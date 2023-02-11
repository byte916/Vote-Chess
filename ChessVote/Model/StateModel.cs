using ChessVote.Enums;

namespace ChessVote.Model
{
    public class StateModel
    {
        /// <summary>
        /// Состояние игрока
        /// </summary>
        public PlayerStatus State { get; set; }
        /// <summary>
        /// Цвет игрока
        /// </summary>
        public string Color { get; set; }
    }
}