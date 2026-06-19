using Microsoft.AspNetCore.Mvc;
using SmartCity.API.Models.Request;
using SmartCity.API.Services.Interfaces;

namespace SmartCity.API.Controllers
{
    [ApiController]
    [Route("api/complaints")]
    public class DuplicateCheckController : ControllerBase
    {
        private readonly IDuplicateService _duplicateService;

        public DuplicateCheckController(IDuplicateService duplicateService)
        {
            _duplicateService = duplicateService;
        }

        /// <summary>
        /// Check if a complaint is a duplicate based on location, type and time
        /// </summary>
        [HttpPost("duplicate-check")]
        public async Task<IActionResult> CheckDuplicate([FromBody] DuplicateCheckRequest request)
        {
            if (string.IsNullOrEmpty(request.ComplaintId))
                return BadRequest(new { message = "Complaint ID is required." });

            var result = await _duplicateService.CheckDuplicateAsync(request);
            return Ok(result);
        }
    }
}