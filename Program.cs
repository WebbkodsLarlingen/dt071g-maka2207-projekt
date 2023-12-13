using System; // For everything!
using System.Net;
using System.Net.Http; // For httpClient class
using System.Threading.Tasks; // For Asynchronous behavior
using System.Text; // For using encodings
using System.Text.Json; // For JSON methods
using Newtonsoft.Json; // NuGet Dependency - For Even better JSON manipulation!
using System.Runtime.InteropServices.JavaScript;
using Newtonsoft.Json.Linq;
using static maka2207_projekt.UserData;

namespace maka2207_projekt
{
    internal class Program
    {
        // GLOBAL VARIABLES!
        static bool loggedIn = false; // Logged in?
        static bool loggedOut = false; // Logged out?
        static bool serverOnline = false; // REST API online?                                  
        static string[] matchRoles = { 
            "get_images=- Får visa bilder",
            "post_images=- Får publicera bilder",
            "put_images=- Får ändra bilder",
            "delete_images=- Får radera bilder",
            "get_components=- Får visa komponenter",
            "post_components=- Får publicera komponenter",
            "put_components=- Får ändra komponenter",
            "delete_components=- Får radera komponenter"
            };

    static async Task Main(string[] args) // Async Task makes it act asynchronous and also being able to await
        {
            // Window Title (outside of the Windows Console App)
            Console.Title = "AI DATORER AB - SYSTEMADMINISTRATIV KOMMANDOTOLK"; 
            // Main Header used through entire lifecycle of program.
            string mainHeader ="---------------------------------------------------\n--    AI DATORER AB | K O M M A N D O T O L K    --\n---------------------------------------------------";
            string mainHeaderLoggedIn = "--------------------------------------------------------------\n--    AI DATORER AB | K O M M A N D O T O L K - Inloggad    --\n--------------------------------------------------------------";

            // Prefixes for success (green color) and error (red color)
            string success = "\u001b[32m[OK]:\u001b[0m "; 
            string error = "\u001b[31m[FEL]:\u001b[0m ";
            string successAPI = "\u001b[32m[OK - FRÅN API]:\u001b[0m ";
            string errorAPI = "\u001b[31m[FEL - FRÅN API]:\u001b[0m ";

            // Inform about secret password before even attempting to login!
            Console.WriteLine("ANGE DEN HEMLIGA KODEN FÖR ATT ENS FÅ AUTENTISERA DIG!");
            Console.Write(">");
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
                    Console.WriteLine(error+"Felaktiga inloggningsuppgifter!");
                } 
                // REST API offline so login of course fails
                else if(loggedIn == false && serverOnline == false)
                {
                    Console.WriteLine(error+"Kunde ej ansluta mot REST API. Starta den och försök igen!");
                }           
             // If loggedIn returns as "true" then while loop finishes and we have logged in.
            }

            // HERE WE END UP IF LOGGED IN!
            Console.Clear();
            Console.WriteLine(mainHeaderLoggedIn);
            // Command string that is used to actually do things in the MongoDB as a System Administrator
            string command = "";

            // MAIN WHILE-LOOP = Here is where all CLI commands are finally being issued to the MongoDB localhost Database!
            // while loop to stay logged in. Whenever we write logout (even uppercased!), it will jump out of main loop log us out
            // Any "continue;" means starting back from top of this "main while-loop"
            while(command?.ToLower() != "logout")
            {
                // Enter command
                Console.Write(">");
                command = Console.ReadLine();

                // When no command given
                if(command == "") { Console.WriteLine(error + "Skriv ett kommando!"); continue; }

                // Exit main while-loop when it is logout!
                if(command.ToLower() == "logout") { break; }

                // When "commandOK" is true, then we send request to REST API
                bool commandOK = false;

                // Validate non-empty sent command
                (var jsonProps, var paramVals, var apiStr, commandOK, var err, var methodType) = await ValidateCommand.Validate(command, commandOK);

                // When command is invalid
                if(commandOK == false)
                {
                    Console.WriteLine(error + err); continue;
                }

                // When command is OK in validation, try run towards REST API
                Console.WriteLine(success + "Kör kommando: '" + command + "' mot endpoint:" + apiStr);

                // Prepare JSON data
                var jsonBody = new JObject();
                for (int i = 0; i < jsonProps.Length; i++)
                {
                    jsonBody.Add(jsonProps[i], paramVals[i]);
                }
                string jsonString = jsonBody.ToString();
                Console.WriteLine("JSON Body: " + jsonString + "HttpMethod: " + methodType);

                // Boolean for possible response codes (OK or NOT) and stringified JSON
                bool resStat = false; string strJSON = "";

                // Make request
                (httpClient, handler, strJSON, resStat) = await MakeRequest.MakeCRUDRequest(httpClient, handler, apiStr, jsonString, methodType);
              
                // If resStat is true that means it was 200 OK response, so it will include success-property and maybe data-property
                if(resStat == true)
                {
                    // Parse the {success:} JSON
                    JObject okProp = JObject.Parse(strJSON);
                    string okVal = (string)okProp["success"];
                    Console.WriteLine(successAPI + okVal);
                    
                    // Does {data:} exist?
                    if(okProp.TryGetValue("data", out var dataVal))
                    {
                        // Choose correct class to JSON deserialize with = Single User
                        if(apiStr == "/showuser"){
                            // -25 = Left alignment for prettier data display
                            UserData userData = JsonConvert.DeserializeObject<UserData>(dataVal.ToString());
                            Console.WriteLine("---------------------------------------");
                            Console.WriteLine($"{"ANVÄNDARNAMN",-25}{"E-POST"}");
                            Console.WriteLine($"{userData.Username,-25}{userData.Useremail}");
                            Console.WriteLine($"\n{"FULLSTÄNDIGT NAMN",-25}{"SENAST INLOGGAD"}");
                            Console.WriteLine($"{userData.Userfullname,-25}{userData.Last_login}");
                            Console.WriteLine($"\n{"ÅTKOMSTNYCKEL:"}");
                            Console.WriteLine($"{userData.Access_token}");
                            Console.WriteLine($"\n{"UPPDATERINGSNYCKEL:"}");
                            Console.WriteLine($"{userData.Refresh_token}");
                            Console.WriteLine($"\n{"KONTO BLOCKERAT?",-25}{"KONTO AKTIVERAT?"}");
                            Console.WriteLine($"{userData.Account_blocked,-25}{userData.Account_activated}");
                            Console.WriteLine("\nROLLER:");
                            // Loop through "ROLES:"
                            foreach (string role in userData.Roles)
                            {
                                // When no roles there yet, jump out of foreach Loop
                                if(userData.Roles.Count == 0)
                                {
                                    Console.WriteLine("Inga roller tilldelade ännu!");
                                    break;
                                }

                                // Otherwise loop through foreach Loop, by grabbing matching role in the matchRoles array
                                string matchingRole = matchRoles.FirstOrDefault(matchRole => role.StartsWith(matchRole.Split('=')[0]));
                       
                                if (matchingRole != null)
                                {
                                    // Grab its description after "="
                                    string roleDescription = matchingRole.Split('=')[1].Trim();

                                    // Output it plus the data variable name version of it within ()
                                    Console.Write($"{roleDescription,-25} ({matchingRole.Split('=')[0]})\n");
                                }
                                else // When not found in the array for some reason
                                {
                                    Console.WriteLine("");
                                }

                            }
                        }
                        // Choose correct class to JSON deserialize with = All Users
                        else if(apiStr == "/showallusers"){
                            List<UserData> userList = JsonConvert.DeserializeObject<List<UserData>>(dataVal.ToString());
                            foreach (UserData userData in userList)
                            {
                                Console.WriteLine("---------------------------------------");
                                Console.WriteLine($"{"ANVÄNDARNAMN",-25}{"E-POST"}");
                                Console.WriteLine($"{userData.Username,-25}{userData.Useremail}");
                                Console.WriteLine($"\n{"FULLSTÄNDIGT NAMN",-25}{"SENAST INLOGGAD"}");
                                Console.WriteLine($"{userData.Userfullname,-25}{userData.Last_login}");
                                Console.WriteLine($"\n{"ÅTKOMSTNYCKEL:"}");
                                Console.WriteLine($"{userData.Access_token}");
                                Console.WriteLine($"\n{"UPPDATERINGSNYCKEL:"}");
                                Console.WriteLine($"{userData.Refresh_token}");
                                Console.WriteLine($"\n{"KONTO BLOCKERAT?",-25}{"KONTO AKTIVERAT?"}");
                                Console.WriteLine($"{userData.Account_blocked,-25}{userData.Account_activated}");
                                Console.WriteLine("\nROLLER:");
                                // Loop through "ROLES:"
                                foreach (string role in userData.Roles)
                                {
                                    // When no roles there yet, jump out of foreach Loop
                                    if (userData.Roles.Count == 0)
                                    {
                                        Console.WriteLine("Inga roller tilldelade ännu!");
                                        break;
                                    }

                                    // Otherwise loop through foreach Loop, by grabbing matching role in the matchRoles array
                                    string matchingRole = matchRoles.FirstOrDefault(matchRole => role.StartsWith(matchRole.Split('=')[0]));

                                    if (matchingRole != null)
                                    {
                                        // Grab its description after "="
                                        string roleDescription = matchingRole.Split('=')[1].Trim();

                                        // Output it plus the data variable name version of it within ()
                                        Console.Write($"{roleDescription,-25} ({matchingRole.Split('=')[0]})\n");
                                    }
                                    else // When not found in the array for some reason
                                    {
                                        Console.WriteLine("");
                                    }

                                }
                            }
                        }
                    
                    }
                }
                // Otherwise NOT OK so it will include error-property only
                else { 
                    // Parse the {error:} JSON
                    JObject errProp = JObject.Parse(strJSON);
                    string errVal = (string)errProp["error"];
                    Console.WriteLine(errorAPI + errVal);
                }

                // Inform that screen will clear after any key is pressed!
                Console.WriteLine("\n<Tryck valfri tangent för att rensa skärmen och skriva nytt kommando...>");
                Console.ReadKey();
                Console.Clear();
                Console.WriteLine(mainHeaderLoggedIn);
            }

            // We only end up here when typing ONLY "logout" (case-insensitive btw!)
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