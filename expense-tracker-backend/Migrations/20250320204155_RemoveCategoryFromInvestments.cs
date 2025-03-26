using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace expense_tracker_backend.Migrations
{
    /// <inheritdoc />
    public partial class RemoveCategoryFromInvestments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Investments_Categories_CategoryId",
                table: "Investments");

            migrationBuilder.DropIndex(
                name: "IX_Investments_CategoryId",
                table: "Investments");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "Investments");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CategoryId",
                table: "Investments",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Investments_CategoryId",
                table: "Investments",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Investments_Categories_CategoryId",
                table: "Investments",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
