﻿// <auto-generated />
using System;
using ChessVote.CvDb;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace ChessVote.Migrations
{
    [DbContext(typeof(CvDbContext))]
    partial class CvDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "6.0.6")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder, 1L, 1);

            modelBuilder.Entity("ChessVote.CvDb.Game", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"), 1L, 1);

                    b.Property<string>("CreatorName")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.Property<bool>("IsInProgress")
                        .HasColumnType("bit");

                    b.Property<string>("PGN")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.HasIndex("CreatorName");

                    b.ToTable("Games");
                });

            modelBuilder.Entity("ChessVote.CvDb.User", b =>
                {
                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(450)");

                    b.Property<int?>("GameId")
                        .HasColumnType("int");

                    b.HasKey("Name");

                    b.HasIndex("GameId");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("ChessVote.CvDb.Vote", b =>
                {
                    b.Property<int>("GameId")
                        .HasColumnType("int");

                    b.Property<string>("UserName")
                        .HasColumnType("nvarchar(450)");

                    b.Property<int>("Move")
                        .HasColumnType("int");

                    b.Property<string>("From")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("To")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("GameId", "UserName", "Move");

                    b.HasIndex("UserName");

                    b.ToTable("Vote");
                });

            modelBuilder.Entity("ChessVote.CvDb.Game", b =>
                {
                    b.HasOne("ChessVote.CvDb.User", "Creator")
                        .WithMany()
                        .HasForeignKey("CreatorName")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Creator");
                });

            modelBuilder.Entity("ChessVote.CvDb.User", b =>
                {
                    b.HasOne("ChessVote.CvDb.Game", "Game")
                        .WithMany("Participants")
                        .HasForeignKey("GameId");

                    b.Navigation("Game");
                });

            modelBuilder.Entity("ChessVote.CvDb.Vote", b =>
                {
                    b.HasOne("ChessVote.CvDb.Game", "Game")
                        .WithMany("Votes")
                        .HasForeignKey("GameId")
                        .OnDelete(DeleteBehavior.NoAction)
                        .IsRequired();

                    b.HasOne("ChessVote.CvDb.User", "User")
                        .WithMany("Votes")
                        .HasForeignKey("UserName")
                        .OnDelete(DeleteBehavior.NoAction)
                        .IsRequired();

                    b.Navigation("Game");

                    b.Navigation("User");
                });

            modelBuilder.Entity("ChessVote.CvDb.Game", b =>
                {
                    b.Navigation("Participants");

                    b.Navigation("Votes");
                });

            modelBuilder.Entity("ChessVote.CvDb.User", b =>
                {
                    b.Navigation("Votes");
                });
#pragma warning restore 612, 618
        }
    }
}
