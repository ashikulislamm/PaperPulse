namespace PaperPulse.Application.Common.Models;

public class SortParams
{
    public string? SortBy { get; set; }
    public string? SortOrder { get; set; } = "asc";

    public bool IsDescending => !string.IsNullOrWhiteSpace(SortOrder) && 
                                 SortOrder.Equals("desc", StringComparison.OrdinalIgnoreCase);
}
