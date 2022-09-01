using ChessVote.CvDb;
using Microsoft.EntityFrameworkCore;

namespace ChessVote.Classes
{
    public class GameHelper
    {
        private CvDbContext _db;
        public GameHelper(CvDbContext context)
        {
            _db = context;
        }

        /// <summary>
        /// Получить состояние игры для текущего пользователя
        /// </summary>
        /// <param name="name">Имя текущего пользователя</param>
        /// <returns></returns>
        public int GetState(string name)
        {
            var currentGame = _db.Games.FirstOrDefault(g => g.CreatorName == name && g.IsInProgress);
            if (currentGame != null) return 1;
            var currentUser = _db.Users.Include(u=>u.Game).FirstOrDefault(u => u.Name == name);
            if (currentUser != null && currentUser.GameId != null && currentUser.Game.IsInProgress) return 2;
            return 0;
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

        /// <summary> Присоединиться к игре </summary>
        /// <param name="targetUser">Имя пользователя, к которому необходимо подключиться</param>
        /// <param name="currentUser">Имя текущего пользователя</param>
        public bool Join(string targetUser,string currentUser )
        {
            var game = _db.Games.Include(g=>g.Participants).FirstOrDefault(g => g.IsInProgress && g.CreatorName == targetUser);
            if (game == null) return false;
            if (game.Participants.Any(p=>p.Name == currentUser)) return true;
            var current = _db.Users.Find(currentUser);
            if (current == null) return false;
            game.Participants.Add(current);
            _db.SaveChanges();
            return true;
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
