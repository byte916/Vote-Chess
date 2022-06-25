var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews(options =>
{
    options.EnableEndpointRouting = false;
});

var app = builder.Build();

app.UseMvc(routeBuilder =>
{
    routeBuilder.MapRoute(
        name: "default",
        template: "{controller=Home}/{action=Index}/{id?}");
});

app.Run();