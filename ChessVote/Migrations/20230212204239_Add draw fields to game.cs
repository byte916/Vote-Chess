using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChessVote.Migrations
{
    public partial class Adddrawfieldstogame : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "CreatorOfferedDraw",
                table: "Games",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "VotersOfferedDraw",
                table: "Games",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatorOfferedDraw",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "VotersOfferedDraw",
                table: "Games");
        }
    }
}
