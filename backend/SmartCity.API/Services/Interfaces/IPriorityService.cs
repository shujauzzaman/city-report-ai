using SmartCity.API.Models.Request;
using SmartCity.API.Models.Response;

namespace SmartCity.API.Services.Interfaces
{
    public interface IPriorityService
    {
        Task<PriorityUpdateResult> UpdatePriorityAsync(UpdatePriorityRequest request);
    }
}