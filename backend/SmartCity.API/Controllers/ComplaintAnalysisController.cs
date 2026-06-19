using Microsoft.AspNetCore.Mvc;
using SmartCity.API.Models.Request;
using SmartCity.API.Services.Interfaces;

namespace SmartCity.API.Controllers
{
    [ApiController]
    [Route("api/complaints")]
    public class ComplaintAnalysisController : ControllerBase
    {
        private readonly IAnalysisService _analysisService;

        public ComplaintAnalysisController(IAnalysisService analysisService)
        {
            _analysisService = analysisService;
        }

        /// <summary>
        /// Analyze a complaint image using AI to detect issue type, department and priority
        /// </summary>
        [HttpPost("analyze")]
        public async Task<IActionResult> Analyze([FromBody] AnalyzeComplaintRequest request)
        {
            if (string.IsNullOrEmpty(request.ImageUrl) && string.IsNullOrEmpty(request.ImageBase64))
                return BadRequest(new { message = "Image URL or Base64 is required." });

            var result = await _analysisService.AnalyzeComplaintAsync(request);
            return Ok(result);
        }
    }
}