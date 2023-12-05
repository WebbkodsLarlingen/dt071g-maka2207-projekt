using System; // For everything!
using System.Net;
using System.Net.Http; // For httpClient class
using System.Threading.Tasks; // For Asynchronous behavior
using System.Text; // For using encodings
using System.Text.Json; // For JSON methods
using Newtonsoft.Json; // NuGet Dependency - For Even better JSON manipulation!

namespace maka2207_projekt
{
    internal class Program
    {
        static async Task Main(string[] args) // Async Task makes it act asynchronous and also being able to await
        {
            // Variable for httpOnly secured Cookie!
            string secretCookie = "";
            string secretPassword = "";
            // JSON string for logging in
            string loginJSON = "";

            // Create httpClient & httpClientHandler object instances!
            (var httpClient, var handler) = Connection.CreateHttpClientAndHandler();

            // Boolean for whether you logged in or not
            bool loggedIn = false;

            // Inform about secret password before even attempting to login!
            Console.WriteLine("ANGE DEN HEMLIGA KODEN FÖR ATT ENS FÅ AUTENTISERA DIG!");

            // Demand secret password before even showing anything else! As requested by customer
            secretPassword = SecretPassword.TheSecretPassword(); // Class function that hides input

            // Check password
            if(secretPassword != "69super420Duper1337")
            {
                // Just kill application if it's not correct.
                Environment.Exit(0);
            }

            // Starting screen when secret password correct
            Console.Clear();
            Console.WriteLine("-----------------------------------------------------!");
            Console.WriteLine("--    AI DATORER AB | K O M M A N D O T O L K      --!");
            Console.WriteLine("-----------------------------------------------------!");
            Console.WriteLine("Användarnamn & lösenord (separarera med mellanslag): ");
            
            // Loop until logged in!
            while (!loggedIn) {       
            string usernameAndpassword ="";
            string username = "";
            string password = "";
            usernameAndpassword = Console.ReadLine(); // true = allow whitespace when typing

            // Split username and password
            string[] loginDetails = usernameAndpassword.Split(' ');

            // Check at exactly both (no more or less) has been provided
            if(loginDetails.Length == 2)
            {
                username = loginDetails[0];
                password = loginDetails[1];
            }

            // Create JSON Body with those values
            loginJSON = @$"{{""username"": ""{username}"",""password"": ""{password}""}}"; // superAdmin1337

            // Make the POST request to the endpoint http://localhost:5000/api/login
            HttpResponseMessage response = await httpClient.PostAsync("api/login", new StringContent(loginJSON, Encoding.UTF8, "application/json"));

            // When login was successful (only then do we receive 2XX status code!)
            if (response.IsSuccessStatusCode)
            {
                // Grab cookies
                var httpOnlyCookie = handler.CookieContainer.GetCookies(httpClient.BaseAddress);

                // Store secret cookie to be used in upcoming CRUD!
                    foreach (Cookie cookie in httpOnlyCookie)
                    {
                    // We only ever receive one cookie so no issues to store the correct one.
                    secretCookie = cookie.Value;            
                    }

                // Read and display the content
                string content = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"API Response: {content}");
                
                    break;
            }
            // Otherwise we return some other status code (NOT 2XX)
            else
            {
                // Show error and loop again until logged in!
                Console.WriteLine("Användarnamn och/eller lösenord felaktigt!");
                    continue;
            }

            } // END OF login WHILE LOOP
            // HERE WE END UP IF LOGGED IN!
            Console.Write(secretCookie);

        }
    }
}