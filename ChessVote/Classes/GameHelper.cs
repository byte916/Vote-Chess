using ChessVote.CvDb;
using ChessVote.Enums;
using ChessVote.Model;
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
        /// Получить состояние игры для указанного пользователя
        /// </summary>
        /// <param name="name">Имя текущего пользователя</param>
        /// <returns></returns>
        public GameStatus GetState(string name)
        {
            var currentGame = _db.Games.FirstOrDefault(g => g.CreatorName == name && g.IsInProgress);
            if (currentGame != null) return GameStatus.Owner;
            var currentUser = _db.Users.Include(u=>u.Game).FirstOrDefault(u => u.Name == name);
            if (currentUser != null && currentUser.GameId != null && currentUser.Game.IsInProgress) return GameStatus.Joined;
            return GameStatus.None;
        }

        /// <summary> Получить информацию об игре </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        public CheckModel CheckGame(string name)
        {
            var result = new CheckModel();

            var currentGame = _db.Games.FirstOrDefault(g => g.CreatorName == name && g.IsInProgress);
            if (currentGame != null) result.status = GameStatus.Owner;
            else
            {
                var currentUser = _db.Users.Include(u => u.Game).FirstOrDefault(u => u.Name == name);
                if (currentUser != null && currentUser.GameId != null && currentUser.Game.IsInProgress)
                {
                    result.status = GameStatus.Joined;
                }
                else
                {
                    result.status = GameStatus.None;
                }
            }

            return result;
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
                PGN = "start"
            };
            _db.Games.Add(currentGame);
            _db.SaveChanges();
        }

        /// <summary> Присоединиться к игре </summary>
        /// <param name="targetUser">Имя пользователя, к которому необходимо подключиться</param>
        /// <param name="currentUser">Имя текущего пользователя</param>
        public string? Join(string targetUser,string currentUser )
        {
            var game = _db.Games.Include(g=>g.Participants).FirstOrDefault(g => g.IsInProgress && g.CreatorName == targetUser);
            if (game == null) return null;
            if (game.Participants.Any(p=>p.Name == currentUser)) return game.PGN;
            var current = _db.Users.Find(currentUser);
            if (current == null) return null;
            game.Participants.Add(current);
            _db.SaveChanges();
            return game.PGN;
        }

        /// <summary> Подключиться PGN игры, к которой присоединён игрок (после перезагрузки страницы, например) </summary>
        /// <param name="currentUser"></param>
        /// <returns></returns>
        public string? ReJoin(string currentUser)
        {
            var game = _db.Users.Include(u=>u.Game).FirstOrDefault(u=>u.Name == currentUser)?.Game;
            return game?.PGN;
        }

        public bool SavePgn(string username, string pgn)
        {
            var game = _db.Games.FirstOrDefault(g => g.IsInProgress && g.CreatorName == username);
            if (game == null) return false;
            game.PGN = pgn;
            _db.SaveChanges();
            return true;
        }

        public string? GetPgn(string username)
        {
            var game = _db.Games.FirstOrDefault(g => g.IsInProgress && g.CreatorName == username);
            if (game == null) return null;
            return game.PGN;
        }

        public void Exit(string name)
        {
            var currentGame = _db.Games.Include(g=>g.Participants).FirstOrDefault(g => g.CreatorName == name && g.IsInProgress);
            if (currentGame != null)
            {
                currentGame.IsInProgress = false;
                foreach (var currentGameParticipant in currentGame.Participants)
                {
                    currentGameParticipant.GameId = null;
                }
            }
            else
            {
                var currentUser = _db.Users.Include(u => u.Game).FirstOrDefault(u => u.Name == name);
                if (currentUser == null) return;
                if (currentUser.GameId == null) return;
                currentUser.GameId = null;
            }

            _db.SaveChanges();
        }
    }
}
