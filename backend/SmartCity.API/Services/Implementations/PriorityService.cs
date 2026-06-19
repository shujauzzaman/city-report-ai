using SmartCity.API.Models.Request;
using SmartCity.API.Models.Response;
using SmartCity.API.Services.Interfaces;

namespace SmartCity.API.Services.Implementations
{
    public class PriorityService : IPriorityService
    {
        public Task<PriorityUpdateResult> UpdatePriorityAsync(UpdatePriorityRequest request)
        {
            // TODO: Replace with actual priority aging logic
            var result = new PriorityUpdateResult
            {
                ComplaintId = request.ComplaintId,
                OldPriority = request.CurrentPriority,
                NewPriority = request.CurrentPriority,
                Reason = "Placeholder — priority engine not yet integrated"
            };

            return Task.FromResult(result);
        }
    }
}