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
        public StateModel GetState(string name)
        {
            var result = new StateModel();
            var currentGame = _db.Games.FirstOrDefault(g => g.CreatorName == name && g.IsInProgress);
            if (currentGame != null)
            {
                result.State = GameStatus.Owner;
                result.Color = currentGame.Color == "black" ? "b" : "w";
                return result;
            }
            var currentUser = _db.Users.Include(u=>u.Game).FirstOrDefault(u => u.Name == name);
            if (currentUser != null && currentUser.GameId != null && currentUser.Game.IsInProgress)
            {
                result.State = GameStatus.Joined;
                result.Color = currentUser.Game.Color == "black" ? "w" : "b";
                return result;
            }

            result.State = GameStatus.None;
            return result;
        }

        /// <summary> Получить информацию об игре </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        public CheckModel CheckGame(string name)
        {
            var result = new CheckModel();

            var currentGame = _db.Games.Include(g => g.Votes)
                .Include(g => g.Participants)
                .FirstOrDefault(g => g.CreatorName == name && g.IsInProgress);


            // Обновляем время последнего посещения
            var user = _db.Users.FirstOrDefault(u => u.Name == name);
            if (user != null)
            {
                user.Online = DateTime.Now;
                _db.SaveChanges();
            }

            if (currentGame != null)
            {
                result.status = GameStatus.Owner;
                result.moves = currentGame.Moves;
                result.votes = currentGame.Votes.Where(v => v.Move == result.moves).Select(v=>v.UserName).ToList();
                result.online = currentGame.Participants.Where(p => p.Online > DateTime.Now.AddSeconds(-5)).Select(p => p.Name).ToList();
            }
            else
            {
                var currentUser = _db.Users.Include(u => u.Game)
                    .Include(u => u.Game.Votes)
                    .Include(u => u.Game.Participants)
                    .FirstOrDefault(u => u.Name == name);

                if (currentUser != null && currentUser.GameId != null && currentUser.Game.IsInProgress)
                {
                    result.status = GameStatus.Joined;
                    result.moves = currentUser.Game.Moves;
                    result.votes = currentUser.Game.Votes.Where(v => v.Move == result.moves).Select(v => v.UserName).ToList();
                    result.online = currentUser.Game.Participants.Where(g=>g.Online > DateTime.Now.AddSeconds(-5)).Select(p=>p.Name).ToList();
                }
                else
                {
                    result.status = GameStatus.None;
                }
            }

            result.online.RemoveAll(o => result.votes.IndexOf(o) != -1);

            return result;
        }

        public List<string> GetGameList()
        {
            return _db.Games.Where(g => g.IsInProgress).Select(g => g.CreatorName).ToList();
        }

        public void Create(string name, string color)
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
                PGN = "start",
                Color = color == "b" ? "black" : "white"
            };
            _db.Games.Add(currentGame);
            _db.SaveChanges();
        }

        /// <summary> Присоединиться к игре </summary>
        /// <param name="targetUser">Имя пользователя, к которому необходимо подключиться</param>
        /// <param name="currentUser">Имя текущего пользователя</param>
        public JoinModel? Join(string targetUser,string currentUser )
        {
            var result = new JoinModel();
            var game = _db.Games.Include(g=>g.Participants).FirstOrDefault(g => g.IsInProgress && g.CreatorName == targetUser);
            if (game == null) return null;
            if (game.Participants.Any(p => p.Name == currentUser))
            {
                result = new JoinModel()
                {
                    pgn = game.PGN,
                    color = game.Color == "black" ? "white" : "black"
                };
                return result;
            }
            var current = _db.Users.Find(currentUser);
            if (current == null) return null;
            game.Participants.Add(current);
            _db.SaveChanges();

            result = new JoinModel()
            {
                pgn = game.PGN,
                color = game.Color == "black" ? "white" : "black"
            };
            return result;
        }

        /// <summary> Подключиться PGN игры, к которой присоединён игрок (после перезагрузки страницы, например) </summary>
        /// <param name="currentUser"></param>
        /// <returns></returns>
        public JoinModel? ReJoin(string currentUser)
        {
            var game = _db.Users.Include(u=>u.Game).FirstOrDefault(u=>u.Name == currentUser)?.Game;
            if (game == null) return null;
            return new JoinModel()
            {
                pgn = game.PGN,
                color = game.Color == "black" ? "white" : "black"
            };
        }

        public bool SavePgn(string username, string pgn, int moves)
        {
            var game = _db.Games.FirstOrDefault(g => g.IsInProgress && g.CreatorName == username);
            if (game == null) return false;
            game.PGN = pgn;
            game.Moves = moves;
            _db.SaveChanges();
            return true;
        }
        
        public string? GetPgn(string username)
        {
            var game = _db.Games.FirstOrDefault(g => g.IsInProgress && g.CreatorName == username);
            if (game == null) game = _db.Users.Include(u => u.Game).FirstOrDefault(u => u.Name == username)?.Game;
            return game?.PGN;
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

        public bool Vote(string name, string from, string to, int move)
        {
            var user = _db.Users.Include(u => u.Game).Include(u => u.Votes).FirstOrDefault(u=>u.Name == name);
            if (user == null) return false;
            if (user.GameId == null) return false;
            var vote = user.Votes.FirstOrDefault(v => v.GameId == user.GameId && v.Move == move);
            if (vote == null)
            {
                vote = new Vote();
                vote.GameId = user.GameId.Value;
                vote.UserName = name;
                vote.Move = move;
                user.Votes.Add(vote);
            }
            
            vote.From = from;
            vote.To = to;

            _db.SaveChanges();
            return true;
        }

        public RestoreVoteModel? RestoreVote(string name)
        {
            var user = _db.Users.Include(u => u.Game).Include(u => u.Votes).FirstOrDefault(u => u.Name == name);
            if (user == null) return null;
            if (user.GameId == null) return null;
            return user.Votes.Where(v => v.GameId == user.GameId)
                .OrderByDescending(v => v.Move).Take(1)
                .Select(v => new RestoreVoteModel()
                {
                    from = v.From,
                    to = v.To,
                    moves = v.Move
                }).FirstOrDefault();
        }

        public FinishVoteModel FinishVote(string name)
        {
            var game = _db.Games.Include(g => g.Votes).FirstOrDefault(g => g.CreatorName == name && g.IsInProgress);
            if (game == null) throw new Exception();
            var votes = game.Votes.Where(v=>v.Move == game.Moves).ToList();
            if (!votes.Any()) return new FinishVoteModel(){result = ""};
            var groupedVotes = votes.GroupBy(v => new { v.From, v.To },
                (move, moves) => new { count = moves.Count(), from = move.From, to = move.To }).ToList();
            var maxVotes = groupedVotes.Where(g => g.count == groupedVotes.Max(v => v.count)).ToList();
            if (maxVotes.Count > 1)
            {
                return new FinishVoteModel() { result = "" };
            }

            var percent = (maxVotes[0].count / votes.Count) * 100;
            return new FinishVoteModel() { result = percent + "%", from = maxVotes[0].from, to = maxVotes[0].to };
        }

        public bool UndoVote(string name)
        {
            var user = _db.Users.Include(u => u.Game).Include(u => u.Votes).FirstOrDefault(u => u.Name == name);
            if (user == null) return false;
            var vote = user.Votes.FirstOrDefault(v => v.GameId == user.GameId && v.Move == user.Game.Moves);
            if (vote == null) return false;
            _db.Entry(vote).State = EntityState.Deleted;
            _db.SaveChanges();
            return true;
        }
    }
}