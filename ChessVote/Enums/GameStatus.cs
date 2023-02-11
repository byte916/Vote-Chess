namespace ChessVote.Enums
{
    public enum GameStatus: int
    {
        InProgress = 0,
        WhiteWin = 1,
        BlackWin = 2,
        Draw = 3,
        /// <summary>
        /// Прекращена по решению создателя
        /// </summary>
        Aborted = 4
    }
}
