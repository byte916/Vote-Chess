using AspNet.Security.OAuth.Lichess;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChessVote.Controllers
{
    public class LoginController : Controller
    {
        [AllowAnonymous]
        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

        [AllowAnonymous]
        [HttpPost]
        public IActionResult Index(string ReturnUrl)
        {
            return Challenge(new AuthenticationProperties { RedirectUri = ReturnUrl }, LichessAuthenticationDefaults.AuthenticationScheme);
        }
    }
}
