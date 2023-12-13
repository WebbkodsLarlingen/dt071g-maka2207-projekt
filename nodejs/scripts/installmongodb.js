require("dotenv").config();
// Store MongoDB module & hasing password module (bcrypt)
const { MongoClient, UUID } = require("mongodb");
const bcrypt = require("bcrypt");

// Run the async function
installMongoDB();

// Async function to run
async function installMongoDB() {
  // Names of connection URL, Database and Collection
  const url = "mongodb://localhost:27017"; // Localhost MongoDB Connection URL
  const dbName = process.env.MONGO_DB; // Name of entire Database
  const dbCol1 = process.env.MONGO_DB_COL_PCCOMPONENTS; // For CRUD of inventory of PC components
  const dbCol2 = process.env.MONGO_DB_COL_USERS; // Users when Register and Login
  const dbCol3 = process.env.MONGO_DB_COL_BLACKLIST; // Banned IP addresses as safety measure

  // Bcrypt-hashed password for testuser1 & admin using 10 rounds of salting
  // Need to use await or it will not have time to hash it before trying to insert it!
  const hashedPwTestUser = await bcrypt.hash(
    process.env.MONGO_TESTDATA_TESTUSERPW,
    10
  );

  // More test data!
  const hashedPwTestUser2 = await bcrypt.hash("testUser2Password", 10);
  const hashedPwTestUser3 = await bcrypt.hash("testUser3Password", 10);
  const hashedPwTestUser4 = await bcrypt.hash("testUser4Password", 10);
  const hashedPwTestUser5 = await bcrypt.hash("testUser5Password", 10);
  const hashedPwTestUser6 = await bcrypt.hash("testUser6Password", 10);
  const hashedPwTestUser7 = await bcrypt.hash("testUser7Password", 10);
  const hashedPwTestUser8 = await bcrypt.hash("testUser8Password", 10);
  const hashedPwTestUser9 = await bcrypt.hash("testUser9Password", 10);
  const hashedPwTestUser10 = await bcrypt.hash("testUser10Password", 10);

  const hashedPwAdmin = await bcrypt.hash(
    process.env.MONGO_TESTDATA_ADMINPW,
    10
  );

  // Data to insertMany() with
  // PC Components and links to their images on the server-side
  const pccomponentsData = [
    {
      componentid: 1,
      componentName: "AMD Ryzen Threadripper PRO 5995WX 2.7GHz 292MB",
      componentDescription:
        "Extrem kraft med 64 kärnor - Gör allt, på en och samma gång. Rendera. Streama. Kompilera. Jobba och spela. Det är den ultimata plattformen för kreatörer, med 64 kärnor och 128 PCIe 4.0-lanes.",
      componentPrice: 79990,
      componentAmount: 1,
      componentStatus: "Ny",
      componentCategories: ["Processor"],
      componentImages: [
        "AMD_Ryzen_Threadripper_PRO_5995WX_2.7GHz_292MB-1.webp",
        "AMD_Ryzen_Threadripper_PRO_5995WX_2.7GHz_292MB-2.webp",
        "AMD_Ryzen_Threadripper_PRO_5995WX_2.7GHz_292MB-3.webp",
        "AMD_Ryzen_Threadripper_PRO_5995WX_2.7GHz_292MB-4.webp",
      ],
    },
    {
      componentid: 2,
      componentName: "ASUS GeForce RTX 4090 24GB ROG Strix Gaming OC White",
      componentDescription:
        "RTX 4000-grafikkort - GeForce RTX 4090 är det överlägset kraftfullaste grafikkortet genom tiderna. Det är flaggskeppet i den nya, banbrytande Ada Lovelace-arkitekturen och bjuder på aldrig tidigare skådad prestanda, med upp till två gånger så hög prestanda och energieffektivitet som RTX 3090 Ti.",
      componentPrice: 27490,
      componentAmount: 0,
      componentStatus: "Ny",
      componentCategories: ["Grafikkort"],
      componentImages: [
        "ASUS_GeForce_RTX_4090_24GB_ROG_Strix_Gaming_OC_White-1.webp",
        "ASUS_GeForce_RTX_4090_24GB_ROG_Strix_Gaming_OC_White-2.webp",
        "ASUS_GeForce_RTX_4090_24GB_ROG_Strix_Gaming_OC_White-3.webp",
      ],
    },
    {
      componentid: 3,
      componentName: "ASUS GeForce RTX 4090 24GB TUF Gaming OG OC",
      componentDescription:
        "OG-modell av RTX 4090 - GeForce RTX 4090 är det överlägset kraftfullaste grafikkortet genom tiderna. Det är flaggskeppet i den nya, banbrytande Ada Lovelace-arkitekturen och bjuder på aldrig tidigare skådad prestanda, med upp till två gånger så hög prestanda och energieffektivitet som RTX 3090 Ti.",
      componentPrice: 23999,
      componentAmount: 6,
      componentStatus: "Ny",
      componentCategories: ["Grafikkort"],
      componentImages: [
        "ASUS_GeForce_RTX_4090_24GB_TUF_Gaming_OG_OC-1.webp",
        "ASUS_GeForce_RTX_4090_24GB_TUF_Gaming_OG_OC-2.webp",
        "ASUS_GeForce_RTX_4090_24GB_TUF_Gaming_OG_OC-3.webp",
      ],
    },
    {
      componentid: 4,
      componentName: "ASUS ROG Balteus QI",
      componentDescription:
        "Musmatta med RGB och Qi - ROG Balteus RGB är en gamingmusmatta med hård och optimerad spårningsyta. Den är utrustad med 15-zoners individuellt anpassningsbar Aura Sync-belysning och USB-passthrough. Dessutom stödjer den laddning via Qi.",
      componentPrice: 899,
      componentAmount: 12,
      componentStatus: "Ny",
      componentCategories: ["Kringutrustning", "Musmatta"],
      componentImages: [
        "ASUS_ROG_Balteus_QI-1.webp",
        "ASUS_ROG_Balteus_QI-2.webp",
        "ASUS_ROG_Balteus_QI-3.webp",
        "ASUS_ROG_Balteus_QI-4.webp",
      ],
    },
    {
      componentid: 5,
      componentName: "ASUS ROG Maximus Z790 Hero EVA-02",
      componentDescription:
        "Evangelion-moderkort - Toppmodern Intel-plattform redo för 13th gen processorer. Obs! BIOS kan behöva uppdateras för att användas med 14th gen CPU.",
      componentPrice: 10790,
      componentAmount: 0,
      componentStatus: "Ny",
      componentCategories: ["Moderkort"],
      componentImages: [
        "ASUS_ROG_Maximus_Z790_Hero_EVA-02-1.webp",
        "ASUS_ROG_Maximus_Z790_Hero_EVA-02-2.webp",
        "ASUS_ROG_Maximus_Z790_Hero_EVA-02-3.webp",
      ],
    },
    {
      componentid: 6,
      componentName: "ASUS ROG Strix Hyperion GR701 RGB EVA-02 Edition",
      componentDescription:
        "Limiterad EVA-02-design - ROG Hyperion EVA-02 Edition har EVA-02-färgschemat, med frontpanelen i rött, vitt och grönt. Användningen av högkvalitativa material ger Hyperion EVA-02 en robust och hållbar exteriör med eleganta kurvor och skarpa kanter som inspirerats av EVA-02. Ett specialdesignat kylsystem säkerställer optimala drifttemperaturer, medan kabelhanteringsfunktionerna underlättar en snygg installation.",
      componentPrice: 6099,
      componentAmount: 0,
      componentStatus: "Ny",
      componentCategories: ["Chassi"],
      componentImages: [
        "ASUS_ROG_Strix_Hyperion_GR701_RGB_EVA-02_Edition-1.webp",
        "ASUS_ROG_Strix_Hyperion_GR701_RGB_EVA-02_Edition-2.webp",
        "ASUS_ROG_Strix_Hyperion_GR701_RGB_EVA-02_Edition-3.webp",
      ],
    },
    {
      componentid: 7,
      componentName: "ASUS ROG Thor 1600W",
      componentDescription:
        "Nätagg med RGB, OLED-display och 80+ Titanium - ROG Thor från ASUS är världens första nätagg med integrerad OLED-panel som visar hur mycket effekt som används - i realtid. Nu räcker det att bara slänga ett öga på din rigg för att få ett hum hur dyr din elräkning kommer att bli nästa månad. Thor har integrerad ASUS Aura Sync-kompatibel RGB-belysning som ansluts till moderkortet via en standard 3-pin 5V-kontakt. ROG Thor är 80+ Platinum-certifierad och kommer med sleevade kablar, kabelkammar och 10 års garanti (3 år på OLED och RGB).",
      componentPrice: 8299,
      componentAmount: 5,
      componentStatus: "Ny",
      componentCategories: ["Nätaggregat"],
      componentImages: [
        "ASUS_ROG_Thor_1600W-1.webp",
        "ASUS_ROG_Thor_1600W-2.webp",
        "ASUS_ROG_Thor_1600W-3.webp",
      ],
    },
    {
      componentid: 8,
      componentName: "Asustor Lockerstor 10 Pro AS7110T",
      componentDescription:
        "NAS fullutrustad med Xeon processor - Här är en NAS-lösning i serverklass med en Intel Xeon 9:e generationens Quad-Core CPU, 8 GB DDR4-2666 ECC-minne, dubbla M.2 NVMe SSD-portar för snabb cachning och komplett iSCSI/IP-SAN- och NFS-stöd. Den är kompatibel med VMware, Citrix och Hyper-V och har stöd för virtualisering och Docker-appar. Kommer också med 10-Gigabit Ethernet, tre 2,5-Gigabit-portar och USB 3.2 Gen2-portar.",
      componentPrice: 31499,
      componentAmount: 1,
      componentStatus: "Ny",
      componentCategories: ["Lagring", "NAS-Lagring"],
      componentImages: [
        "Asustor_Lockerstor_10_Pro_AS7110T-1.webp",
        "Asustor_Lockerstor_10_Pro_AS7110T-2.webp",
        "Asustor_Lockerstor_10_Pro_AS7110T-3.webp",
        "Asustor_Lockerstor_10_Pro_AS7110T-4.webp",
        "Asustor_Lockerstor_10_Pro_AS7110T-5.webp",
      ],
    },
    {
      componentid: 9,
      componentName: "Contour RollerMouse Red max",
      componentDescription:
        "Snygg, robust och lättanvänd - Rollermouse Red max kombinerar prestanda och prisbelönt design från RollerMouse Red med ergonomi och avlastning från ArmSupport Red. Kombinationen ger dig hastigheten, precisionen och det optimala nyttan av båda produkter. Dessutom ser Armsupport till att din överkropp förblir i rätt position när du sitter vid datorn. Du reducerar risken för att få besvär i nacke och axlar.",
      componentPrice: 5799,
      componentAmount: 0,
      componentStatus: "Ny",
      componentCategories: ["Kringutrustning", "Mus"],
      componentImages: [
        "Contour_RollerMouse_Red_max-1.webp",
        "Contour_RollerMouse_Red_max-2.webp",
        "Contour_RollerMouse_Red_max-3.webp",
      ],
    },
    {
      componentid: 10,
      componentName: "Cooler Master Cosmos C700M",
      componentDescription:
        "Datorlådan som tar datorlådor till en helt ny nivå - Cosmos C700M från välrenommerade Cooler Master är ett riktigt mastodontchassi som bland annat bjuder på en böjd sidopanel av härdat glass, adresserbar RGB, modularitet, grymt stöd för vattenkylning och snygg kabeldragning, stora stycken av borstad aluminium och en riktigt snygg lösning på vertikal montering av grafikkort. Den adresserbara RGB:n är kompatibel med bl.a. ASUS Aura Sync, MSI Mystic Light Rainbow, Gigabyte RGB Fusion samt ASRock Polychrome sync.",
      componentPrice: 6490,
      componentAmount: 0,
      componentStatus: "Ny",
      componentCategories: ["Chassi"],
      componentImages: [
        "Cooler_Master_Cosmos_C700M-1.webp",
        "Cooler_Master_Cosmos_C700M-2.webp",
        "Cooler_Master_Cosmos_C700M-3.webp",
      ],
    },
    {
      componentid: 11,
      componentName:
        "Corsair 32GB (2x16GB) DDR5 5200MHz CL40 Vengeance RGB Vit",
      componentDescription:
        "DDR5 med hög hastighet - Nästa generations Corsair Vengeance RGB minnen nu med DDR5 för den senaste Intel-plattformen där den låga profilen ger dig bra kompabilitet med kylare på marknaden. DDR5 ger dig nya funktioner som strömhantering direkt på minnet, XMP 3.0 och on-die ECC för att ta din gamingupplevelse till nästa nivå.",
      componentPrice: 1439,
      componentAmount: 5,
      componentStatus: "Ny",
      componentCategories: ["RAM-minne", "DDR5"],
      componentImages: [
        "Corsair_32GB_(2x16GB)_DDR5_5200MHz_CL40_Vengeance_RGB_Vit-1.webp",
        "Corsair_32GB_(2x16GB)_DDR5_5200MHz_CL40_Vengeance_RGB_Vit-2.webp",
        "Corsair_32GB_(2x16GB)_DDR5_5200MHz_CL40_Vengeance_RGB_Vit-3.webp",
      ],
    },
    {
      componentid: 12,
      componentName: "Corsair MP600 Pro XT 8TB",
      componentDescription:
        "Galna hastigheter - CORSAIR MP600 PRO XT Gen4 PCIe x4 NVMe 1.4 M.2 SSD ger extrem lagringsprestanda med hjälp av Gen4 PCIe-teknik för att uppnå otroligt snabba sekventiella läshastigheter på upp till 7 100 MB/s och sekventiella skrivhastigheter på upp till 6 800 MB/s. TLC NAND-flashminne med hög densitet erbjuder den perfekta kombinationen av prestanda och hållbarhet, medan en stilren aluminiumvärmespridare hjälper till att bibehålla höga hastigheter.",
      componentPrice: 12499,
      componentAmount: 0,
      componentStatus: "Ny",
      componentCategories: ["Lagring"],
      componentImages: [
        "Corsair_MP600_Pro_XT_8TB-1.webp",
        "Corsair_MP600_Pro_XT_8TB-2.webp",
        "Corsair_MP600_Pro_XT_8TB-3.webp",
      ],
    },
    {
      componentid: 13,
      componentName: "Crucial T700 1TB M.2 NVMe PCIe Gen 5",
      componentDescription:
        "Nästa generation SSD - Crucial T700 M.2 NVMe PCIe Gen 5 är nästa generations NVMe SSDer som ger upp till 12400MB/s i läshastghet och 11800MB/s skriv för helt otroliga hastigheter för ditt system. Crucial T700 kommer i två utföranden med eller utan värmespridare där den utan kräver att du använder ditt moderkorts värmespridare för att bibehålla prestandan.",
      componentPrice: 2599,
      componentAmount: 1,
      componentStatus: "Ny",
      componentCategories: ["Lagring"],
      componentImages: [
        "Crucial_T700_4TB_M.2_NVMe_PCIe_Gen_5-1.webp",
        "Crucial_T700_4TB_M.2_NVMe_PCIe_Gen_5-2.webp",
        "Crucial_T700_4TB_M.2_NVMe_PCIe_Gen_5-3.webp",
      ],
    },
    {
      componentid: 14,
      componentName: "Fractal Design Torrent RGB TG LT",
      componentDescription:
        "100% luftflöde, inga kompromisser - Fractal Design Torrent är senaste serien från Fractal Design som fokuserar på riktigt högt luftflöde med en front i öppet utförande som tillsammans med de fem medföljande fläktarna ger dig extrem kylning direkt ur kartongen. I fronten sitter två 180mm fläktar och i botten tre stycken 140mm fläktar ur Dynamic serien som alla styrs av PWM. (RGB versionen har fläktar ur prismaserien med A-RGB). Chassit har stöd för rejäla komponenter och finns i versioner med TG-panel, Solid-panel samt RGB.",
      componentPrice: 3249,
      componentAmount: 50,
      componentStatus: "Ny",
      componentCategories: ["Chassi"],
      componentImages: [
        "Fractal_Design_Torrent_RGB_TG_LT-1.webp",
        "Fractal_Design_Torrent_RGB_TG_LT-2.webp",
        "Fractal_Design_Torrent_RGB_TG_LT-3.webp",
      ],
    },
    {
      componentid: 15,
      componentName: "Intel Core i9 13900KS 3.2 GHz 68MB",
      componentDescription:
        "24-kärnig processor från Intel - Intels 13th-gen processorer är nu här, med fler hybridkärnor och ännu högre boost-frekvenser. Intel Thread Director optimerar vilka kärnor som utför vilka uppgifter, för att en optimal prestanda kan uppnås i både enkel- som flertrådad användning. Stöd för PCIe 5.0 samt DDR5 medföljer.",
      componentPrice: 9290,
      componentAmount: 9,
      componentStatus: "Ny",
      componentCategories: ["Processor"],
      componentImages: [
        "Intel_Core_i9_13900KS_3.2_GHz_68MB-1.webp",
        "Intel_Core_i9_13900KS_3.2_GHz_68MB-2.webp",
        "Intel_Core_i9_13900KS_3.2_GHz_68MB-3.webp",
      ],
    },
    {
      componentid: 16,
      componentName: 'Kingston DC600M 7680GB Data Center 2.5" SATA',
      componentDescription:
        "Disk för datacenter - Kingston DC600M är designad för användande i krävande datacenter miljöer där låg latens och konstant IO prestanda är nyckelfaktorer. Bland annat har DC600M diskarna PLP (power loss capacitors) som skyddar mot dataförlust vid plötsliga strömavbrott, en pålitlig QoS och finns i storlekar från 480GB hela vägen upp till 7680GB.",
      componentPrice: 8599,
      componentAmount: 4,
      componentStatus: "Ny",
      componentCategories: ["Lagring"],
      componentImages: [
        "Kingston_DC600M_7680GB_Data_Center_2.5_SATA-1.webp",
        "Kingston_DC600M_7680GB_Data_Center_2.5_SATA-2.webp",
      ],
    },
    {
      componentid: 17,
      componentName: "Kioxia Exceria Plus MicroSD 1TB",
      componentDescription:
        "Micro-SD kort för video i 4K - Kioxia Exceria MicroSD Plus är en serie Micro-SD kort som är en perfekt följeslagare till din actionkamera, mobil eller digitalkamera som filmar i 4K och kommer i 4 olika storlekar från 32GB upp till hela 256GB. Medföljer gör en SD-korts adapter samt du har 5 års garanti.",
      componentPrice: 3290,
      componentAmount: 0,
      componentStatus: "Ny",
      componentCategories: ["Lagring", "SD-minnen"],
      componentImages: ["Kioxia_Exceria_Plus_MicroSD_1TB-1.webp"],
    },
    {
      componentid: 18,
      componentName: "MSI GeForce RTX 4090 24GB GAMING X TRIO",
      componentDescription:
        "RTX 4000-grafikkort - GeForce RTX 4090 är det överlägset kraftfullaste grafikkortet genom tiderna. Det är flaggskeppet i den nya, banbrytande Ada Lovelace-arkitekturen och bjuder på aldrig tidigare skådad prestanda, med upp till två gånger så hög prestanda och energieffektivitet som RTX 3090.",
      componentPrice: 22999,
      componentStatus: "Ny",
      componentCategories: ["Grafikkort"],
      componentImages: [
        "MSI_GeForce_RTX_4090_24GB_GAMING_X_TRIO-1.webp",
        "MSI_GeForce_RTX_4090_24GB_GAMING_X_TRIO-2.webp",
        "MSI_GeForce_RTX_4090_24GB_GAMING_X_TRIO-3.webp",
      ],
    },
    {
      componentid: 19,
      componentName: "MSI MEG X670E Ace",
      componentDescription:
        "Moderkort för Ryzen 7000 - X670E är det mest påkostade AM5-chipsetet för den banbrytande AMD Ryzen 7000-serien och bjuder bland mycket annat på DDR5, den nya automatiska överklockningsprofilen AMD Expo och PCIe 5.0-stöd för både grafikkort och NVMe-lagring. Med den nya sockeln AM5 kan du känna dig trygg i din investering. AMD har nämligen utlovat stöd till åtminstone 2025, för framtida uppgraderingar, och har som en extra trevlig bonus behållit stöd för AM4-kylare.",
      componentPrice: 10990,
      componentAmount: 0,
      componentStatus: "Ny",
      componentCategories: ["Moderkort"],
      componentImages: [
        "MSI_MEG_X670E_Ace-1.webp",
        "MSI_MEG_X670E_Ace-2.webp",
        "MSI_MEG_X670E_Ace-3.webp",
      ],
    },
    {
      componentid: 20,
      componentName: "Netgear Orbi RBK863SB AX6000 Svart 3-pack",
      componentDescription:
        "Högpresterande meshsystem - Netgear Orbi RBK863SB är ett meshsystem med 3st enheter som täcker en yta på upp till 540m2 med en hastighet på upp till 6Gbps över trippla frekvensband. Med en 10Gbps WAN-port kan du vara säker på att du får bästa möjliga inkommande hastighet. Varje satellit är dessutom utrustad med 4st 1Gbps-portar så att du kan ansluta enheter med kabel.",
      componentPrice: 13990,
      componentAmount: 3,
      componentStatus: "Ny",
      componentCategories: ["Nätverksutrustning"],
      componentImages: [
        "Netgear_Orbi_RBK863SB_AX6000_Svart_3-pack-1.webp",
        "Netgear_Orbi_RBK863SB_AX6000_Svart_3-pack-2.webp",
        "Netgear_Orbi_RBK863SB_AX6000_Svart_3-pack-3.webp",
      ],
    },
    {
      componentid: 21,
      componentName: "SanDisk microSDXC Extreme Pro 512 GB",
      componentDescription:
        "Snabb nog för att hänga med på aktiviteter - Få extrema hastigheter från ett microSDXC-minneskort för snabb överföring, appprestanda och 4K UHD. Det här högpresterande Extreme Pro microSD SDXC-kortet är perfekt för din Android-smartphone, actionkameror eller drönare och klarar 4K UHD-videoinspelning, Full HD-video och högupplösta foton. Det supersnabba SanDisk Extreme PRO microSDXC minneskortet SanDisk Extreme PRO microSDXC uppnår läshastigheter på upp till 200 MB/s och skrivhastigheter på upp till 140 MB/s.",
      componentPrice: 1049,
      componentAmount: 8,
      componentStatus: "Ny/Begagnad",
      componentCategories: ["Lagring", "SD-minnen"],
      componentImages: [
        "SanDisk_SDXC_Extreme_Pro_512_GB-1.webp",
        "SanDisk_SDXC_Extreme_Pro_512_GB-2.webp",
        "SanDisk_SDXC_Extreme_Pro_512_GB-3.webp",
      ],
    },
    {
      componentid: 22,
      componentName: "Seagate BarraCuda Desktop 8TB 5400rpm 256MB",
      componentDescription:
        "Stabil lagringsdisk för alla sorters behov - Mångsidig och pålitlig, den vassa Seagate Barracuda-serien med diskar är den senaste generationen av super-pålitliga diskar från en familj av diskar som producerats i över 20 år. Räkna med Barracuda diskar för alla dina PC-behov; jobb, spelande och lagring av film och musik. Med kapaciteter upp till 8TB leder Barracuda marknaden med den bredaste portföljen av lagringsval.",
      componentPrice: 2499,
      componentAmount: 3,
      componentStatus: "Ny",
      componentCategories: ["Lagring"],
      componentImages: ["Seagate_BarraCuda_Desktop_8TB_5400rpm_256MB-1.webp"],
    },
    {
      componentid: 23,
      componentName: "Seagate BarraCuda Laptop 4TB 5400rpm 128MB",
      componentDescription:
        'Massiv lagring i kompakt 2,5" formfaktor - Massiv lagring för kompakta enheter i 2,5" formfaktor och 15mm tjocklek. Hela 128MB cacheminne och upp till 140MB/s överföringshastighet.',
      componentPrice: 2649,
      componentAmount: 1,
      componentStatus: "Ny",
      componentCategories: ["Lagring"],
      componentImages: ["Seagate_BarraCuda_Laptop_4TB_5400rpm_128MB-1.webp"],
    },
    {
      componentid: 24,
      componentName: "Synology Enterprise 18TB",
      componentDescription:
        "Lagringsdiskar för Synology-system - Synology Enterprise serien HAT5300-hårddisken erbjuder klassledande prestanda tack vare en nära integrering med DSM- och Synology-maskinvara. Med över 400 000 timmars intern valideringstestning och med stöd av Synologys 5-åriga begränsade garanti ger HAT5300-serien tillförlitlighet till Synology-driftsättningar likt ingen annan.",
      componentPrice: 10490,
      componentAmount: 0,
      componentStatus: "Ny",
      componentCategories: ["Lagring"],
      componentImages: [
        "Synology_Enterprise_18TB-1.webp",
        "Synology_Enterprise_18TB-2.webp",
      ],
    },
    {
      componentid: 25,
      componentName: "WD Red 2TB 256MB",
      componentDescription:
        "Extremt stabil NAS-hårddisk med god prestanda - WD Red är en disk speciellt anpassad för att sitta i NAS-lösningar eller PC där du använder RAID-konfigurationer. Har låg energiförbrukning och speciall firmware för att hantera RAID-optimalt. Har till skillnad från t.ex. Green-diskarna inga problem med powerstates och tappad RAID i en NAS. Optimerad för lösningar där du använder upp till 8st diskar i samma chassi. Har du fler diskar rekommenderas att man isället väljer WD Red PRO-serien.",
      componentPrice: 1099,
      componentAmount: 0,
      componentStatus: "Ny",
      componentCategories: ["Lagring"],
      componentImages: ["WD_Red_2TB_256MB-1.webp"],
    },
    {
      componentid: 26,
      componentName: "MusicCast WXA-50",
      componentDescription:
        "WXA-50 är en ljudkomponent som öppnar nya möjligheter för ljudinstallationer och multiroom. Du får tillgång till ett enormt utbud av ljudinnehåll. Lyssna på streamingtjänster eller ljudfiler som du lagrat på din smartphone. Du också spela upp high res. musik i riktigt hög kvalitet från en PC/NAS i nätverket. Med Yamaha MusicCast kan du trådlöst dela och spela upp musik i hela i hela ditt hem. Smarta funktioner i kombination med hög prestanda ger dig musikalisk njutning, så som du vill ha det.",
      componentPrice: 5990,
      componentAmount: 1,
      componentStatus: "Begagnad",
      componentCategories: ["Ljudutrustning"],
      componentImages: [
        "Yamaha_WXA-50_MusicCast-1.webp",
        "Yamaha_WXA-50_MusicCast-2.webp",
        "Yamaha_WXA-50_MusicCast-3.webp",
      ],
    },
    {
      componentid: 27,
      componentName: "ZOWIE EC2-CW Wireless Mouse",
      componentDescription:
        "Öppnad förpackning, komplett med alla tillbehör. OBS! Från fyndhörnan! Trådlös design med förbättrad mottagare. Asymmetrisk ergonomisk design. Minskad vikt; 24-stegs scrollhjul. Plug and play.",
      componentPrice: 1900,
      componentAmount: 1,
      componentStatus: "Begagnad",
      componentCategories: ["Kringutrustning", "Mus", "Spelmus"],
      componentImages: ["ZOWIE_EC2-CW_Wireless_Mouse-1.webp"],
    },
  ];
  // Users "testuser1" (normal access) and "sysadmin" (access to everything)
  const users = [
    {
      userip: "127.0.0.1",
      username: "testuser1",
      useremail: "testuser1@AiDatorer.se",
      userfullname: "Jörgen Jönsson",
      userpassword: hashedPwTestUser,
      roles: ["get_images", "get_components"],
      access_token: "",
      refresh_token: "",
      account_blocked: false,
      account_activated: false,
      last_login: "",
    },
    {
      userip: "127.0.0.1",
      username: "testuser2",
      useremail: "testuser2@AiDatorer.se",
      userfullname: "Annicka Johnson",
      userpassword: hashedPwTestUser2,
      roles: ["get_images", "post_images", "get_components"],
      access_token: "",
      refresh_token: "",
      account_blocked: false,
      account_activated: true,
      last_login: "",
    },
    {
      userip: "127.0.0.1",
      username: "testuser3",
      useremail: "testuser3@AiDatorer.se",
      userfullname: "Robert Rosenspira",
      userpassword: hashedPwTestUser3,
      roles: ["put_images", "delete_components"],
      access_token: "",
      refresh_token: "",
      account_blocked: true,
      account_activated: true,
      last_login: "",
    },
    {
      userip: "127.0.0.1",
      username: "testuser4",
      useremail: "testuser4@AiDatorer.se",
      userfullname: "Ewa Marklund",
      userpassword: hashedPwTestUser4,
      roles: ["get_images", "delete_images", "put_components"],
      access_token: "",
      refresh_token: "",
      account_blocked: false,
      account_activated: true,
      last_login: "",
    },
    {
      userip: "127.0.0.1",
      username: "testuser5",
      useremail: "testuser5@AiDatorer.se",
      userfullname: "David Leksson",
      userpassword: hashedPwTestUser5,
      roles: ["get_components", "post_components"],
      access_token: "",
      refresh_token: "",
      account_blocked: true,
      account_activated: true,
      last_login: "",
    },
    {
      userip: "127.0.0.1",
      username: "testuser6",
      useremail: "testuser6@AiDatorer.se",
      userfullname: "Sofie Tursson",
      userpassword: hashedPwTestUser6,
      roles: ["post_images", "put_components"],
      access_token: "",
      refresh_token: "",
      account_blocked: false,
      account_activated: true,
      last_login: "",
    },
    {
      userip: "127.0.0.1",
      username: "testuser7",
      useremail: "testuser7@AiDatorer.se",
      userfullname: "Tommy Brunberg",
      userpassword: hashedPwTestUser7,
      roles: ["put_images", "delete_components"],
      access_token: "",
      refresh_token: "",
      account_blocked: false,
      account_activated: false,
      last_login: "",
    },
    {
      userip: "127.0.0.1",
      username: "testuser8",
      useremail: "testuser8@AiDatorer.se",
      userfullname: "Olivia Davidsson",
      userpassword: hashedPwTestUser8,
      roles: ["get_images", "delete_images", "put_components"],
      access_token: "",
      refresh_token: "",
      account_blocked: false,
      account_activated: true,
      last_login: "",
    },
    {
      userip: "127.0.0.1",
      username: "testuser9",
      useremail: "testuser9@AiDatorer.se",
      userfullname: "Lukas Rappsberg",
      userpassword: hashedPwTestUser9,
      roles: ["get_components", "post_components"],
      access_token: "",
      refresh_token: "",
      account_blocked: false,
      account_activated: true,
      last_login: "",
    },
    {
      userip: "127.0.0.1",
      username: "testuser10",
      useremail: "testuser10@AiDatorer.se",
      userfullname: "Emma Takmursson",
      userpassword: hashedPwTestUser10,
      roles: ["post_images", "put_components"],
      access_token: "",
      refresh_token: "",
      account_blocked: false,
      account_activated: false,
      last_login: "",
    },
    {
      userip: "127.0.0.1",
      username: "sysadmin",
      useremail: "sysadmin@AiDatorer.se",
      userfullname: "Systemadministratören",
      userpassword: hashedPwAdmin,
      roles: [
        "get_images",
        "put_images",
        "delete_images",
        "post_images",
        "get_components",
        "put_components",
        "delete_components",
        "post_components",
        "get_users",
        "put_users",
        "delete_users",
        "post_users",
      ],
      access_token: "",
      refresh_token: "",
      account_blocked: false,
      account_activated: true,
      last_login: "",
    },
  ];

  // Create new MongoDB client object...
  const client = new MongoClient(url);

  // Then TRY all of this:
  try {
    // ...Try connecting to it
    await client.connect();

    // Then select correct database & collection (they'll be created if they don't exist yet!)
    const db = client.db(dbName);
    const collection = db.collection(dbCol1);
    const usersCol = db.collection(dbCol2);

    // Then delete all previous document objects inside of that collection after it has been created
    await collection.deleteMany({}); // {} will match all Document Objects so effectively deleting all of them!

    // Then insert all object data into that collection!
    await collection.insertMany(pccomponentsData);

    // Then delete all current users and create regular user "testuser1" and "sysadmin" with full access
    await usersCol.deleteMany({});
    await usersCol.insertMany(users);

    // DONE!
    console.log("[\x1b[32mSUCCESS\x1b[0m]: All test data installed for use!");
  } catch (err) {
    // Catch & show any error(s)!
    console.error("[\x1b[31mDISAPPOINTED\x1b[0m]: ", err);
  } finally {
    // Close DB connection no matter what happened!
    await client.close();
  }
}
