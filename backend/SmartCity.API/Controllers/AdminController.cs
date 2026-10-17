using Microsoft.AspNetCore.Mvc;
using SmartCity.API.Models.Request;
using SmartCity.API.Services.Interfaces;

namespace SmartCity.API.Controllers
{
    [ApiController]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpPost("create-user")]
        public async Task<IActionResult> CreateUser([FromBody] CreateStaffRequest request)
        {
            var header = Request.Headers.Authorization.ToString();
            var token = header.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
                ? header[7..].Trim()
                : null;

            var result = await _adminService.CreateStaffAsync(token, request);

            return StatusCode(result.StatusCode, new
            {
                success = result.Success,
                message = result.Message,
                userId = result.UserId
            });
        }
    }
}