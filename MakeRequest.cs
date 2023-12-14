using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text; // For using encodings
using System.Text.Json; // For JSON methods
using System.Threading.Tasks;

namespace maka2207_projekt
{
    internal class MakeRequest
    {
        public static async Task<(HttpClient httpClient, HttpClientHandler handler, string resData, bool restatus)> MakeCRUDRequest(HttpClient httpClient, HttpClientHandler handler, string apiStr, string jsonString, string methodType)
        {
            // bool is whether Response Code is OK or not | resData includes actual JSON response
            bool resStatus = false;
            string resData = "";

            try
            {
            // Create HttpRequestMessage object
            var reqAll = new HttpRequestMessage
            {
                // Choose correct HttpMethod by provided variable
                Method = methodType == "get" ? HttpMethod.Get :
                         methodType == "post" ? HttpMethod.Post :
                         methodType == "put" ? HttpMethod.Put : HttpMethod.Delete,
                // Set correct REST API Endpoint by provided string variable
                RequestUri = new Uri("http://localhost:5000/api" + apiStr),
                // Finally set any possible JSON Body data
                Content = new StringContent(jsonString, Encoding.UTF8, "application/json")
            };

            // Make request
            var resAll = await httpClient.SendAsync(reqAll);

            // Handle status code and return either OK with JSON
            if (resAll.IsSuccessStatusCode)
            {
                string responseContent = await resAll.Content.ReadAsStringAsync();
                resData = responseContent; resStatus = true;
                return (httpClient, handler, resData, resStatus);
            }
            // Or NOT OK with JSON
            else
            {
                string responseContent = await resAll.Content.ReadAsStringAsync();
                resData = responseContent; resStatus = false;
                return (httpClient, handler, resData, resStatus);
            }} catch (Exception ex)// Catch any possible errors raised and just say it failed talking to the REST API
                {
                    resStatus =false;
                    // To avoid ambiguity with Newtonsoft.JSON
                    resData = System.Text.Json.JsonSerializer.Serialize(new {error = "Misslyckades kommunicera med REST API:t. Prova igen!"});
                    return (httpClient, handler, resData, resStatus);
                }
            ///////////////////////////////////////////////////////////////////////////
            // OLDER "LEGACY VERSIONS" (just a few hours old!) <- EASTER EGGS!!!!!!!!!
            // REST API - GET /showallusers (JSON BODY {})
            if (apiStr == "/showallusers")
            {
                HttpResponseMessage res = await httpClient.GetAsync("api" + apiStr);
                if (res.IsSuccessStatusCode)
                {
                    string responseContent = await res.Content.ReadAsStringAsync();   
                    resData = responseContent; resStatus = true;
                    return (httpClient, handler, resData, resStatus);
                }
                else
                {
                    string responseContent = await res.Content.ReadAsStringAsync();
                    resData = responseContent; resStatus = false;
                    return (httpClient, handler, resData, resStatus);
                }
            }
            // REST API - GET /showuser (JSON BODY { user:<username||useremail> })
            else if (apiStr == "/showuser")
            {
                var req = new HttpRequestMessage
                {
                    Method = HttpMethod.Get,
                    RequestUri = new Uri("http://localhost:5000/api/showuser"),
                    Content = new StringContent(jsonString, Encoding.UTF8, "application/json")
                };

                var res = await httpClient.SendAsync(req);

                if (res.IsSuccessStatusCode)
                {
                    string responseContent = await res.Content.ReadAsStringAsync();
                    resData = responseContent; resStatus = true;
                    return (httpClient, handler, resData, resStatus);
                }
                else
                {
                    string responseContent = await res.Content.ReadAsStringAsync();
                    resData = responseContent; resStatus = false;
                    return (httpClient, handler, resData, resStatus);
                }
            }       
            // When the impossible happens!
            resData = "<Detta borde inte visas. Kontakta den som kodat detta program!";
            resStatus = false;
            return (httpClient, handler, resData, resStatus);
        }
    }
}
