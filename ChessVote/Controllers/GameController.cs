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

        public ActionResult SavePgn(string? pgn)
        {
            pgn ??= "start";
            var userName = new UserHelper(HttpContext, _db).GetUser.Name;
            if (new GameHelper(_db).SavePgn(userName, pgn)) return new StatusCodeResult(200);
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
    }
}