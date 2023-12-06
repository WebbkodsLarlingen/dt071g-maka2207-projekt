﻿using System; // For everything!
using System.Net;
using System.Net.Http; // For httpClient class
using System.Threading.Tasks; // For Asynchronous behavior
using System.Text; // For using encodings
using System.Text.Json; // For JSON methods

namespace maka2207_projekt
{
    internal class Login // Class that just allows you to login! And it is of type "Task" just so it can use async correctly!
    {
        public static async Task<(HttpClient httpClient, HttpClientHandler handler, bool loggedIn)> AttemptLogin(HttpClient httpClient, HttpClientHandler handler, bool loggedIn)
        {
           // Show that you should login and prepare variables for to store.          
            string loginJSON = "";
            string usernameAndpassword = "";
            string username = "";
            string password = "";
            usernameAndpassword = Console.ReadLine(); // true = allow whitespace when typing

            // Split username and password
            string[] loginDetails = usernameAndpassword.Split(' ');

            // Check at exactly both (no more or less) has been provided
            if (loginDetails.Length == 2)
            {
                username = loginDetails[0];
                password = loginDetails[1];


            }

            // Create JSON Body with those values
            loginJSON = @$"{{""username"": ""{username}"",""password"": ""{password}""}}"; // password in REST API is:superAdmin1337
            username = ""; // empty the string because of sensitive data
            password = ""; // empty the string because of sensitive data

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
                    //secretCookie = cookie.Value;            
                }

                // Read and display the content
                string content = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"API Response: {content}");
                // If we managed to login then set to "true" and return the new connection + loggedIn=true
                // THE NEW CONNECTION WILL ALSO HAVE THE httpOnly secure cookie neded for future REST API requests!
                loggedIn = true;
                return (httpClient, handler, loggedIn);
            }
            // Otherwise we return some other status code (NOT 2XX)
            else
            {
                // Show error and loop again until logged in!
                Console.WriteLine("Användarnamn och/eller lösenord felaktigt!");
                // If we managed failed to login then set to "false" and return the new connection + loggedIn=false meaning the while loop will continue!
                loggedIn = false;
                return (httpClient, handler, loggedIn);
            }

        }
    }
}
