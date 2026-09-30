using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using SmartCity.API.Models.Request;
using SmartCity.API.Models.Response;
using SmartCity.API.Services.Interfaces;

namespace SmartCity.API.Services.Implementations
{
    public class AnalysisService : IAnalysisService, IDisposable
    {
        private readonly InferenceSession _session;
        private readonly HttpClient _httpClient;

        private static readonly string[] ClassNames =
        {
            "pothole", "garbage", "open_manhole", "accident", "road_damage"
        };

        private static readonly Dictionary<string, string> HazardLevels = new()
        {
            ["pothole"] = "Medium",
            ["garbage"] = "Low",
            ["open_manhole"] = "Critical",
            ["accident"] = "Critical",
            ["road_damage"] = "High",
        };

        private static readonly Dictionary<string, string> DepartmentMap = new()
        {
            ["pothole"] = "Infrastructure",
            ["garbage"] = "Municipal",
            ["open_manhole"] = "Infrastructure",
            ["accident"] = "Traffic",
            ["road_damage"] = "Infrastructure",
        };

        private static readonly Dictionary<string, string> PriorityMap = new()
        {
            ["Critical"] = "critical",
            ["High"] = "high",
            ["Medium"] = "medium",
            ["Low"] = "low",
        };

        private const int InputSize = 640;
        private const float ConfidenceThreshold = 0.25f;
        private const float IouThreshold = 0.45f;

        public AnalysisService()
        {
            var modelPath = Path.Combine(AppContext.BaseDirectory, "MLModels", "best.onnx");
            _session = new InferenceSession(modelPath);
            _httpClient = new HttpClient();
        }

        public async Task<AnalysisResult> AnalyzeComplaintAsync(AnalyzeComplaintRequest request)
        {
            byte[] imageBytes;

            if (!string.IsNullOrEmpty(request.ImageBase64))
            {
                imageBytes = Convert.FromBase64String(request.ImageBase64);
            }
            else if (!string.IsNullOrEmpty(request.ImageUrl))
            {
                imageBytes = await _httpClient.GetByteArrayAsync(request.ImageUrl);
            }
            else
            {
                return new AnalysisResult
                {
                    Success = false,
                    Message = "No image provided (need ImageUrl or ImageBase64)."
                };
            }

            using var image = Image.Load<Rgb24>(imageBytes);
            int originalWidth = image.Width;
            int originalHeight = image.Height;

            float scale = Math.Min((float)InputSize / originalWidth, (float)InputSize / originalHeight);
            int scaledWidth = (int)(originalWidth * scale);
            int scaledHeight = (int)(originalHeight * scale);
            int padX = (InputSize - scaledWidth) / 2;
            int padY = (InputSize - scaledHeight) / 2;

            using var resized = image.Clone(ctx => ctx.Resize(scaledWidth, scaledHeight));
            using var padded = new Image<Rgb24>(InputSize, InputSize, new Rgb24(114, 114, 114));
            padded.Mutate(ctx => ctx.DrawImage(resized, new Point(padX, padY), 1f));

            var input = new DenseTensor<float>(new[] { 1, 3, InputSize, InputSize });
            padded.ProcessPixelRows(accessor =>
            {
                for (int y = 0; y < InputSize; y++)
                {
                    var row = accessor.GetRowSpan(y);
                    for (int x = 0; x < InputSize; x++)
                    {
                        input[0, 0, y, x] = row[x].R / 255f;
                        input[0, 1, y, x] = row[x].G / 255f;
                        input[0, 2, y, x] = row[x].B / 255f;
                    }
                }
            });

            var inputName = _session.InputMetadata.Keys.First();
            var inputs = new List<NamedOnnxValue> { NamedOnnxValue.CreateFromTensor(inputName, input) };

            using var results = _session.Run(inputs);
            var output = results.First().AsTensor<float>();

            int numClasses = ClassNames.Length;
            int numAnchors = output.Dimensions[2];

            var candidates = new List<(float x1, float y1, float x2, float y2, int classId, float conf)>();

            for (int i = 0; i < numAnchors; i++)
            {
                float cx = output[0, 0, i];
                float cy = output[0, 1, i];
                float w = output[0, 2, i];
                float h = output[0, 3, i];

                float bestScore = 0f;
                int bestClass = -1;
                for (int c = 0; c < numClasses; c++)
                {
                    float score = output[0, 4 + c, i];
                    if (score > bestScore)
                    {
                        bestScore = score;
                        bestClass = c;
                    }
                }

                if (bestScore < ConfidenceThreshold || bestClass < 0) continue;

                float x1 = (cx - w / 2 - padX) / scale;
                float y1 = (cy - h / 2 - padY) / scale;
                float x2 = (cx + w / 2 - padX) / scale;
                float y2 = (cy + h / 2 - padY) / scale;

                candidates.Add((x1, y1, x2, y2, bestClass, bestScore));
            }

            var kept = NonMaxSuppression(candidates, IouThreshold);

            if (kept.Count == 0)
            {
                return new AnalysisResult
                {
                    Success = true,
                    IssueType = "unknown",
                    Department = "Infrastructure",
                    Priority = "medium",
                    HazardLevel = "Medium",
                    Confidence = 0,
                    Message = "No hazard detected with sufficient confidence."
                };
            }

            var best = kept.OrderByDescending(d => d.conf).First();
            string issueType = ClassNames[best.classId];
            string hazard = HazardLevels[issueType];

            // Clamp box to image bounds — letterbox math can occasionally overshoot slightly
            double clampedX1 = Math.Max(0, Math.Min(best.x1, originalWidth));
            double clampedY1 = Math.Max(0, Math.Min(best.y1, originalHeight));
            double clampedX2 = Math.Max(0, Math.Min(best.x2, originalWidth));
            double clampedY2 = Math.Max(0, Math.Min(best.y2, originalHeight));

            return new AnalysisResult
            {
                Success = true,
                IssueType = issueType,
                Department = DepartmentMap[issueType],
                Priority = PriorityMap[hazard],
                HazardLevel = hazard,
                Confidence = best.conf,
                Message = $"Detected {issueType} with {best.conf:P0} confidence.",
                BoxX1 = clampedX1,
                BoxY1 = clampedY1,
                BoxX2 = clampedX2,
                BoxY2 = clampedY2,
            };
        }

        private static List<(float x1, float y1, float x2, float y2, int classId, float conf)> NonMaxSuppression(
            List<(float x1, float y1, float x2, float y2, int classId, float conf)> boxes, float iouThreshold)
        {
            var sorted = boxes.OrderByDescending(b => b.conf).ToList();
            var kept = new List<(float, float, float, float, int, float)>();

            while (sorted.Count > 0)
            {
                var current = sorted[0];
                kept.Add(current);
                sorted.RemoveAt(0);
                sorted.RemoveAll(b => b.classId == current.classId && IoU(current, b) > iouThreshold);
            }

            return kept;
        }

        private static float IoU(
            (float x1, float y1, float x2, float y2, int classId, float conf) a,
            (float x1, float y1, float x2, float y2, int classId, float conf) b)
        {
            float interX1 = Math.Max(a.x1, b.x1);
            float interY1 = Math.Max(a.y1, b.y1);
            float interX2 = Math.Min(a.x2, b.x2);
            float interY2 = Math.Min(a.y2, b.y2);

            float interArea = Math.Max(0, interX2 - interX1) * Math.Max(0, interY2 - interY1);
            float areaA = (a.x2 - a.x1) * (a.y2 - a.y1);
            float areaB = (b.x2 - b.x1) * (b.y2 - b.y1);

            return interArea / (areaA + areaB - interArea + 1e-6f);
        }

        public void Dispose()
        {
            _session?.Dispose();
            _httpClient?.Dispose();
        }
    }
}