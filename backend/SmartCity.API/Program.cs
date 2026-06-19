using SmartCity.API.Services.Implementations;
using SmartCity.API.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "Smart City Reporting API",
        Version = "v1",
        Description = "AI-powered complaint analysis API for Smart City Reporting System"
    });
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Register services
builder.Services.AddScoped<IAnalysisService, AnalysisService>();
builder.Services.AddScoped<IDuplicateService, DuplicateService>();
builder.Services.AddScoped<IPriorityService, PriorityService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Smart City API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

app.Run();