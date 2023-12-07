# maka2207-projekt

## KOMMA IG�NG

0. F�rbered MongoDB lokalt s� att anslutning mot "localhost:27017" fungerar.
1. Klona git repot lokalt.
2. I Visual Studio 2022 �ppna -> "Tools" -> NuGet Package Manager -> Package Manager Console. I den Terminalen, installera Newtonsoft.Json (13.0.3).
3. �ppna "nodejs"-mappen inuti VSCode f�r att kunna installera REST API:t och testdata lokalt! (finns INGET online).
4. Inuti VSCode med "nodejs"-mappen �ppen s� �ppna en ny Terminal och skriv `npm installall`.

## VAD �R DETTA?

Projektet �r en Console App-baserad KOMMANDOTOLK (CLI = Command-Line Interface) f�r Systemadministrat�r vid AI Datorer AB.

Via kommandotolken kan du:
- Administrera �ver anst�llda med olika beh�righeter som arbetar vid AI Datorer AB.
- Du kan blockera anv�ndare (de kan logga in men meddelas att deras konton �r l�sta).
- Du kan CRUD:a anv�ndare (utl�sa, skapa nya, �ndra och/eller radera befintliga).
- Du kan logga ut anv�ndare (genom att deras refresh token nollst�lls).
- Du kan �ndra anv�ndarnas beh�righeter till att CRUDa datorkomponenter i intran�tet.

## KOMMANDOTOLKENS SIMPLA SYNTAX
F�ljande kommandon g�ller efter lyckad inloggning som Systemadministrat�r.

* N�r det st�r `<>` s� betyder det att h�r kommer din paremeter in. Men parametrar skrivs utan de faktiska "<>"-tecknen.
* N�r det st�r `<?>` s� betyder det att denna parameter endast g�ller under vissa omst�ndigheter. Se exempelvis �ndra anv�ndares beh�righeter.
* N�r det st�r `<||>` s� kan du allts� skriva en av tv� olika parametrar, men bara en av dem.
* <sysadminPassword> betyder att du m�ste avsluta kommandot med ditt nuvarande systemadministrativa l�senord annars nekas kommandot.
* Beh�righeter anv�ndare kan tilldelas �r:"get_images","post_images","put_images","delete_images","get_components","post_components","put_components","delete_components".
* Observera att varje kommando skrivs i en och samma rad och parametrarna m�ste skrivas i den ordning de visas h�r nedanf�r!

Tillg�ngliga kommandon i AI Datorer AB:s Kommandotolk
-----------------------------------------------------
L�SA ANV�NDARE (GET USER)
- L�sa ut alla anv�ndare: `showallusers`
- L�sa ut specifik anv�ndare `showuser <userName||userEmail>` OBS: Sista kommandot ovanf�r h�r = Du kan allts� s�ka p� anv�ndare utifr�n anv�ndarnamn ELLER anv�ndarens e-post.

BLOCKERA ANV�NDARE (POST BLOCKUSER)
- Blockera specifik anv�ndare `blockuser <userName>`

SKAPA ANV�NDARE (POST USER)
- Skapa ny anv�ndare `adduser <userName> <userEmail> <userPassword>`

�NDRA ANV�NDARE (PUT USER)
- �ndra befintlig anv�ndare `changeuser <userName||userEmail||userPassword> <newValue> <sysadminPassword>`

RADERA ANV�NDARE (DELETE USER)
- Radera befintlig anv�ndare `deleteuser <userName||userEmail> <sysadminPassword>`

LOGGA UT ANV�NDARE (PUT USER)
- Logga ut befintlig anv�ndare `logoutuser <userName||userEmail>`

�NDRA ANV�NDARES BEH�RIGHETER (PUT USER)
- �ndra befintlig anv�ndares roller `userroles <userName||userEmail> <add||delete||change> <roleToAddOrDeleteOrChange> <?newValueOnlyWhenChangingARole> <sysadminPassword>`