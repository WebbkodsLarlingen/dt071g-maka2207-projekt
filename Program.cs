using System; // For everything!
using System.Net;
using System.Net.Http; // For httpClient class
using System.Threading.Tasks; // For Asynchronous behavior
using System.Text; // For using encodings
using System.Text.Json; // For JSON methods
using Newtonsoft.Json; // NuGet Dependency - For Even better JSON manipulation!
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
        static string[] matchRoles = { // To map & split on "=" when showing roles for user(s)
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
            // Set window size
            Console.WindowWidth = 230;
            Console.WindowHeight = 50;
            
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
            secretPassword = SecretPassword.TheSecretPassword(); // Class function that hides input

            // Check password
            if(secretPassword != "hemlis")
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

                // SHOW AVAILABLE COMMANDS!
                if(command.ToLower() == "help")
                {
                    Console.WriteLine("INSTRUKTIONER: Ett kommando i taget skrivs och sedan trycker du på ENTER/RETUR.");
                    Console.WriteLine($"{string.Empty,15}Skriv först kommandonamn, sedan eventuella parametrar vilket");
                    Console.WriteLine($"{string.Empty,15}visas nedan inuti<> men dessa skrivs inte med i faktiska kommandot.");
                    Console.WriteLine($"{string.Empty,15}Varje mellanslag efter kommandonamnet indikerar en ny parameter.");
                    Console.WriteLine($"{string.Empty,15}Du meddelas om antalet parametrar när du har angett fel antal.");
                    Console.WriteLine($"{string.Empty,15}||-tecknen inuti <> betyder vilka olika parametrar du kan ange.");
                    Console.WriteLine($"{string.Empty,15}Exempelvis `showuser` kan ta användarnamn eller dess e-postadress.");
                    Console.WriteLine($"{string.Empty,15}");
                    Console.WriteLine($"{string.Empty,15}'Blockera' vs 'Aktivera' = Förstnämnda låter dig logga in men du");
                    Console.WriteLine($"{string.Empty,15}meddelas att ditt konto är blockerat. Sistnämnda låter dig inte");
                    Console.WriteLine($"{string.Empty,15}ens logga in utan du meddelas då redan vid inloggningsförsök!");
                    Console.WriteLine($"{string.Empty,15}");
                    Console.WriteLine($"{string.Empty,15}<sysadminpass> = du måste ange ditt lösenord för att få köra kommandot.");
                    Console.WriteLine($"{string.Empty,15}");
                    Console.WriteLine($"{string.Empty,15}Användare utloggad = deras åtkomst- och uppdateringsnycklar nollställs.");
                    Console.WriteLine("----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------");
                    Console.WriteLine($"{"KOMMANDOSYNTAX",-100}{"EXEMPEL",-75}{"VAD DEN GÖR"}");
                    Console.WriteLine($"{"showallusers",-100}{"showallusers",-75}{"Visar alla användarkonton"}");
                    Console.WriteLine($"{"showuser <username||useremail>",-100}{"showuser CoolDude",-75}{"Visar ett användarkonto"}");
                    Console.WriteLine($"{"blockuser <username>",-100}{"blockuser CoolDude",-75}{"Blockerar ett användarkonto"}");
                    Console.WriteLine($"{"unblockuser <username>",-100}{"unblockuser CoolDude",-75}{"Avblockerar ett användarkonto"}");
                    Console.WriteLine($"{"activateuser <username>",-100}{"activateuser CoolDude",-75}{"Aktiverar ett användarkonto"}");
                    Console.WriteLine($"{"deactivateuser <username>",-100}{"deactivateuser CoolDude",-75}{"Inaktiverar ett användarkonto"}");
                    Console.WriteLine($"{"logoutuser <username||useremail>",-100}{"logoutuser CoolDude@aidatorer.se",-75}{"Loggar ut ett användarkonto"}");
                    Console.WriteLine($"{"changeuser <username||useremail> <username||useremail||userpassword> <newvalue> <sysadminpass>",-100}{"changeuser CoolDude@aidatorer.se username CoolNotDude <sysadminpass>",-75}{"Ändrar användaruppgift för ett användarkonto"}");
                    Console.WriteLine($"{"adduser <username> <useremail> <userpassword>",-100}{"adduser CoolDude2 CoolDude2@aidatorer.se superbraLosen1337",-75}{"Skapar ett nytt användarkonto"}");
                    Console.WriteLine($"{"userroles <username||useremail> <add||delete> <roleToAddOrDelete> <sysadminpass>",-100}{"userroles CoolNotDude add get_images <sysadminpass>",-75}{"Lägger till/raderar en roll från ett användarkonto"}");
                    Console.WriteLine("----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------");
                    continue;
                }

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
                            // -35 = Left alignment for prettier data display
                            UserData userData = JsonConvert.DeserializeObject<UserData>(dataVal.ToString());
                            Console.WriteLine("---------------------------------------");
                            Console.WriteLine($" {"ANVÄNDARNAMN",-35}{"E-POST",-35}{"FULLSTÄNDIGT NAMN",-35}{"SENAST INLOGGAD"}");
                            Console.WriteLine($" {userData.Username,-35}{userData.Useremail,-35}{userData.Userfullname,-35}{userData.Last_login}");
                            Console.WriteLine($"\n {"ÅTKOMSTNYCKEL",-35}{"UPPDATERINGSNYCKEL",-35}{"KONTO BLOCKERAT?",-35}{"KONTO AKTIVERAT?"}");
                            Console.WriteLine($" {userData.Access_token.Substring(0, Math.Min(15, userData.Access_token.Length)),-35}{userData.Refresh_token.Substring(0, Math.Min(15, userData.Refresh_token.Length)),-35}{userData.Account_blocked,-35}{userData.Account_activated}");
                            // Loop through "ROLES:"
                            Console.WriteLine("\nROLLER:");
                            if(userData.Roles.Count == 0)
                            {
                                Console.WriteLine("Inga roller tilldelade ännu!");
                            }
                                
                            foreach (string role in userData.Roles)
                            {
                                // When no roles there yet, jump out of foreach Loop
                                if(userData.Roles.Count == 0)
                                {                              
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
                            // First show for EACH USER:USERNAME, USEREMAIl, USERFULLNAME, LAST_LOGIN, ACCOUNT_BLOCKED, ACCOUNT_ACTIVATED
                            Console.WriteLine("-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------");
                            Console.WriteLine($" {"ANVÄNDARNAMN",-35}{"E-POST",-35}{"FULLSTÄNDIGT NAMN",-35}{"SENAST INLOGGAD",-35}{"KONTO BLOCKERAT?",-35}{"KONTO AKTIVERAT?"}");
                            Console.WriteLine("-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------");
                            foreach (UserData userData in userList)
                            {
                                Console.WriteLine($" {userData.Username,-35}{userData.Useremail,-35}{userData.Userfullname,-35}{userData.Last_login,-35}{userData.Account_blocked,-35}{userData.Account_activated}");
                                Console.WriteLine("-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------");
                            }

                            // THEN SHOW PART OF ACCESS_TOKEN & REFRESH_TOKEN & all ROLES FOR EACH USER
                            Console.WriteLine("\n");
                            Console.WriteLine("-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------");
                            Console.WriteLine($" {"ANVÄNDARNAMN",-35}{"ÅTKOMSTNYCKEL",-35}{"UPPDATERINGSNYCKEL",-35}{"ROLLER"}");
                            Console.WriteLine("-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------");
                            foreach (UserData userData in userList) {
                                Console.Write($" {userData.Username,-35}{userData.Access_token.Substring(0, Math.Min(15, userData.Access_token.Length)),-35}{userData.Refresh_token.Substring(0, Math.Min(15, userData.Refresh_token.Length)),-35}");

                                // Show when there are no roles assigned!
                                if(userData.Roles.Count == 0) {
                                    Console.Write($"{"Inga roller tilldelade ännu!\n"}");
                                }
                                // Looping through roles
                                foreach (string role in userData.Roles)
                                {
                                    // When no roles there yet, jump out of foreach Loop
                                    if (userData.Roles.Count == 0)
                                    {                     
                                        break;
                                    }

                                    // Otherwise loop through foreach Loop, by grabbing matching role in the matchRoles array
                                    string matchingRole = matchRoles.FirstOrDefault(matchRole => role.StartsWith(matchRole.Split('=')[0]));

                                    if (matchingRole != null)
                                    {
                                        // Grab its description after "="
                                        string roleDescription = matchingRole.Split('=')[1].Trim();

                                        // After first -35 we do not need -105 to push all the way, so check if first.
                                        if(userData.Roles.IndexOf(role) == 0)
                                        { 
                                        Console.Write($"{roleDescription,-35} ({matchingRole.Split('=')[0]})\n");
                                        }
                                        // Output it plus the data variable name version of it within () (when on a new line)                                     
                                        Console.Write($"{"",-106}{roleDescription,-35} ({matchingRole.Split('=')[0]})\n");
                                    }
                                    else // When not found in the array for some reason
                                    {
                                        Console.Write("");
                                    }

                                }
                                Console.WriteLine("-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------");  
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
                Console.WriteLine("\n <Tryck valfri tangent för att rensa skärmen och skriva nytt kommando...>");
                Console.ReadKey();
                Console.Clear();
                Console.WriteLine(mainHeaderLoggedIn);
            }

            // We only end up here when typing ONLY "logout" (case-insensitive btw!)
            // ATTEMPT LOG OUT AFTER LEAVING MAIN WHILE-LOOP!
            (httpClient, handler, loggedOut) = await Logout.AttemptLogout(httpClient, handler, loggedOut);
            if(loggedOut == false)
            {
                Console.WriteLine(" Utloggning misslyckades! Din inloggningssession i databasen är kvar!");
            } 
            else 
            {
                Console.Clear();
                Console.WriteLine(mainHeader);
                Console.WriteLine( "Du är nu utloggad, käre Systemadministratör!"); 
            }
            Environment.Exit(0);
            // GOOD BYE C# CONSOLE APP! By: ©2023-2024 maka2207 / WebbKodsLärlingen
        }
    }
}