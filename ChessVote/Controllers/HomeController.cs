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
            var userHelper = new UserHelper(HttpContext, _db);
            ViewData["UserName"] = userHelper.GetUser.Name;
            ViewData["State"] = (int)new GameHelper(_db).GetState(userHelper.GetUser.Name);

            return View();
        }
    }
}