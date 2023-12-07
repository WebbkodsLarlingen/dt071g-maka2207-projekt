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
            // Main Header used through entire lifecycle of program.
            string mainHeader ="---------------------------------------------------\n--    AI DATORER AB | K O M M A N D O T O L K    --\n---------------------------------------------------";
            Console.Title = "AI DATORER AB - SYSTEMADMINISTRATIV KOMMANDOTOLK";
            

            // Inform about secret password before even attempting to login!
            Console.WriteLine("ANGE DEN HEMLIGA KODEN FÖR ATT ENS FÅ AUTENTISERA DIG!");

            // Demand secret password before even showing anything else! As requested by customer
            // Initialize secretPassword variable for input
            string secretPassword = "";
            secretPassword = SecretPassword.TheSecretPassword(); // Class function that hides input

            // Check password
            if(secretPassword != "hemlis")
            {
                // Just kill application if it's not correct.
                Environment.Exit(0);
            }

            // Create httpClient & httpClientHandler object instances! This will be our main connection that will be re-used!
            (var httpClient, var handler) = Connection.CreateHttpClientAndHandler();
            string accessToken = ""; // token to make HTTP requests with after login

            // Starting screen when secret password correct
            Console.Clear();
            Console.WriteLine(mainHeader);
            Console.WriteLine("-OBS: Användarnamnet får ej innehålla mellanslag!--");
            Console.WriteLine("Användarnamn & lösenord (separera med mellanslag): ");

            // Boolean for whether you logged in or not
            bool loggedIn = false;
            // Loop until logged in!
            while (!loggedIn) {
            // Attempt logging in before moving on to the next part of the program!
            (httpClient, handler, loggedIn, accessToken) = await Login.AttemptLogin(httpClient, handler, loggedIn);         

                if(loggedIn == false)
                {
                    // Show error and loop again until logged in!
                    Console.WriteLine("Användarnamn och/eller lösenord felaktigt!");
                }
             // If loggedIn returns as "true" then while loop finishes and we have logged in.
            }
            // HERE WE END UP IF LOGGED IN!
            Console.Clear();
            Console.WriteLine("Du lyckades loggas in!");
            Console.WriteLine("Access token is:" + accessToken);

            Console.WriteLine(mainHeader);
            
            // This part BELOW logs out!
            bool loggedOut = false;
            (httpClient, handler, loggedOut) = await Logout.AttemptLogout(httpClient, handler, loggedOut);
            if(loggedOut == false)
            {
                Console.WriteLine("Misslyckades loggas ut! Din inloggningssession i databasen är således ej raderad!");
            } else { Console.WriteLine("Du är utloggad, käre Systemadministratör!"); Environment.Exit(0); }
            // This part ABOVE logs out!
        }
    }
}