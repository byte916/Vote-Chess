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
            return new JsonResult(true);
        }

        public ActionResult Join(string id)
        {
            var userName = new UserHelper(HttpContext, _db).GetUser.Name;
            if (new GameHelper(_db).Join(id, userName))
            {
                return new StatusCodeResult(200);
            }
            return new StatusCodeResult(500);
        }

        public ActionResult Exit()
        {
            var userName = new UserHelper(HttpContext, _db).GetUser.Name;
            new GameHelper(_db).Exit(userName);
            return new StatusCodeResult(200);
        }
    }
}