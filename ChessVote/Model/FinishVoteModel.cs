namespace ChessVote.Model
{
    public class FinishVoteModel
    {
        public string result { get; set; }
        public string from { get; set; }
        public string to { get; set; }

        /// <summary>
        /// Большинство проголосовали за ничью
        /// </summary>
        public bool isDraw { get; set; }

        /// <summary>
        /// Большинство проголосовали сдаться
        /// </summary>
        public bool isGiveUp { get; set; }
    }
}
