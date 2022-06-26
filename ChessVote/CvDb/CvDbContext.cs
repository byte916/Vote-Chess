using Microsoft.EntityFrameworkCore;

namespace ChessVote.CvDb
{
    public class CvDbContext:DbContext
    {
        public CvDbContext(DbContextOptions options):base(options){}

        public DbSet<User> Users { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().HasKey(u => u.Name);
            base.OnModelCreating(modelBuilder);
        }
    }
}
