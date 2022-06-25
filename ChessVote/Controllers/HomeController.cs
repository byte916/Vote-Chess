using Microsoft.AspNetCore.Mvc;

namespace ChessVote.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
