using System; // For everything!
using System.Net;
using System.Net.Http; // For httpClient class
using System.Threading.Tasks; // For Asynchronous behavior
using System.Text; // For using encodings
using System.Text.Json; // For JSON methods

namespace maka2207_projekt
{
    internal class Connection // Class that just returns the default initialized connection needed
    {
        // Return an object tuple with the httpClient and httpClientHandler that extracts cookies!
        public static (HttpClient httpClient, HttpClientHandler handler) CreateHttpClientAndHandler()
        {
            // Handler object is to grab httpOnly secured cookies!
            HttpClientHandler handler = new HttpClientHandler();
            handler.UseDefaultCredentials = true;

            // Create httpClient object, only one instance will be needed!
            HttpClient httpClient = new HttpClient(handler);

            // Starting REST API address to connect to (so we can just change with "api/{endpoint}" later on)
            httpClient.BaseAddress = new Uri("http://localhost:5000/");

            // Add necessary headers before sending POST request
            httpClient.DefaultRequestHeaders.Add("Accept", "application/json");

            // Return the object tuple, so it also has access to the handler object separately!
            return (httpClient, handler);
        }
    }
}
