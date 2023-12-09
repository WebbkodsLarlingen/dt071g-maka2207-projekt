# maka2207-projekt

# VIKTIGT: Ja, du ska _ALDRIG_ ladda upp `.env` (inuti nodejs-mappen i detta repo). Detta �r bara f�r "angel�genhetens skull" denna g�ng.

## KOMMA IG�NG

0. F�rbered MongoDB lokalt s� att anslutning mot "localhost:27017" fungerar, dvs., att MongoDB-servern k�rs utan att n�gon m�ste logga in f�r att komma �t den lokalt.
1. Klona git repot lokalt.
2. I Visual Studio 2022 �ppna -> "Tools" -> NuGet Package Manager -> Package Manager Console. I den Terminalen, installera `Newtonsoft.Json (13.0.3)`.
3. �ppna "nodejs"-mappen inuti VSCode f�r att kunna installera REST API:t och testdata lokalt! (finns INGET online).
4. Inuti VSCode med "nodejs"-mappen �ppen �ppna en ny Terminal och skriv `npm run installall`. Allt installeras, MongoDB fylls med demodata och `localhost:5000` REST API-server startas.
5. Klart! Nu kan du 'Build & Run' `maka2207-projekt` inuti Visual Studio 2022.
	
	**OBS:** `npmrun installall` �r ett s� kallat `batch job` s� du kan beh�va k�ra `npm run startserver` om localhost:5000 REST API slutar svara ibland p� pga. Terminal VSCode-bug.

## VAD �R DETTA?

Projektet �r en Console App-baserad KOMMANDOTOLK (CLI = Command-Line Interface) f�r Systemadministrat�r vid AI Datorer AB.

Via kommandotolken kan du:
- Administrera �ver anst�llda med olika beh�righeter som arbetar vid AI Datorer AB.
- Du kan blockera anv�ndare (de kan logga in men meddelas att deras konton �r l�sta).
- Du kan CRUD:a anv�ndare (utl�sa, skapa nya, �ndra och/eller radera befintliga).
- Du kan logga ut anv�ndare (genom att deras refresh token nollst�lls).
- Du kan �ndra anv�ndarnas beh�righeter till att CRUDa datorkomponenter i intran�tet.

### SNABBA INLOGGNINGSUPPGIFTER
(allt utan parentser)

- "hemlis" �r l�senordet innan du ens kan f�rs�ka logga in mot lokalt REST API!
- "sysadmin" �r anv�ndarnamnet vid inloggning
- "superAdmin1337" �r l�senordet vid inloggning (samt f�r vissa kommandon av s�kerhetssk�l)

## KOMMANDOTOLKENS SIMPLA SYNTAX
F�ljande kommandon g�ller efter lyckad inloggning som Systemadministrat�r.

* N�r det st�r `<>` s� betyder det att h�r kommer din paremeter in. Men parametrar skrivs utan de faktiska "<>"-tecknen.
* N�r det st�r `<||>` s� kan du allts� skriva en av tv� olika parametrar, men bara en av dem.
* <sysadminPassword> betyder att du m�ste avsluta kommandot med ditt nuvarande systemadministrativa l�senord annars nekas kommandot.
* Beh�righeter anv�ndare kan tilldelas �r f�ljande (du skriver ej citattecken eller komman och du kan bara CRUDa en roll i taget per anv�ndare): 
  - `"get_images", "post_images", "put_images", "delete_images", "get_components", "post_components", "put_components", "delete_components"`.
* Observera att vissa kommandon kr�ver att du �ven matar in ditt l�senord igen annars kommer kommandot att nekas trots att skulle ha g�tt igenom!
* Observera att varje kommando skrivs i en och samma rad och parametrarna m�ste skrivas i den ordning de visas h�r nedanf�r!

Tillg�ngliga kommandon i AI Datorer AB:s Kommandotolk
-----------------------------------------------------
**L�SA ANV�NDARE (GET USER)**
- L�sa ut alla anv�ndare: `showallusers`

		- Exempel: `showallusers` (visar alla anv�ndare fr�n MongoDB)

- L�sa ut specifik anv�ndare `showuser <userName||userEmail>` 
	
		- Exempel: `showuser testUser1` (visar anv�ndaren med anv�ndarnamnet:"testUser1")
		- Exempel: `showuser test@mejl.nu` (visar anv�ndaren med e-post:"test@mejl.nu")

**(AV)BLOCKERA ANV�NDARE (PUT BLOCKUSER)**
- Blockera specifik anv�ndare `blockuser <userName>`
	
		- Exempel: `blockuser testUser1` (blockerar anv�ndaren som har anv�ndarnamnet:"testUser1")

- Avblockera specifik anv�ndare `unblock <userName>`
	
		- Exempel: `unblockuser testUser1` (avblockerar anv�ndaren som har anv�ndarnamnet:"testUser1")

**SKAPA ANV�NDARE (POST USER)**
- Skapa ny anv�ndare `adduser <userName> <userEmail> <userPassword>`
	
		- Exempel: `adduser testUser2 test2@mejl.nu testUserPassword1337` (skapar anv�ndare med anv�ndarnamn:"testUser2",e-post:"test2@mejl.nu",l�senord:"testUserPassword1337")

**�NDRA ANV�NDARE (PUT USER)**
- �ndra befintlig anv�ndare `changeuser <userName||userEmail> <userName||userEmail||userPassword> <newValue> <sysadminPassword>`
	
		- Exempel: `changeuser testUser1 username testUser3 superAdmin1337` (�ndrar userName1's anv�ndarnamn -> userName3)
		- Exempel: `changeuser testUser1 useremail test3@mejl.nu superAdmin1337` (�ndrar userName1's e-post -> test3@mejl.nu)
		- Exempel: `changeuser testUser1 userpassword testUserPassword420 superAdmin1337` (�ndrar userName1's l�senord)

**RADERA ANV�NDARE (DELETE USER)**
- Radera befintlig anv�ndare `deleteuser <userName||userEmail> <sysadminPassword>`
	
		- Exempel: `deleteuser testUser1 superAdmin1337` (raderar anv�ndaren med anv�ndarnamnet "testUser1")
		- Exempel: `deleteuser test@mejl.nu superAdmin1337` (raderar anv�ndaren med e-post "test@mejl.nu")

**LOGGA UT ANV�NDARE (PUT USER)**
- Logga ut befintlig anv�ndare `logoutuser <userName||userEmail>` (dvs., t�mma deras tokens)
	
		- Exempel: `logoutuser testUser1` (t�mmer tokens f�r anv�ndaren med anv�ndarnamn:"testuser1")
		- Exempel: `logoutuser test@mejl.nu` (t�mmer tokens f�r anv�ndaren med e-post:"test@mejl.nu")

**�NDRA ANV�NDARES BEH�RIGHETER (PUT USER)**
- �ndra befintlig anv�ndares roller `userroles <userName||userEmail> <add||delete> <roleToAddOrDelete> <sysadminPassword>`
	
		- Exempel: `userroles testUser1 add get_images superAdmin1337` (ger anv�ndaren med anv�ndarnamnet "testUser1" l�sbeh�righeter av bilder i intran�tet)
		- Exempel: `userroles testUser1 add add_images superAdmin1337` (ger anv�ndaren med anv�ndarnamnet "testUser1" beh�righet att l�gga till bilder i intran�tet)
		- Exempel: `userroles testUser1 add delete_images superAdmin1337` (ger anv�ndaren med anv�ndarnamnet "testUser1" beh�righet att radera bilder i intran�tet)
		- Exempel: `userroles test@mejl.nu delete delete_images superAdmin1337` (tar bort raderingsbeh�righeter av bilder i intran�tet f�r anv�ndaren med e-post:"test@mejl.nu")