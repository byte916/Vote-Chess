using Microsoft.EntityFrameworkCore;

namespace ChessVote.CvDb
{
    public class CvDbContext:DbContext
    {
        public CvDbContext(DbContextOptions options):base(options){}

        public DbSet<User> Users { get; set; }

        public DbSet<Game> Games { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().HasKey(u => u.Name);

            modelBuilder.Entity<Game>().HasKey(g => g.Id);
            modelBuilder.Entity<Game>().HasOne(g => g.Creator).WithMany().HasForeignKey(g => g.CreatorName);

            base.OnModelCreating(modelBuilder);
        }
    }
}
