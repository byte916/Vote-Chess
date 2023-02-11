namespace ChessVote.Enums
{
    /// <summary> Состояние игрока </summary>
    public enum PlayerStatus: int
    {
        /// <summary> Не подключен к действующей игре </summary>
        None = 0,
        /// <summary> Владелец игры </summary>
        Owner = 1,
        /// <summary> Присоединен к игре </summary>
        Joined = 2
    }
}