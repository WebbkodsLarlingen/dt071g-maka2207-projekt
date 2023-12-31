﻿using System; // For everything!
using System.Net;
using System.Net.Http; // For httpClient class
using System.Threading.Tasks; // For Asynchronous behavior
using System.Text; // For using encodings
using System.Text.Json; // For JSON methods
using Newtonsoft.Json.Linq; //For Even Better JSON Methods

namespace maka2207_projekt
{
    internal class Login // Class that just allows you to login! And it is of type "Task" just so it can use async correctly!
    {
        public static async Task<(HttpClient httpClient, HttpClientHandler handler, bool loggedIn, bool serverOnline)> AttemptLogin(HttpClient httpClient, HttpClientHandler handler, bool loggedIn, bool serverOnline)
        {
           // Prepare variables and ask for input          
            string loginJSON = ""; string usernameAndpassword = ""; 
            string username = ""; string password = "";
            int firstSpacePos = 0;

            // Loop until break; is used
            while (true)
            {
                // Ask for input
                Console.Write(">");
                usernameAndpassword = Console.ReadLine();

                // Check that 
                if (usernameAndpassword.Contains(' ') && usernameAndpassword.Length >= 3)
                {
                    // Split username and password by finding the first whitespace and then split with substring
                    firstSpacePos = usernameAndpassword.IndexOf(' ');

                    // Check if the firstSpacePos is not first or last in string
                    if (firstSpacePos > 0 && firstSpacePos < usernameAndpassword.Length - 1)
                    {
                        username = usernameAndpassword.Substring(0, firstSpacePos);
                        password = usernameAndpassword.Substring(firstSpacePos + 1);
                        break; // break out of loop when all OK!
                    }
                }
                // Only shown when failed above
                Console.WriteLine("\u001b[31m[FEL]:\u001b[0m Separera användarnamn och lösenord med ett mellanslag!");
            }
            
            // INPUT VALID -> Split username and password by finding first whitespace and then split with substring
            firstSpacePos = usernameAndpassword.IndexOf(' ');
            username = usernameAndpassword.Substring(0, firstSpacePos); 
            password = usernameAndpassword.Substring(firstSpacePos+1);

            // Create JSON Body with those values
            loginJSON = @$"{{""username"": ""{username}"",""password"": ""{password}""}}"; // password in REST API is:superAdmin1337
            username = ""; // empty the string because of sensitive data
            password = ""; // empty the string because of sensitive data
            usernameAndpassword = ""; // empty the string because of sensitive data

            // Make the POST request to the endpoint http://localhost:5000/api/login
           try
            {
                HttpResponseMessage response = await httpClient.PostAsync("api/login", new StringContent(loginJSON, Encoding.UTF8, "application/json"));
                loginJSON = ""; // empty the string because of sensitive data
                                // When login was successful (only then do we receive 2XX status code!)
                if (response.IsSuccessStatusCode)
                {
                    // Grab cookies
                    var httpOnlyCookie = handler.CookieContainer.GetCookies(httpClient.BaseAddress);

                    // Read and display the content
                    string content = await response.Content.ReadAsStringAsync();

                    // Serialize & extract accessToken from the `response.Conent`
                    JObject jsonResponse = JObject.Parse(content);
                    string accessToken = jsonResponse["accessToken"].ToString();

                    // Insert into Header "Authorization" to be used for future HTTP requests
                    httpClient.DefaultRequestHeaders.Add("Authorization", "Bearer " + accessToken);

                    // If we managed to login then set to "true" and return the new connection + loggedIn=true
                    // THE NEW CONNECTION WILL ALSO HAVE THE httpOnly secure cookie neded for future REST API requests!
                    loggedIn = true; serverOnline = true;
                    return (httpClient, handler, loggedIn, serverOnline); // accessToken is used for real requests whereas httpOnly secure cookie just refreshes those!
                }
                // Otherwise we return some other status code (NOT 2XX)
                else
                {
                    // If we managed failed to login then set to "false" and return the new connection + loggedIn=false meaning the while loop will continue!
                    loggedIn = false; serverOnline = true;
                    return (httpClient, handler, loggedIn, serverOnline);
                }
            } 
            // Handle exceptions when REST API not online for whatever reasons
            catch (HttpRequestException ex)
            {
                loggedIn = false; serverOnline = false;
                return (httpClient, handler, loggedIn, serverOnline);
            }
            catch (Exception ex) {
                loggedIn = false; serverOnline = false;
                return (httpClient, handler, loggedIn, serverOnline);
            }
        }
    }
}

