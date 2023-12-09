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
        // GLOBAL VARIABLES!
        static bool loggedIn = false; // Logged in?
        static bool loggedOut = false; // Logged out?
        static bool serverOnline = false; // REST API online?
        static string[] commandList = // Available commands in AI Datorer AB CLI.
            {"showallusers",
            "showuser", 
            "blockuser", 
            "unblockuser", 
            "adduser", 
            "changeuser",
            "deleteuser",
            "logoutuser",
            "userroles" };
        static string[] rolesList = // Available roles(levels of access) any non-sysadmin admin can be assinged by the sysadmin.
            {
            "get_images", 
            "post_images", 
            "put_images", 
            "delete_images", 
            "get_components", 
            "post_components", 
            "put_components", 
            "delete_components"
            };

        static async Task Main(string[] args) // Async Task makes it act asynchronous and also being able to await
        {
            // Window Title (outside of the Windows Console App)
            Console.Title = "AI DATORER AB - SYSTEMADMINISTRATIV KOMMANDOTOLK"; 
            // Main Header used through entire lifecycle of program.
            string mainHeader ="---------------------------------------------------\n--    AI DATORER AB | K O M M A N D O T O L K    --\n---------------------------------------------------";

            // Prefixes for success (green color) and error (red color)
            string success = "\u001b[32m[OK]:\u001b[0m "; 
            string error = "\u001b[31m[FEL]:\u001b[0m ";

            // Inform about secret password before even attempting to login!
            Console.WriteLine("ANGE DEN HEMLIGA KODEN FÖR ATT ENS FÅ AUTENTISERA DIG!");

            // Demand secret password before even showing anything else! As requested by customer
            // Initialize secretPassword variable for input
            string secretPassword = "";
            // secretPassword = SecretPassword.TheSecretPassword(); // Class function that hides input

            // Check password
            if(secretPassword != "") // FIX: change back to "hemlis" after all done
            {
                // Just kill application if it's not correct.
                Environment.Exit(0);
            }

            // Create httpClient & httpClientHandler object instances! This will be our main connection that will be re-used!
            (var httpClient, var handler) = Connection.CreateHttpClientAndHandler();

            // Starting screen when secret password correct
            Console.Clear();
            Console.WriteLine(mainHeader);
            Console.WriteLine("-OBS: Användarnamnet får ej innehålla mellanslag!--");
            Console.WriteLine("Användarnamn & lösenord (separera med mellanslag): ");
        
            // Loop until logged in!
            while (!loggedIn) {
            // Attempt logging in before moving on to the next part of the program!
            (httpClient, handler, loggedIn, serverOnline) = await Login.AttemptLogin(httpClient, handler, loggedIn, serverOnline);         

                // Login failed but REST API online
                if(loggedIn == false && serverOnline == true)
                {
                    // Show error and loop again until logged in!
                    Console.WriteLine("Felaktiga inloggningsuppgifter!");
                } 
                // REST API offline so login of course fails
                else if(loggedIn == false && serverOnline == false)
                {
                    Console.WriteLine("Kunde ej ansluta mot REST API. Starta den och försök igen!");
                }           
             // If loggedIn returns as "true" then while loop finishes and we have logged in.
            }
            // HERE WE END UP IF LOGGED IN!
            Console.Clear();
            Console.WriteLine(mainHeader);
            Console.WriteLine("Du lyckades loggas in!");

            // Command string that is used to actually do things in the MongoDB as a System Administrator
            string command = "";
            string commandSplit = ""; // Splitting the 'command' from the first " " and its parameters
            string commandParameters = ""; // Store splitted parameters from the 'command'
            // MAIN WHILE-LOOP = Here is where all CLI commands are finally being issued to the MongoDB localhost Database!
            // while loop to stay logged in. Whenever we write logout (even uppercased!), it will jump out of main loop log us out
            // Any "continue;" means starting back from top of this "main while-loop"
            while(command?.ToLower() != "logout")
            {

                Console.Write(">");
                command = Console.ReadLine();

                if(command == "") { Console.WriteLine(error + "Skriv ett kommando!"); continue; }

                // If there is not a single " " then it is invalid
                if(!command.Contains(" ")) { Console.WriteLine(error + "Ange ett giltigt kommando!"); continue; }
                
                // Split command from its parameters
                commandSplit = command.Split(' ')[0]; 
                commandParameters = command.Split(" ")[1];

                // Invalid command
                if(!commandList.Contains(commandSplit.ToLower()))
                { Console.WriteLine(error + "Kommandot '" + commandSplit + "' finns ej!"); continue; }
            }

            // ATTEMPT LOG OUT AFTER LEAVING MAIN WHILE-LOOP!
            (httpClient, handler, loggedOut) = await Logout.AttemptLogout(httpClient, handler, loggedOut);
            if(loggedOut == false)
            {
                Console.WriteLine("Utloggning misslyckades! Din inloggningssession i databasen är kvar!");
            } else { Console.WriteLine("Du är nu utloggad, käre Systemadministratör!");  }
            Environment.Exit(0);
            // GOOD BYE C# CONSOLE APP! By: ©2023-2024 maka2207 / WebbKodsLärlingen
        }
    }
}