using System.Net;
using ChessVote.Classes;
using ChessVote.CvDb;
using Microsoft.AspNetCore.Mvc;

namespace ChessVote.Controllers
{
    public class GameController : Controller
    {
        private CvDbContext _db;
        public GameController(CvDbContext context)
        {
            _db = context;
        }
        
        public ActionResult Create()
        {
            var userName = new UserHelper(HttpContext, _db).GetUser.Name;
            new GameHelper(_db).Create(userName);
            return new StatusCodeResult(200);
        }

        /// <summary> Получить данные по игре </summary>
        /// <returns></returns>
        public JsonResult Check()
        {
            var userName = new UserHelper(HttpContext, _db).GetUser.Name;
            return new JsonResult(new GameHelper(_db).CheckGame(userName));
        }

        public ActionResult Join(string id)
        {
            var userName = new UserHelper(HttpContext, _db).GetUser.Name;
            var pgn = new GameHelper(_db).Join(id, userName);
            if (pgn == null)
            {
                return new StatusCodeResult(500);
            }

            return new JsonResult(new { pgn = pgn });
        }

        public ActionResult ReJoin()
        {
            var userName = new UserHelper(HttpContext, _db).GetUser.Name;
            var pgn = new GameHelper(_db).ReJoin(userName);
            if (pgn == null)
            {
                return new StatusCodeResult(500);
            }

            return new JsonResult(new { pgn = pgn });
        }

        public ActionResult Exit()
        {
            var userName = new UserHelper(HttpContext, _db).GetUser.Name;
            new GameHelper(_db).Exit(userName);
            return new StatusCodeResult(200);
        }

        public ActionResult SavePgn(string? pgn, int? moves)
        {
            pgn ??= "start";
            var userName = new UserHelper(HttpContext, _db).GetUser.Name;
            if (new GameHelper(_db).SavePgn(userName, pgn, moves.GetValueOrDefault(0))) return new StatusCodeResult(200);
            return new StatusCodeResult(500);
        }

        /// <summary>
        /// Возвращает PGN (Для возобновления своей игры)
        /// </summary>
        /// <returns></returns>
        public ActionResult GetPgn()
        {
            var userName = new UserHelper(HttpContext, _db).GetUser.Name;
            var pgn = new GameHelper(_db).GetPgn(userName);
            if (pgn == null)
            {
                return new StatusCodeResult(500);
            }

            return new JsonResult(new { pgn = pgn });
        }

        /// <summary> Проголосовать за ход </summary>
        /// <param name="from"></param>
        /// <param name="to"></param>
        /// <param name="moves"></param>
        /// <returns></returns>
        public ActionResult Vote(string from, string to, int moves)
        {
            var userName = new UserHelper(HttpContext, _db).GetUser.Name;
            if (new GameHelper(_db).Vote(userName, from, to, moves))
            {
                return StatusCode(200);
            }

            return StatusCode(500);
        }

        public ActionResult RestoreVote()
        {
            var userName = new UserHelper(HttpContext, _db).GetUser.Name;
            var result = new GameHelper(_db).RestoreVote(userName);
            return new JsonResult(result);
        }

        public ActionResult FinishVote()
        {
            var userName = new UserHelper(HttpContext, _db).GetUser.Name;
            var result = new GameHelper(_db).FinishVote(userName);

            return new JsonResult(result);
        }

        public ActionResult UndoVote()
        {
            var userName = new UserHelper(HttpContext, _db).GetUser.Name;
            var result = new GameHelper(_db).UndoVote(userName);
            if (result) return Ok();
            return StatusCode(500);
        }
    }
}