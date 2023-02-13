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
        
        public ActionResult Create(string color)
        {
            new GameHelper(HttpContext, _db).Create(color);
            return new StatusCodeResult(200);
        }

        /// <summary> Получить данные по игре </summary>
        /// <returns></returns>
        public JsonResult Check()
        {
            return new JsonResult(new GameHelper(HttpContext, _db).CheckGame());
        }

        public ActionResult Join(string id)
        {
            var pgn = new GameHelper(HttpContext, _db).Join(id);
            if (pgn == null)
            {
                return new StatusCodeResult(500);
            }

            return new JsonResult(pgn);
        }

        public ActionResult ReJoin()
        {
            var pgn = new GameHelper(HttpContext, _db).ReJoin();
            if (pgn == null)
            {
                return new StatusCodeResult(500);
            }

            return new JsonResult(pgn);
        }

        public ActionResult Exit()
        {
            new GameHelper(HttpContext, _db).Exit();
            return new StatusCodeResult(200);
        }

        public ActionResult SavePgn(string? pgn, int? moves)
        {
            pgn ??= "start";
            if (new GameHelper(HttpContext, _db).SavePgn(pgn, moves.GetValueOrDefault(0))) return new StatusCodeResult(200);
            return new StatusCodeResult(500);
        }

        /// <summary>
        /// Возвращает PGN (Для возобновления своей игры)
        /// </summary>
        /// <returns></returns>
        public ActionResult GetPgn()
        {
            var data = new GameHelper(HttpContext, _db).GetPgn();
            if (data == null)
            {
                return new StatusCodeResult(500);
            }

            return new JsonResult(new { pgn = data.pgn, creatorOfferedDraw = data.creatorOfferedDraw });
        }

        /// <summary> Проголосовать за ход </summary>
        /// <param name="from"></param>
        /// <param name="to"></param>
        /// <param name="moves"></param>
        /// <returns></returns>
        public ActionResult Vote(string from, string to, int moves)
        {
            if (new GameHelper(HttpContext, _db).Vote(from, to, moves))
            {
                return StatusCode(200);
            }

            return StatusCode(500);
        }

        /// <summary>
        /// Возвращает голос
        /// </summary>
        /// <returns></returns>
        public ActionResult RestoreVote()
        {
            var result = new GameHelper(HttpContext, _db).RestoreVote();
            return new JsonResult(result);
        }

        public ActionResult FinishVote()
        {
            var result = new GameHelper(HttpContext, _db).FinishVote();

            return new JsonResult(result);
        }

        public ActionResult UndoVote()
        {
            var result = new GameHelper(HttpContext, _db).UndoVote();
            if (result) return Ok();
            return StatusCode(500);
        }

        /// <summary>
        /// Проголосовать за сдачу
        /// </summary>
        /// <param name="moves"></param>
        /// <returns></returns>
        public ActionResult VoteGiveUp(int moves)
        {
            var result = new GameHelper(HttpContext, _db).VoteGiveUp(moves);
            return Ok(result);
        }

        /// <summary>
        /// Сдаться (создателю игры)
        /// </summary>
        /// <returns></returns>
        public ActionResult GiveUp()
        {
            var result = new GameHelper(HttpContext, _db).GiveUp();
            return Ok(result);
        }

        public ActionResult OfferDraw()
        {
            var result = new GameHelper(HttpContext, _db).OfferDraw();
            return Ok(result);
        }

        public ActionResult VoteDraw(int move)
        {
            var result = new GameHelper(HttpContext, _db).VoteDraw(move);
            return Ok(result);
        }

        /// <summary>
        /// Сбросить состояние ничьей предложенной голосующими после хода мастера
        /// </summary>
        /// <returns></returns>
        public ActionResult ResetDraw()
        {
            new GameHelper(HttpContext, _db).ResetDraw();
            return Ok();
        }

        /// <summary>
        /// Объявить результат игры
        /// </summary>
        /// <returns></returns>
        public ActionResult DeclareResult(bool win, bool draw)
        {
            new GameHelper(HttpContext, _db).DeclareResult(win, draw);
            return Ok();
        }
    }
}