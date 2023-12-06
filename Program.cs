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
            //string secretCookie = "";
            string secretPassword = "";

            // Create httpClient & httpClientHandler object instances! This will be our main connection that will be re-used!
            (var httpClient, var handler) = Connection.CreateHttpClientAndHandler();

            // Inform about secret password before even attempting to login!
            Console.WriteLine("ANGE DEN HEMLIGA KODEN FÖR ATT ENS FÅ AUTENTISERA DIG!");

            // Demand secret password before even showing anything else! As requested by customer
            secretPassword = SecretPassword.TheSecretPassword(); // Class function that hides input

            // Check password
            if(secretPassword != "hemlis")
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

            // Boolean for whether you logged in or not
            bool loggedIn = false;
            // Loop until logged in!
            while (!loggedIn) {
            // Attempt logging in before moving on to the next part of the program!
            (httpClient, handler, loggedIn) = await Login.AttemptLogin(httpClient, handler, loggedIn);         
             // If loggedIn returns as "true" then while loop finishes and we have logged in.
            }
            // HERE WE END UP IF LOGGED IN!
            Console.WriteLine("Du lyckades loggas in!");

        }
    }
}