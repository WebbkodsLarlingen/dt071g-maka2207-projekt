using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace maka2207_projekt
{
    internal class SecretPassword // Class to hide when writing sensitive things!
    {
        public static string TheSecretPassword() // Static function (=no instantiation needed)
        {
            // Store in string to return back when pressing ENTER/RETURN
            string password = "";
            ConsoleKeyInfo key;

            do
            {
                // Read each key press
                key = Console.ReadKey(true);

                // Only allow printable characters to be included (if allowWhiteSpace = true then allow middle space key!)
                if (char.IsLetterOrDigit(key.KeyChar) || char.IsSymbol(key.KeyChar))
                {
                    // Add to password but only show * instead!
                    password += key.KeyChar;
                    Console.Write("*"); 
                }
                // Remove one character from password if pressing BACKSPACE
                else if (key.Key == ConsoleKey.Backspace && password.Length > 0)
                {
                    // Subtract 1 from password while not being empty and also do it in the Console
                    password = password.Substring(0, password.Length - 1);
                    Console.Write("\b \b");
                }
                // Keep looping until Enter is pressed!
            } while (key.Key != ConsoleKey.Enter);

            // then return the password to be processed
            return password;
        }
    }
}
