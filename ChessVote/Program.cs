using ChessVote.CvDb;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Включаем аутентификацию через Lichess
builder.Services.AddAuthentication(options =>
    {
        options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    })

    .AddCookie(options =>
    {
        options.LoginPath = "/login";
        options.LogoutPath = "/logout";
    })
    .AddLichess(options =>
    {
        options.ClientId = "vote_chess";
        options.ClientSecret = "lip_WQQ5VYSSu4GPlW736D3S";
    });

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<CvDbContext>(options => options.UseSqlServer(connectionString));

// Включаем работу контроллеров и views
builder.Services.AddControllersWithViews(options =>
{
    options.EnableEndpointRouting = false;
});

var app = builder.Build();

// Включаем статические файлы
app.UseStaticFiles();
app.UseAuthentication();
app.UseHttpsRedirection();
app.UseMvc(routeBuilder =>
{
    routeBuilder.MapRoute(
        name: "default",
        template: "{controller=Home}/{action=Index}/{id?}");
});

app.Run();