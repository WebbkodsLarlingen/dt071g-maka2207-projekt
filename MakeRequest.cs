using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
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

            // Create HttpRequestMessage object
            var reqAll = new HttpRequestMessage
            {
                // Choose correct method by provided variable
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
            }








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
            // REST API - PUT /blockuser (JSON BODY { user:<username||useremail> })
            else if (apiStr == "/blockuser")
            {
                var req = new HttpRequestMessage
                {
                    Method = HttpMethod.Put,
                    RequestUri = new Uri("http://localhost:5000/api/blockuser"),
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
            // REST API - PUT /unblockuser (JSON BODY { user:<username||useremail> })
            else if (apiStr == "/unblockuser")
            {
                var req = new HttpRequestMessage
                {
                    Method = HttpMethod.Put,
                    RequestUri = new Uri("http://localhost:5000/api/unblockuser"),
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
            // REST API - PUT /changeuser (JSON BODY { username:<username> userprop:<username||useremail||userpassword> uservalue:<newvalue> password:<sysadminpass> })
            else if (apiStr == "/changeuser")
            {
                var req = new HttpRequestMessage
                {
                    Method = HttpMethod.Put,
                    RequestUri = new Uri("http://localhost:5000/api/changeuser"),
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
            // REST API - PUT /userroles (JSON BODY { user:<username||useremail> adddel:<add||delete> role:<get/put/delete/post-_images||-_components> password:<sysadminpass> })
            else if (apiStr == "/userroles")
            {
                var req = new HttpRequestMessage
                {
                    Method = HttpMethod.Put,
                    RequestUri = new Uri("http://localhost:5000/api/userroles"),
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
            // REST API - PUT /logoutuser (JSON BODY { user:<username||useremail> })
            else if (apiStr == "/logoutuser")
            {
                var req = new HttpRequestMessage
                {
                    Method = HttpMethod.Put,
                    RequestUri = new Uri("http://localhost:5000/api/logoutuser"),
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

            // REST API - GET /adduser (JSON BODY { user:<username||useremail>})
            else if (apiStr == "/adduser")
            {
                var req = new HttpRequestMessage
                {
                    Method = HttpMethod.Post,
                    RequestUri = new Uri("http://localhost:5000/api/adduser"),
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
            // REST API - DELETE /deleteuser (JSON BODY { user:<username||useremail> password:<sysadminpass> })
            else if (apiStr == "/deleteuser")
            {
                var req = new HttpRequestMessage
                {
                    Method = HttpMethod.Delete,
                    RequestUri = new Uri("http://localhost:5000/api/deleteuser"),
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

            resData = "<Detta borde inte visas. Kontakta den som kodat detta program!";
            resStatus = false;
            return (httpClient, handler, resData, resStatus);
        }
    }
}
