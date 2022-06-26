using ChessVote.CvDb;

namespace ChessVote.Classes
{
    public class UserHelper
    {
        private User _user { get; set; }

        private CvDbContext _db { get; set; }

        public UserHelper(HttpContext context, CvDbContext db)
        {
            _db = db;

            var userName = context.User.Identity?.Name;
            if (string.IsNullOrWhiteSpace(userName))
            {
                _user = null;
            }

            var user = _db.Users.Find(userName);

            if (user == null)
            {
                user = new User()
                {
                    Name = userName
                };
                _db.Users.Add(user);
                _db.SaveChanges();
            }

            _user = user;
        }

        /// <summary> Получить текущего пользователя </summary>
        public User GetUser => _user;
    }
}
