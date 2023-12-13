using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace maka2207_projekt
{

        public class UserData
        {
            [JsonProperty("username")]
            public string Username { get; set; }

            [JsonProperty("useremail")]
            public string Useremail { get; set; }

            [JsonProperty("userfullname")]
            public string Userfullname { get; set; }

            [JsonProperty("access_token")]
            public string Access_token { get; set; }

            [JsonProperty("refresh_token")]
            public string Refresh_token { get; set; }

            [JsonProperty("account_blocked")]
            public string Account_blocked { get; set; }

            [JsonProperty("account_activated")]
            public string Account_activated { get; set; }

            [JsonProperty("roles")]
            public List<string> Roles { get; set; }

            [JsonProperty("last_login")]
            public string Last_login { get; set; }
        }
}
