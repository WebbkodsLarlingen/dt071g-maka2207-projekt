using System; // For everything!
using System.Net;
using System.Net.Http; // For httpClient class
using System.Threading.Tasks; // For Asynchronous behavior
using System.Text; // For using encodings
using System.Text.Json; // For JSON methods


namespace maka2207_projekt
{
    internal class Logout
    {
        // Logout class with static function. Just sends POST /api/logout which removes httpOnly stored cookie!
        public static async Task<(HttpClient httpClient, HttpClientHandler handler, bool loggedIn)> AttemptLogout(HttpClient httpClient, HttpClientHandler handler, bool loggedOut)
        {
            // Make the POST request to the endpoint http://localhost:5000/api/logout
            try { 
            HttpResponseMessage response = await httpClient.PostAsync("api/logout",null);

            // Did we log out?
            if (response.IsSuccessStatusCode)
            {
                loggedOut = true;
            }
            else { loggedOut = false; }
                
            // Send back new connection + if logout succeeded/failed
            return (httpClient, handler, loggedOut);
            }
            // Catch exceptions so Debugger don't cry! This returns loggedOut false so error shows that logging out failed!
            catch (HttpRequestException ex)
            {
                loggedOut = false;
                return (httpClient, handler, loggedOut);
            }
            catch (Exception ex) {
                loggedOut = false;
                return (httpClient, handler, loggedOut);
            }
        }
    }
}
