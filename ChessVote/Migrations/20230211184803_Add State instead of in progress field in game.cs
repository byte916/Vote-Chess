using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChessVote.Migrations
{
    public partial class AddStateinsteadofinprogressfieldingame : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "State",
                table: "Games",
                type: "int",
                nullable: false,
                defaultValue: 0);
            migrationBuilder.Sql("Update Games Set State = Case IsInProgress When 0 Then 4 Else 0 End");
            migrationBuilder.DropColumn(
                name: "IsInProgress",
                table: "Games");

        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsInProgress",
                table: "Games",
                type: "bit",
                nullable: false,
                defaultValue: false);
            migrationBuilder.Sql("Update Games Set IsInProgress = Case State When 0 Then 1 Else 0 End");
            migrationBuilder.DropColumn(
                name: "State",
                table: "Games");
        }
    }
}
