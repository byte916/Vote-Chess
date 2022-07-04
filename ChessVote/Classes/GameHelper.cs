using ChessVote.CvDb;

namespace ChessVote.Classes
{
    public class GameHelper
    {
        private CvDbContext _db;
        public GameHelper(CvDbContext context)
        {
            _db = context;
        }

        public int GetState(string name)
        {
            var currentGame = _db.Games.FirstOrDefault(g => g.CreatorName == name && g.IsInProgress);
            return currentGame == null ? 0 : 1;
        }

        public List<string> GetGameList()
        {
            return _db.Games.Where(g => g.IsInProgress).Select(g => g.CreatorName).ToList();
        }

        public void Create(string name)
        {
            var currentGame = _db.Games.FirstOrDefault(g => g.CreatorName == name && g.IsInProgress);
            if (currentGame != null)
            {
                return;
            }

            currentGame = new Game()
            {
                CreatorName = name,
                IsInProgress = true,
            };
            _db.Games.Add(currentGame);
            _db.SaveChanges();
        }

        public void Exit(string name)
        {
            var currentGame = _db.Games.FirstOrDefault(g => g.CreatorName == name && g.IsInProgress);
            if (currentGame == null)
            {
                return;
            }
            currentGame.IsInProgress = false;
            _db.SaveChanges();
        }
    }
}
