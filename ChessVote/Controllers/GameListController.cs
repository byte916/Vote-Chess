using ChessVote.Classes;
using ChessVote.CvDb;
using Microsoft.AspNetCore.Mvc;

namespace ChessVote.Controllers
{
    public class GameListController : Controller
    {
        private CvDbContext _db;
        public GameListController(CvDbContext context)
        {
            _db = context;
        }

        /// <summary> Получить список игр </summary>
        public JsonResult Get()
        {
            return new JsonResult(new GameHelper(HttpContext, _db).GetGameList());
        }
    }
}
