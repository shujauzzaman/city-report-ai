using SmartCity.API.Models.Request;
using SmartCity.API.Models.Response;

namespace SmartCity.API.Services.Interfaces
{
    public interface IAnalysisService
    {
        Task<AnalysisResult> AnalyzeComplaintAsync(AnalyzeComplaintRequest request);
    }
}