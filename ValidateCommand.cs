using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace maka2207_projekt
{
    internal class ValidateCommand
    {
        // These static arrays are "one to one",
        // so "showallusers" has "/showallusers"
        // REST API endpoint with 0 params and
        // thus 0 (="") JSON properties to provide!
        
        static string[] commandList = // Available commands in AI Datorer AB CLI.
            {
            "showallusers",
            "showuser",
            "blockuser",
            "unblockuser",
            "adduser",
            "changeuser",
            "deleteuser",
            "logoutuser",
            "userroles",
            "activateuser",
            "deactivateuser"
        };
        static string[] apiEndpoint = // REST API Endpoints for each command
        {
            "/showallusers",
            "/showuser",
            "/blockuser",
            "/unblockuser",
            "/adduser",
            "/changeuser",
            "/deleteuser",
            "/logoutuser",
            "/userroles",
            "/activateuser",
            "/deactivateuser"
        };
        static string[] crudType = // Matching CRUD (GET,POST,PUT,DELETE) to correct api Endpoint
        {
            "get",
            "get",
            "put",
            "put",
            "post",
            "put",
            "delete",
            "put",
            "put",
            "put",
            "put",
         };
        static int[] paramsLength = // Number of params for each command
        {
            0, // showallusers
            1, // showuser
            1, // blockuser
            1, // unblockuser
            3, // adduser
            4, // changeuser
            2, // deleteuser
            1, // logoutuser
            4, // userroles
            1, // activateuser
            1, // deactivateuser
        };
        static string[] jsonParams = // JSON Properties needed for each command
        {
            "", // showallusers
            "user", // showuser
            "username", // blockuser
            "username", // unblockuser
            "username,useremail,userpassword", // adduser
            "username,userprop,uservalue,password", // changeuser
            "user,password", // deleteuser
            "user", // logoutuser
            "user,adddel,role,password", // userroles
            "user", // activateuser
            "user", // deactivateuser
        };

        // The actual Async Function Itself
        public static async Task<(string[] jsonProps, string[] paramValues, string apiEP, bool commandOK, string error, string crudType)> Validate(string command, bool commandOK)
        {
            // Split command from its possible params (by splitting ONLY on first ' ')
            string[] commandSplit = command.Split(new[] { ' ' }, 2);
            string commandParamsStr = "";

            // Store params if they exist in "commandParams", also remove unnecessary whitespace
            if(commandSplit.Length > 1) 
            { 
                commandParamsStr = commandSplit[1].Trim();
            }

            // If command doesn't exist
            if (!commandList.Contains(commandSplit[0].ToLower()))
            {
                commandOK = false;
                return (new string[0], new string[0], "", commandOK, "Kommandot '" + commandSplit[0] + "' finns ej!","");
            }

            // Grab array index of valid command, this is used to pick correct array element of remaining arrays!
            string validCommand = commandSplit[0].ToLower();
            int correctArrIndex = Array.IndexOf(commandList, validCommand);

            // If no index value is found
            if (correctArrIndex == -1)
            {
                commandOK = false;
                return (new string[0], new string[0], "", commandOK, "Kommandot '" + validCommand + "' kunde ej köras!","");
            }

            // If special case command "showallusers" has any params when it shouldn't
            if (commandSplit.Length > 1 && validCommand == "showallusers")
            {
                commandOK = false;
                return (new string[0], new string[0], "", commandOK, "Kommandot '" + validCommand + "' ska köras utan argument!","");
            }

            // If special case command exist with correct params length which should be 0
            if (commandSplit.Length == 1 && validCommand == "showallusers")
            {
                commandOK = true;
                return (new string[0], new string[0], apiEndpoint[correctArrIndex], commandOK, "", crudType[correctArrIndex]);
            }
            
            // Store params and JSON Properties in their respective arrays | IMPORTANT: paramValues will always have at least 1 element even if it's empty!
            string[] paramValues = commandParamsStr.Split(' ');
            string[] jsonProps = jsonParams[correctArrIndex].Split(',');

            // Check against correct number of params provided for API endpoints. Special case is providing 0 length in only first param which is possible but invalid
            if (paramValues.Length != paramsLength[correctArrIndex] || paramValues[0].Length < 1) 
            {
                commandOK = false;
                return (new string[0], new string[0], "", commandOK, "Kommandot '" + validCommand + "' ska köras med "+ paramsLength[correctArrIndex] +  " argument!","");
            }

            //  Here all is OK, so send back array of JSON Properties, array of their values, /api/{endpoint} string, true boolean, no error message, and correct HttpMethod
            commandOK = true;
            return (jsonProps, paramValues, apiEndpoint[correctArrIndex], commandOK, "", crudType[correctArrIndex]);
        }
    }
}
