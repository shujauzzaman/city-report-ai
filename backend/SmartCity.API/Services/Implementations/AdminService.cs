using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Npgsql;
using SmartCity.API.Models.Request;
using SmartCity.API.Models.Response;
using SmartCity.API.Services.Interfaces;

namespace SmartCity.API.Services.Implementations
{
    public class AdminService : IAdminService
    {
        private static readonly string[] Departments = { "Infrastructure", "Municipal", "Traffic" };

        private readonly HttpClient _http;
        private readonly string _supabaseUrl;
        private readonly string _publishableKey;
        private readonly string _serviceKey;
        private readonly string _connectionString;

        public AdminService(HttpClient http, IConfiguration configuration)
        {
            _http = http;
            _supabaseUrl = (configuration["Supabase:Url"]
                ?? throw new InvalidOperationException("Supabase:Url is not configured.")).TrimEnd('/');
            _publishableKey = configuration["Supabase:PublishableKey"]
                ?? throw new InvalidOperationException("Supabase:PublishableKey is not configured.");
            _serviceKey = configuration["Supabase:ServiceRoleKey"]
                ?? throw new InvalidOperationException("Supabase:ServiceRoleKey is not configured.");
            _connectionString = configuration.GetConnectionString("SupabaseDb")
                ?? throw new InvalidOperationException("SupabaseDb connection string not configured.");
        }

        public async Task<AdminActionResult> CreateStaffAsync(string? accessToken, CreateStaffRequest request)
        {
            if (string.IsNullOrWhiteSpace(accessToken))
                return Fail(401, "Please sign in again.");

            // 1. Who is calling? Ask Supabase to validate their session token.
            using var whoReq = new HttpRequestMessage(HttpMethod.Get, $"{_supabaseUrl}/auth/v1/user");
            whoReq.Headers.Add("apikey", _publishableKey);
            whoReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            using var whoRes = await _http.SendAsync(whoReq);

            if (!whoRes.IsSuccessStatusCode)
                return Fail(401, "Your session is not valid. Please sign in again.");

            var who = await whoRes.Content.ReadFromJsonAsync<JsonElement>();
            var callerId = who.GetProperty("id").GetString();
            if (string.IsNullOrEmpty(callerId))
                return Fail(401, "Your session is not valid. Please sign in again.");

            // 2. Only admins may create accounts.
            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.OpenAsync();

            await using (var roleCmd = new NpgsqlCommand("select role from profiles where id = @id::uuid", conn))
            {
                roleCmd.Parameters.AddWithValue("id", callerId);
                var callerRole = await roleCmd.ExecuteScalarAsync() as string;
                if (callerRole != "admin")
                    return Fail(403, "Only admins can create accounts.");
            }

            // 3. Validate the input.
            var email = (request.Email ?? "").Trim().ToLowerInvariant();
            if (email.Length == 0 || !email.Contains('@'))
                return Fail(400, "Please enter a valid email address.");

            if ((request.Password ?? "").Length < 8)
                return Fail(400, "Password must be at least 8 characters.");

            if (request.Role != "officer" && request.Role != "worker")
                return Fail(400, "Role must be officer or worker.");

            if (request.Department is null || !Departments.Contains(request.Department))
                return Fail(400, "Please choose a valid department.");

            // 4. Create the login in Supabase Auth, already verified so it works straight away.
            using var createReq = new HttpRequestMessage(HttpMethod.Post, $"{_supabaseUrl}/auth/v1/admin/users");
            AddServiceKey(createReq);
            createReq.Content = JsonContent.Create(new
            {
                email,
                password = request.Password,
                email_confirm = true
            });

            using var createRes = await _http.SendAsync(createReq);
            var createBody = await createRes.Content.ReadAsStringAsync();

            if (!createRes.IsSuccessStatusCode)
            {
                string? errorCode = null;
                string? msg = null;
                try
                {
                    using var errDoc = JsonDocument.Parse(createBody);
                    if (errDoc.RootElement.TryGetProperty("error_code", out var ec)) errorCode = ec.GetString();
                    if (errDoc.RootElement.TryGetProperty("msg", out var m)) msg = m.GetString();
                }
                catch { /* body was not JSON */ }

                if (errorCode is "email_exists" or "user_already_exists")
                    return Fail(409, "An account with this email already exists. Use \"Existing account\" to change its role.");

                if (errorCode == "weak_password")
                    return Fail(400, msg ?? "That password is too weak. Try a longer one.");

                return Fail(502, msg ?? "Could not create the account. Please try again.");
            }

            string newUserId;
            using (var createdDoc = JsonDocument.Parse(createBody))
            {
                newUserId = createdDoc.RootElement.GetProperty("id").GetString()!;
            }

            // 5. Create (or update) the profile with the chosen role and department.
            try
            {
                const string upsertSql = @"
                    insert into profiles (id, email, role, department, is_disabled)
                    values (@id::uuid, @email, @role, @department, false)
                    on conflict (id) do update
                        set email = excluded.email,
                            role = excluded.role,
                            department = excluded.department,
                            is_disabled = false";

                await using var upsertCmd = new NpgsqlCommand(upsertSql, conn);
                upsertCmd.Parameters.AddWithValue("id", newUserId);
                upsertCmd.Parameters.AddWithValue("email", email);
                upsertCmd.Parameters.AddWithValue("role", request.Role);
                upsertCmd.Parameters.AddWithValue("department", request.Department);
                await upsertCmd.ExecuteNonQueryAsync();
            }
            catch
            {
                // Don't leave a login without a profile behind
                await DeleteAuthUserAsync(newUserId);
                return Fail(500, "The profile could not be saved, so nothing was created. Please try again.");
            }

            return new AdminActionResult
            {
                Success = true,
                StatusCode = 200,
                Message = "Account created.",
                UserId = newUserId
            };
        }

        private void AddServiceKey(HttpRequestMessage req)
        {
            req.Headers.Add("apikey", _serviceKey);
            // Legacy service_role keys are JWTs and also go in the Authorization header
            if (_serviceKey.StartsWith("eyJ"))
                req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _serviceKey);
        }

        private async Task DeleteAuthUserAsync(string userId)
        {
            try
            {
                using var req = new HttpRequestMessage(HttpMethod.Delete, $"{_supabaseUrl}/auth/v1/admin/users/{userId}");
                AddServiceKey(req);
                using var res = await _http.SendAsync(req);
            }
            catch
            {
                // best effort
            }
        }

        private static AdminActionResult Fail(int status, string message) =>
            new() { Success = false, StatusCode = status, Message = message };
    }
}