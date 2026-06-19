using SmartCity.API.Models.Request;
using SmartCity.API.Models.Response;

namespace SmartCity.API.Services.Interfaces
{
    public interface IDuplicateService
    {
        Task<DuplicateCheckResult> CheckDuplicateAsync(DuplicateCheckRequest request);
    }
}