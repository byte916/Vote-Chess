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

        public JsonResult GetState()
        {
            var userName = new UserHelper(HttpContext, _db).GetUser.Name;
            var state = new GameHelper(_db).GetState(userName);
            return new JsonResult(new
            {
                state = state
            });
        }

        /// <summary> Получить список игр </summary>
        public JsonResult GetGameList()
        {
            return new JsonResult(new GameHelper(_db).GetGameList());
        }

        public ActionResult Create()
        {
            var userName = new UserHelper(HttpContext, _db).GetUser.Name;
            new GameHelper(_db).Create(userName);
            return new StatusCodeResult(200);
        }
        

        public ActionResult Exit()
        {
            var userName = new UserHelper(HttpContext, _db).GetUser.Name;
            new GameHelper(_db).Exit(userName);
            return new StatusCodeResult(200);
        }
    }
}