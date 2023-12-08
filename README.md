# maka2207-projekt

# VIKTIGT: Ja, du ska _ALDRIG_ ladda upp `.env` (inuti nodejs-mappen i detta repo). Detta är bara för "angelägenhetens skull" denna gång.

## KOMMA IGÅNG

0. Förbered MongoDB lokalt så att anslutning mot "localhost:27017" fungerar, dvs., att MongoDB-servern körs utan att någon måste logga in för att komma åt den lokalt.
1. Klona git repot lokalt.
2. I Visual Studio 2022 öppna -> "Tools" -> NuGet Package Manager -> Package Manager Console. I den Terminalen, installera Newtonsoft.Json (13.0.3).
3. Öppna "nodejs"-mappen inuti VSCode för att kunna installera REST API:t och testdata lokalt! (finns INGET online).
4. Inuti VSCode med "nodejs"-mappen öppen så öppna en ny Terminal och skriv `npm install` & sedan `npm run installmongodb`. Starta sedan lokal REST API:t med `npm run startserver`.
5. Klart! Nu kan du 'Build & Run' `maka2207-projekt` inuti Visual Studio 2022.

## VAD ÄR DETTA?

Projektet är en Console App-baserad KOMMANDOTOLK (CLI = Command-Line Interface) för Systemadministratör vid AI Datorer AB.

Via kommandotolken kan du:
- Administrera över anställda med olika behörigheter som arbetar vid AI Datorer AB.
- Du kan blockera användare (de kan logga in men meddelas att deras konton är låsta).
- Du kan CRUD:a användare (utläsa, skapa nya, ändra och/eller radera befintliga).
- Du kan logga ut användare (genom att deras refresh token nollställs).
- Du kan ändra användarnas behörigheter till att CRUDa datorkomponenter i intranätet.

### SNABBA INLOGGNINGSUPPGIFTER
(allt utan parentser)

- "hemlis" är lösenordet innan du ens kan försöka logga in mot lokalt REST API!
- "sysadmin" är användarnamnet vid inloggning
- "superAdmin1337" är lösenordet vid inloggning (samt för vissa kommandon av säkerhetsskäl)

## KOMMANDOTOLKENS SIMPLA SYNTAX
Följande kommandon gäller efter lyckad inloggning som Systemadministratör.

* När det står `<>` så betyder det att här kommer din paremeter in. Men parametrar skrivs utan de faktiska "<>"-tecknen.
* När det står `<||>` så kan du alltså skriva en av två olika parametrar, men bara en av dem.
* <sysadminPassword> betyder att du måste avsluta kommandot med ditt nuvarande systemadministrativa lösenord annars nekas kommandot.
* Behörigheter användare kan tilldelas är följande (du skriver ej citattecken eller komman och du kan bara CRUDa en roll i taget per användare): 
  - `"get_images", "post_images", "put_images", "delete_images", "get_components", "post_components", "put_components", "delete_components"`.
* Observera att vissa kommandon kräver att du även matar in ditt lösenord igen annars kommer kommandot att nekas trots att skulle ha gått igenom!
* Observera att varje kommando skrivs i en och samma rad och parametrarna måste skrivas i den ordning de visas här nedanför!

Tillgängliga kommandon i AI Datorer AB:s Kommandotolk
-----------------------------------------------------
**LÄSA ANVÄNDARE (GET USER)**
- Läsa ut alla användare: `showallusers`

		- Exempel: `showallusers` (visar alla användare från MongoDB)

- Läsa ut specifik användare `showuser <userName||userEmail>` 
	
		- Exempel: `showuser testUser1` (visar användaren med användarnamnet:"testUser1")
		- Exempel: `showuser test@mejl.nu` (visar användaren med e-post:"test@mejl.nu")

**(AV)BLOCKERA ANVÄNDARE (POST BLOCKUSER)**
- Blockera specifik användare `blockuser <userName>`
	
		- Exempel: `blockuser testUser1` (blockerar användaren som har användarnamnet:"testUser1")

- Avblockera specifik användare `unblock <userName>`
	
		- Exempel: `unblockuser testUser1` (avblockerar användaren som har användarnamnet:"testUser1")

**SKAPA ANVÄNDARE (POST USER)**
- Skapa ny användare `adduser <userName> <userEmail> <userPassword>`
	
		- Exempel: `adduser testUser2 test2@mejl.nu testUserPassword1337` (skapar användare med användarnamn:"testUser2",e-post:"test2@mejl.nu",lösenord:"testUserPassword1337")

**ÄNDRA ANVÄNDARE (PUT USER)**
- Ändra befintlig användare `changeuser <userName||userEmail> <userName||userEmail||userPassword> <newValue> <sysadminPassword>`
	
		- Exempel: `changeuser testUser1 username testUser3 superAdmin1337` (ändrar userName1's användarnamn -> userName3)
		- Exempel: `changeuser testUser1 useremail test3@mejl.nu superAdmin1337` (ändrar userName1's e-post -> test3@mejl.nu)
		- Exempel: `changeuser testUser1 userpassword testUserPassword420 superAdmin1337` (ändrar userName1's lösenord)

**RADERA ANVÄNDARE (DELETE USER)**
- Radera befintlig användare `deleteuser <userName||userEmail> <sysadminPassword>`
	
		- Exempel: `deleteuser testUser1 superAdmin1337` (raderar användaren med användarnamnet "testUser1")
		- Exempel: `deleteuser test@mejl.nu superAdmin1337` (raderar användaren med e-post "test@mejl.nu")

**LOGGA UT ANVÄNDARE (PUT USER)**
- Logga ut befintlig användare `logoutuser <userName||userEmail>` (dvs., tömma deras tokens)
	
		- Exempel: `logoutuser testUser1` (tömmer tokens för användaren med användarnamn:"testuser1")
		- Exempel: `logoutuser test@mejl.nu` (tömmer tokens för användaren med e-post:"test@mejl.nu")

**ÄNDRA ANVÄNDARES BEHÖRIGHETER (PUT USER)**
- Ändra befintlig användares roller `userroles <userName||userEmail> <add||delete> <roleToAddOrDelete> <sysadminPassword>`
	
		- Exempel: `userroles testUser1 add get_images superAdmin1337` (ger användaren med användarnamnet "testUser1" läsbehörigheter av bilder i intranätet)
		- Exempel: `userroles testUser1 add add_images superAdmin1337` (ger användaren med användarnamnet "testUser1" behörighet att lägga till bilder i intranätet)
		- Exempel: `userroles testUser1 add delete_images superAdmin1337` (ger användaren med användarnamnet "testUser1" behörighet att radera bilder i intranätet)
		- Exempel: `userroles test@mejl.nu delete delete_images superAdmin1337` (tar bort raderingsbehörigheter av bilder i intranätet för användaren med e-post:"test@mejl.nu")
