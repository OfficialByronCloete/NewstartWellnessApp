var builder = DistributedApplication.CreateBuilder(args);

var api = builder.AddProject("webapi", @"..\..\NewStartWellnessApp.WebAPI\NewStartWellnessApp.WebAPI.csproj")
    .WithExternalHttpEndpoints();

builder.AddJavaScriptApp("frontend", @"..\..\..\frontend", runScriptName: "start")
    .WithReference(api)
    .WaitFor(api)
    .WithHttpEndpoint(port: 4200, isProxied: false);

builder.Build().Run();
