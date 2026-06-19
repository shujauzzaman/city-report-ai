using Microsoft.AspNetCore.Mvc;
using SmartCity.API.Models.Request;
using SmartCity.API.Services.Interfaces;

namespace SmartCity.API.Controllers
{
    [ApiController]
    [Route("api/complaints")]
    public class PriorityController : ControllerBase
    {
        private readonly IPriorityService _priorityService;

        public PriorityController(IPriorityService priorityService)
        {
            _priorityService = priorityService;
        }

        /// <summary>
        /// Update complaint priority based on duplicate count or aging
        /// </summary>
        [HttpPut("{id}/priority")]
        public async Task<IActionResult> UpdatePriority(
            string id,
            [FromBody] UpdatePriorityRequest request)
        {
            request.ComplaintId = id;
            var result = await _priorityService.UpdatePriorityAsync(request);
            return Ok(result);
        }
    }
}