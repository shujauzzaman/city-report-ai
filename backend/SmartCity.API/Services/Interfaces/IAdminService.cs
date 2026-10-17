using SmartCity.API.Models.Request;
using SmartCity.API.Models.Response;

namespace SmartCity.API.Services.Interfaces
{
    public interface IAdminService
    {
        Task<AdminActionResult> CreateStaffAsync(string? accessToken, CreateStaffRequest request);
    }
}