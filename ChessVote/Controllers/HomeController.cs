using ChessVote.Classes;
using ChessVote.CvDb;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChessVote.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        private CvDbContext _db { get; set; }

        public HomeController(CvDbContext db)
        {
            _db = db;
        }
        public IActionResult Index()
        {
            if (!Directory.Exists("keys"))
            {
                Directory.CreateDirectory("keys");
            }
            var userHelper = new UserHelper(HttpContext, _db);
            ViewData["UserName"] = userHelper.GetUser.Name;
            var state = new GameHelper(HttpContext, _db).GetState();
            ViewData["State"] = (int)state.State;
            ViewData["Color"] = state.Color;

            return View();
        }
    }
}