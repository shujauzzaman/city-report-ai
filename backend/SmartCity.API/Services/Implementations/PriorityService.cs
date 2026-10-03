using SmartCity.API.Models.Request;
using SmartCity.API.Models.Response;
using SmartCity.API.Services.Interfaces;

namespace SmartCity.API.Services.Implementations
{
    public class PriorityService : IPriorityService
    {
        // Higher number = more urgent. Never downgrades — only escalates.
        private static readonly Dictionary<string, int> PriorityRank = new()
        {
            ["low"] = 0,
            ["medium"] = 1,
            ["high"] = 2,
            ["critical"] = 3,
        };

        private static readonly string[] RankToPriority = { "low", "medium", "high", "critical" };

        public Task<PriorityUpdateResult> UpdatePriorityAsync(UpdatePriorityRequest request)
        {
            string current = string.IsNullOrEmpty(request.CurrentPriority) ? "medium" : request.CurrentPriority.ToLower();
            int currentRank = PriorityRank.GetValueOrDefault(current, 1);

            int duplicateRank = currentRank;
            string duplicateReason = "";
            if (request.DuplicateCount >= 10)
            {
                duplicateRank = PriorityRank["critical"];
                duplicateReason = $"{request.DuplicateCount} duplicate reports";
            }
            else if (request.DuplicateCount >= 5)
            {
                duplicateRank = PriorityRank["high"];
                duplicateReason = $"{request.DuplicateCount} duplicate reports";
            }

            int timeRank = currentRank;
            string timeReason = "";
            if (request.DaysOld >= 14)
            {
                timeRank = PriorityRank["critical"];
                timeReason = $"pending {request.DaysOld} days";
            }
            else if (request.DaysOld >= 7)
            {
                timeRank = PriorityRank["high"];
                timeReason = $"pending {request.DaysOld} days";
            }

            int finalRank = Math.Max(currentRank, Math.Max(duplicateRank, timeRank));
            string newPriority = RankToPriority[finalRank];

            string reason;
            if (finalRank == currentRank)
            {
                reason = "No escalation needed.";
            }
            else if (finalRank == duplicateRank && duplicateRank >= timeRank)
            {
                reason = $"Escalated due to {duplicateReason}.";
            }
            else
            {
                reason = $"Escalated due to complaint {timeReason}.";
            }

            return Task.FromResult(new PriorityUpdateResult
            {
                ComplaintId = request.ComplaintId,
                OldPriority = current,
                NewPriority = newPriority,
                Reason = reason,
            });
        }
    }
}