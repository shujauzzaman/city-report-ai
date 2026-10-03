using Npgsql;
using SmartCity.API.Models.Request;
using SmartCity.API.Models.Response;
using SmartCity.API.Services.Interfaces;

namespace SmartCity.API.Services.Implementations
{
    public class DuplicateService : IDuplicateService
    {
        private readonly string _connectionString;
        private const double DuplicateRadiusMeters = 100;

        public DuplicateService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("SupabaseDb")
                ?? throw new InvalidOperationException("SupabaseDb connection string not configured.");
        }

        public async Task<DuplicateCheckResult> CheckDuplicateAsync(DuplicateCheckRequest request)
        {
            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.OpenAsync();

            const string selectSql = @"
                SELECT id, latitude, longitude, duplicate_count
                FROM complaints
                WHERE issue_type = @issueType
                  AND department = @department
                  AND created_at >= NOW() - INTERVAL '48 hours'
                  AND id::text != @complaintId
                  AND parent_complaint_id IS NULL";

            await using var selectCmd = new NpgsqlCommand(selectSql, conn);
            selectCmd.Parameters.AddWithValue("issueType", request.IssueType);
            selectCmd.Parameters.AddWithValue("department", request.Department);
            selectCmd.Parameters.AddWithValue("complaintId", request.ComplaintId);

            string? matchedId = null;
            int matchedCount = 0;

            await using (var reader = await selectCmd.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    var candidateId = reader.GetGuid(0).ToString();
                    var candidateLat = reader.IsDBNull(1) ? (double?)null : reader.GetDouble(1);
                    var candidateLng = reader.IsDBNull(2) ? (double?)null : reader.GetDouble(2);
                    var candidateCount = reader.GetInt32(3);

                    if (candidateLat is null || candidateLng is null) continue;

                    double distance = HaversineMeters(request.Latitude, request.Longitude, candidateLat.Value, candidateLng.Value);

                    if (distance <= DuplicateRadiusMeters)
                    {
                        matchedId = candidateId;
                        matchedCount = candidateCount;
                        break;
                    }
                }
            }

            if (matchedId == null)
            {
                return new DuplicateCheckResult
                {
                    IsDuplicate = false,
                    OriginalComplaintId = null,
                    DuplicateCount = 0,
                    Message = "No matching complaint found nearby."
                };
            }

            const string updateSql = @"
                UPDATE complaints
                SET duplicate_count = duplicate_count + 1
                WHERE id = @id::uuid
                RETURNING duplicate_count";

            await using var updateCmd = new NpgsqlCommand(updateSql, conn);
            updateCmd.Parameters.AddWithValue("id", matchedId);
            var newCount = (int)(await updateCmd.ExecuteScalarAsync() ?? matchedCount + 1);

            return new DuplicateCheckResult
            {
                IsDuplicate = true,
                OriginalComplaintId = matchedId,
                DuplicateCount = newCount,
                Message = $"This issue has already been reported and is being handled. ({newCount} reports so far)"
            };
        }

        private static double HaversineMeters(double lat1, double lon1, double lat2, double lon2)
        {
            const double EarthRadiusMeters = 6371000;
            double dLat = ToRadians(lat2 - lat1);
            double dLon = ToRadians(lon2 - lon1);

            double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                       Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                       Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            return EarthRadiusMeters * c;
        }

        private static double ToRadians(double degrees) => degrees * Math.PI / 180;
    }
}