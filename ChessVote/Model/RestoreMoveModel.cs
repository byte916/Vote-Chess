namespace ChessVote.Model
{
    public class RestoreVoteModel
    {
        public string from { get; set; }

        public string to { get; set; }

        public int moves { get; set; }

        public bool giveup { get; set; }
    }
}
