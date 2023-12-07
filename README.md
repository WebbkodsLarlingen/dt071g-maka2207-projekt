# maka2207-projekt

## KOMMA IGÅNG

0. Förbered MongoDB lokalt så att anslutning mot "localhost:27017" fungerar.
1. Klona git repot lokalt.
2. I Visual Studio 2022 öppna -> "Tools" -> NuGet Package Manager -> Package Manager Console. I den Terminalen, installera Newtonsoft.Json (13.0.3).
3. Öppna "nodejs"-mappen inuti VSCode för att kunna installera REST API:t och testdata lokalt! (finns INGET online).
4. Inuti VSCode med "nodejs"-mappen öppen så öppna en ny Terminal och skriv `npm installall`.

## VAD ÄR DETTA?

Projektet är en Console App-baserad KOMMANDOTOLK (CLI = Command-Line Interface) för Systemadministratör vid AI Datorer AB.

Via kommandotolken kan du:
- Administrera över anställda med olika behörigheter som arbetar vid AI Datorer AB.
- Du kan blockera användare (de kan logga in men meddelas att deras konton är låsta).
- Du kan CRUD:a användare (utläsa, skapa nya, ändra och/eller radera befintliga).
- Du kan logga ut användare (genom att deras refresh token nollställs).
- Du kan ändra användarnas behörigheter till att CRUDa datorkomponenter i intranätet.

## KOMMANDOTOLKENS SIMPLA SYNTAX
Följande kommandon gäller efter lyckad inloggning som Systemadministratör.

* När det står `<>` så betyder det att här kommer din paremeter in. Men parametrar skrivs utan de faktiska "<>"-tecknen.
* När det står `<?>` så betyder det att denna parameter endast gäller under vissa omständigheter. Se exempelvis ändra användares behörigheter.
* När det står `<||>` så kan du alltså skriva en av två olika parametrar, men bara en av dem.
* <sysadminPassword> betyder att du måste avsluta kommandot med ditt nuvarande systemadministrativa lösenord annars nekas kommandot.
* Behörigheter användare kan tilldelas är:"get_images","post_images","put_images","delete_images","get_components","post_components","put_components","delete_components".
* Observera att varje kommando skrivs i en och samma rad och parametrarna måste skrivas i den ordning de visas här nedanför!

Tillgängliga kommandon i AI Datorer AB:s Kommandotolk
-----------------------------------------------------
LÄSA ANVÄNDARE (GET USER)
- Läsa ut alla användare: `showallusers`
- Läsa ut specifik användare `showuser <userName||userEmail>` OBS: Sista kommandot ovanför här = Du kan alltså söka på användare utifrån användarnamn ELLER användarens e-post.

BLOCKERA ANVÄNDARE (POST BLOCKUSER)
- Blockera specifik användare `blockuser <userName>`

SKAPA ANVÄNDARE (POST USER)
- Skapa ny användare `adduser <userName> <userEmail> <userPassword>`

ÄNDRA ANVÄNDARE (PUT USER)
- Ändra befintlig användare `changeuser <userName||userEmail||userPassword> <newValue> <sysadminPassword>`

RADERA ANVÄNDARE (DELETE USER)
- Radera befintlig användare `deleteuser <userName||userEmail> <sysadminPassword>`

LOGGA UT ANVÄNDARE (PUT USER)
- Logga ut befintlig användare `logoutuser <userName||userEmail>`

ÄNDRA ANVÄNDARES BEHÖRIGHETER (PUT USER)
- Ändra befintlig användares roller `userroles <userName||userEmail> <add||delete||change> <roleToAddOrDeleteOrChange> <?newValueOnlyWhenChangingARole> <sysadminPassword>`