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
            modelBuilder.Entity<Game>().HasMany(g => g.Participants)
                .WithOne(u => u.Game)
                .HasForeignKey(u => u.GameId)
                .IsRequired(false);

            modelBuilder.Entity<Vote>().HasKey(v => new
            {
                v.GameId,
                v.UserName,
                v.Move
            });
            modelBuilder.Entity<Vote>().HasOne(v=>v.Game).WithMany(g=>g.Votes).HasForeignKey(v=>v.GameId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<Vote>().HasOne(v => v.User).WithMany(g => g.Votes).HasForeignKey(v => v.UserName).OnDelete(DeleteBehavior.NoAction);

            base.OnModelCreating(modelBuilder);
        }
    }
}
