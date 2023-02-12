using ChessVote.CvDb;
using ChessVote.Enums;
using ChessVote.Model;
using Microsoft.EntityFrameworkCore;

namespace ChessVote.Classes
{
    public class GameHelper
    {
        private CvDbContext _db;

        private HttpContext _httpContext;

        private string _userName;

        public GameHelper(HttpContext httpContext, CvDbContext dbContext)
        {
            _db = dbContext;
            _httpContext = httpContext;
        }

        /// <summary>
        /// Получить имя текущего игрока
        /// </summary>
        /// <returns></returns>
        private string UserName()
        {
            if (_userName== null)
            {
                _userName = new UserHelper(_httpContext, _db).GetUser.Name;
            }
            return _userName;
        }

        /// <summary>
        /// Получить состояние игры для указанного пользователя
        /// </summary>
        /// <param name="name">Имя текущего пользователя</param>
        /// <returns></returns>
        public StateModel GetState()
        {
            var name = UserName();
            var result = new StateModel();
            var currentGame = _db.Games.FirstOrDefault(g => g.CreatorName == name && g.State == GameStatus.InProgress);
            if (currentGame != null)
            {
                result.State = PlayerStatus.Owner;
                result.Color = currentGame.Color;
                return result;
            }
            var currentUser = _db.Users.Include(u=>u.Game).FirstOrDefault(u => u.Name == name);
            if (currentUser != null && currentUser.GameId != null && currentUser.Game.State == GameStatus.InProgress)
            {
                result.State = PlayerStatus.Joined;
                result.Color = currentUser.Game.Color;
                return result;
            }

            result.State = PlayerStatus.None;
            return result;
        }

        /// <summary> Получить информацию об игре </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        public CheckModel CheckGame()
        {
            var name = UserName();
            var result = new CheckModel();

            var currentGame = _db.Games.Include(g => g.Votes)
                .Include(g => g.Participants)
                .FirstOrDefault(g => g.CreatorName == name && g.State == GameStatus.InProgress);

            // Обновляем время последнего посещения
            var user = _db.Users.FirstOrDefault(u => u.Name == name);
            if (user != null)
            {
                user.Online = DateTime.Now;
                _db.SaveChanges();
            }

            if (currentGame != null)
            {
                result.status = PlayerStatus.Owner;
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

                if (currentUser != null && currentUser.Game != null && currentUser.Game.State != GameStatus.Aborted)
                {
                    result.status = PlayerStatus.Joined;
                    result.game = currentUser.Game.State;
                    result.moves = currentUser.Game.Moves;
                    result.votes = currentUser.Game.Votes.Where(v => v.Move == result.moves).Select(v => v.UserName).ToList();
                    result.online = currentUser.Game.Participants.Where(g=>g.Online > DateTime.Now.AddSeconds(-5)).Select(p=>p.Name).ToList();
                }
                else
                {
                    result.status = PlayerStatus.None;
                }
            }
            if (result.status == PlayerStatus.None) return result;

            result.online.RemoveAll(o => result.votes.IndexOf(o) != -1);

            return result;
        }

        public List<string> GetGameList()
        {
            return _db.Games.Where(g => g.State == GameStatus.InProgress).Select(g => g.CreatorName).ToList();
        }

        public void Create(string color)
        {
            var name = UserName();
            var currentGame = _db.Games.FirstOrDefault(g => g.CreatorName == name && g.State == GameStatus.InProgress);
            if (currentGame != null)
            {
                return;
            }

            currentGame = new Game()
            {
                CreatorName = name,
                State = GameStatus.InProgress,
                PGN = "start",
                Color = color
            };
            _db.Games.Add(currentGame);
            _db.SaveChanges();
        }

        /// <summary> Присоединиться к игре </summary>
        /// <param name="targetUser">Имя пользователя, к которому необходимо подключиться</param>
        /// <param name="currentUser">Имя текущего пользователя</param>
        public JoinModel? Join(string targetUser)
        {
            var currentUser = UserName();
            var result = new JoinModel();
            var game = _db.Games.Include(g=>g.Participants).FirstOrDefault(g => g.State == GameStatus.InProgress && g.CreatorName == targetUser);
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
        public JoinModel? ReJoin()
        {
            var currentUser = UserName();
            var game = _db.Users.Include(u=>u.Game).FirstOrDefault(u=>u.Name == currentUser)?.Game;
            if (game == null) return null;
            return new JoinModel()
            {
                pgn = game.PGN,
                color = game.Color == "black" ? "white" : "black"
            };
        }

        /// <summary>
        /// Сохранить PGN (после сделанного хода)
        /// </summary>
        /// <param name="pgn"></param>
        /// <param name="moves"></param>
        /// <returns></returns>
        public bool SavePgn(string pgn, int moves)
        {
            var username = UserName();
            var game = _db.Games.FirstOrDefault(g => g.State == GameStatus.InProgress && g.CreatorName == username);
            if (game == null) return false;
            game.PGN = pgn;
            game.Moves = moves;
            game.VotersOfferedDraw = false;
            _db.SaveChanges();
            return true;
        }
        
        public string? GetPgn()
        {
            var username = UserName();
            var game = _db.Games.FirstOrDefault(g => g.State == GameStatus.InProgress && g.CreatorName == username);
            if (game == null) game = _db.Users.Include(u => u.Game).FirstOrDefault(u => u.Name == username)?.Game;
            return game?.PGN;
        }

        public void Exit()
        {
            var name = UserName();
            var currentGame = _db.Games.Include(g=>g.Participants).FirstOrDefault(g => g.CreatorName == name && g.State == GameStatus.InProgress);
            if (currentGame != null)
            {
                currentGame.State = GameStatus.Aborted;
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

        public bool Vote(string from, string to, int move)
        {
            var name = UserName();
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

            vote.GiveUp = false;
            vote.From = from;
            vote.To = to;

            _db.SaveChanges();
            return true;
        }

        public RestoreVoteModel? RestoreVote()
        {
            var name = UserName();
            var user = _db.Users.Include(u => u.Game).Include(u => u.Votes).FirstOrDefault(u => u.Name == name);
            if (user == null) return null;
            if (user.GameId == null) return null;
            return user.Votes.Where(v => v.GameId == user.GameId)
                .OrderByDescending(v => v.Move).Take(1)
                .Select(v => new RestoreVoteModel()
                {
                    from = v.From,
                    to = v.To,
                    moves = v.Move,
                    giveup = v.GiveUp
                }).FirstOrDefault();
        }

        /// <summary>
        /// Закончить голосование
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        public FinishVoteModel FinishVote()
        {
            var name = UserName();
            var game = _db.Games.Include(g => g.Votes).FirstOrDefault(g => g.CreatorName == name && g.State == GameStatus.InProgress);
            if (game == null) throw new Exception();
            var votes = game.Votes.Where(v=>v.Move == game.Moves).ToList();
            if (!votes.Any())
            {
                return new FinishVoteModel() { result = "" };
            }

            // Если большинство проголосовали за сдачу, то возвращаем этот результат
            var isGiveUp = votes.Count(v => v.GiveUp == true) > votes.Count(v => v.GiveUp == false);
            if (isGiveUp)
            {
                game.State = game.Color == "white" ? GameStatus.WhiteWin : GameStatus.BlackWin;
                _db.SaveChanges();
                return new FinishVoteModel() { isGiveUp = true };
            }

            var isDraw = votes.Count(v => v.Draw == true) > votes.Count(v => v.Draw == false);
            // Если большинство проголосовали за ничью и в игре была предложена ничья, то завершаем игру ничьей
            if (isDraw && game.CreatorOfferedDraw)
            {
                game.State = GameStatus.Draw;
                foreach (var currentGameParticipant in game.Participants)
                {
                    currentGameParticipant.GameId = null;
                }
                _db.SaveChanges();
                return new FinishVoteModel { isDraw= true };
            }

            // Если нет ни одного хода с движением фигур
            if (!votes.Any(v=>v.From != "" && v.To != ""))
            {
                return new FinishVoteModel() { result = "" };
            }

            var groupedVotes = votes.Where(v => v.From != "" && v.To != "").GroupBy(v => new { v.From, v.To },
                (move, moves) => new { count = moves.Count(), from = move.From, to = move.To }).ToList();
            var maxVotes = groupedVotes.Where(g => g.count == groupedVotes.Max(v => v.count)).ToList();
            if (maxVotes.Count > 1)
            {
                return new FinishVoteModel() { result = "" };
            }
            // Если голосованием предложена ничья а в игре не предложена, сохраняем
            if (isDraw && !game.CreatorOfferedDraw)
            {
                game.VotersOfferedDraw = true;
                _db.SaveChanges();
            }
            // Если была предложена ничья, но голосованием ничья не предложена, то стираем сохраненное состояние
            if (!isDraw && game.CreatorOfferedDraw)
            {
                game.CreatorOfferedDraw = false;
                _db.SaveChanges();
            }

            var percent = (maxVotes[0].count / votes.Count) * 100;
            return new FinishVoteModel() { result = percent + "%", from = maxVotes[0].from, to = maxVotes[0].to, isDraw = isDraw, isGiveUp = isGiveUp };
        }

        public bool UndoVote()
        {
            var name = UserName();
            var user = _db.Users.Include(u => u.Game).Include(u => u.Votes).FirstOrDefault(u => u.Name == name);
            if (user == null) return false;
            var vote = user.Votes.FirstOrDefault(v => v.GameId == user.GameId && v.Move == user.Game.Moves);
            if (vote == null) return false;
            _db.Entry(vote).State = EntityState.Deleted;
            _db.SaveChanges();
            return true;
        }

        public bool VoteGiveUp(int move)
        {
            var name = UserName();
            var user = _db.Users.Include(u => u.Game).Include(u => u.Votes).FirstOrDefault(u => u.Name == name);
            if (user == null) return false;
            if (user.GameId == null) return false;
            var vote = user.Votes.FirstOrDefault(v => v.GameId == user.GameId && v.Move == move);
            // Если у нас есть голос, то убираем его и отмечаем что сдаемся
            if (vote == null)
            {
                vote = new Vote();
                vote.GameId = user.GameId.Value;
                vote.Move = move;
                vote.From = "";
                vote.To = "";
                vote.UserName = name;
                vote.GiveUp = true;
                user.Votes.Add(vote);
                _db.SaveChanges();
                return true;
            }

            if (vote.GiveUp== true)
            {
                user.Votes.Remove(vote); 
                _db.SaveChanges(); 
                return false;
            }

            if (vote.GiveUp == false)
            {
                vote.From = "";
                vote.To = "";
                vote.GiveUp = true;
                _db.SaveChanges();
                return true;
            }
            return false;
        }

        /// <summary>
        /// Сдаться (создатель игры
        /// </summary>
        /// <returns></returns>
        public bool GiveUp()
        {
            var name = UserName();
            var game = _db.Games.FirstOrDefault(g => g.CreatorName == name && g.State == GameStatus.InProgress);
            if (game == null) return false;
            game.State = game.Color == "white" ? GameStatus.BlackWin : GameStatus.WhiteWin;
            _db.SaveChanges();
            return true;
        }

        /// <summary>
        /// Предложить ничью (создатель игры)
        /// </summary>
        /// <returns>
        /// </returns>
        public bool OfferDraw()
        {
            var name = UserName();
            var game = _db.Games
                .Include(g => g.Participants)
                .FirstOrDefault(g => g.CreatorName == name && g.State == GameStatus.InProgress);
            if (game == null) return false;
            if (game.VotersOfferedDraw == true)
            {
                game.State = GameStatus.Draw;
                foreach (var currentGameParticipant in game.Participants)
                {
                    currentGameParticipant.GameId = null;
                }
                _db.SaveChanges();
                return true;
            }
            game.CreatorOfferedDraw = !game.CreatorOfferedDraw;

            return game.CreatorOfferedDraw;
        }

        public bool VoteDraw(int move)
        {
            var name = UserName();
            var user = _db.Users.Include(u => u.Game).Include(u => u.Votes).FirstOrDefault(u => u.Name == name);
            if (user == null) return false;
            if (user.GameId == null) return false;
            var vote = user.Votes.FirstOrDefault(v => v.GameId == user.GameId && v.Move == move);
            if (vote == null)
            {
                vote = new Vote();
                vote.GameId = user.GameId.Value;
                vote.Move = move;
                vote.From = "";
                vote.To = "";
                vote.UserName = name;
                user.Votes.Add(vote);
            }
            vote.Draw = !vote.Draw;
            _db.SaveChanges();
            return vote.Draw;
        }
    }
}