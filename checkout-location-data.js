(function () {
  const COUNTRY_CODES = [
    "AF", "AL", "DZ", "AD", "AO", "AG", "AR", "AM", "AU", "AT", "AZ", "BS", "BH", "BD", "BB", "BY",
    "BE", "BZ", "BJ", "BT", "BO", "BA", "BW", "BR", "BN", "BG", "BF", "BI", "CV", "KH", "CM", "CA",
    "CF", "TD", "CL", "CN", "CO", "KM", "CG", "CD", "CR", "CI", "HR", "CU", "CY", "CZ", "DK", "DJ",
    "DM", "DO", "EC", "EG", "SV", "GQ", "ER", "EE", "SZ", "ET", "FJ", "FI", "FR", "GA", "GM", "GE",
    "DE", "GH", "GR", "GD", "GT", "GN", "GW", "GY", "HT", "HN", "HU", "IS", "IN", "ID", "IR", "IQ",
    "IE", "IL", "IT", "JM", "JP", "JO", "KZ", "KE", "KI", "KP", "KR", "KW", "KG", "LA", "LV", "LB",
    "LS", "LR", "LY", "LI", "LT", "LU", "MG", "MW", "MY", "MV", "ML", "MT", "MH", "MR", "MU", "MX",
    "FM", "MD", "MC", "MN", "ME", "MA", "MZ", "MM", "NA", "NR", "NP", "NL", "NZ", "NI", "NE", "NG",
    "MK", "NO", "OM", "PK", "PW", "PS", "PA", "PG", "PY", "PE", "PH", "PL", "PT", "QA", "RO", "RU",
    "RW", "KN", "LC", "VC", "WS", "SM", "ST", "SA", "SN", "RS", "SC", "SL", "SG", "SK", "SI", "SB",
    "SO", "ZA", "SS", "ES", "LK", "SD", "SR", "SE", "CH", "SY", "TJ", "TZ", "TH", "TL", "TG", "TO",
    "TT", "TN", "TR", "TM", "TV", "UG", "UA", "AE", "GB", "US", "UY", "UZ", "VU", "VA", "VE", "VN",
    "YE", "ZM", "ZW"
  ];

  const CITY_DIRECTORY = {
    AE: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah"],
    AR: ["Buenos Aires", "Cordoba", "Rosario", "Mendoza", "La Plata"],
    AT: ["Vienna", "Salzburg", "Graz", "Innsbruck", "Linz"],
    AU: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
    BD: ["Dhaka", "Chittagong", "Khulna", "Rajshahi", "Sylhet"],
    BE: ["Brussels", "Antwerp", "Ghent", "Bruges", "Liege"],
    BH: ["Manama", "Muharraq", "Riffa", "Hamad Town", "Isa Town"],
    BR: ["Sao Paulo", "Rio de Janeiro", "Brasilia", "Belo Horizonte", "Curitiba"],
    CA: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"],
    CH: ["Zurich", "Geneva", "Basel", "Lausanne", "Bern"],
    CL: ["Santiago", "Valparaiso", "Concepcion", "La Serena", "Antofagasta"],
    CN: ["Shanghai", "Beijing", "Guangzhou", "Shenzhen", "Chengdu"],
    CO: ["Bogota", "Medellin", "Cali", "Cartagena", "Barranquilla"],
    CZ: ["Prague", "Brno", "Ostrava", "Plzen", "Liberec"],
    DE: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne"],
    DK: ["Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg"],
    DO: ["Santo Domingo", "Santiago", "La Romana", "Punta Cana", "San Pedro de Macoris"],
    DZ: ["Algiers", "Oran", "Constantine", "Annaba", "Blida"],
    EC: ["Quito", "Guayaquil", "Cuenca", "Manta", "Ambato"],
    EG: ["Cairo", "Alexandria", "Giza", "Mansoura", "Sharm El Sheikh"],
    ES: ["Madrid", "Barcelona", "Valencia", "Seville", "Malaga"],
    ET: ["Addis Ababa", "Dire Dawa", "Mekelle", "Gondar", "Bahir Dar"],
    FI: ["Helsinki", "Espoo", "Tampere", "Turku", "Oulu"],
    FR: ["Paris", "Lyon", "Marseille", "Bordeaux", "Nice"],
    GB: ["London", "Manchester", "Birmingham", "Edinburgh", "Glasgow"],
    GE: ["Tbilisi", "Batumi", "Kutaisi", "Rustavi", "Zugdidi"],
    GH: ["Accra", "Kumasi", "Takoradi", "Tamale", "Cape Coast"],
    GR: ["Athens", "Thessaloniki", "Patras", "Heraklion", "Larissa"],
    HK: ["Central", "Tsim Sha Tsui", "Causeway Bay", "Mong Kok", "Sha Tin"],
    HR: ["Zagreb", "Split", "Rijeka", "Zadar", "Osijek"],
    HU: ["Budapest", "Debrecen", "Szeged", "Pecs", "Gyor"],
    ID: ["Jakarta", "Bandung", "Surabaya", "Medan", "Denpasar"],
    IE: ["Dublin", "Cork", "Galway", "Limerick", "Waterford"],
    IL: ["Tel Aviv", "Jerusalem", "Haifa", "Eilat", "Netanya"],
    IN: ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai"],
    IQ: ["Baghdad", "Basra", "Erbil", "Mosul", "Najaf"],
    IT: ["Milan", "Rome", "Florence", "Naples", "Venice"],
    JM: ["Kingston", "Montego Bay", "Spanish Town", "Portmore", "Ocho Rios"],
    JO: ["Amman", "Aqaba", "Irbid", "Zarqa", "Madaba"],
    JP: ["Tokyo", "Osaka", "Kyoto", "Nagoya", "Fukuoka"],
    KE: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"],
    KR: ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon"],
    KW: ["Kuwait City", "Salmiya", "Hawalli", "Farwaniya", "Jahra"],
    KZ: ["Almaty", "Astana", "Shymkent", "Aktobe", "Karaganda"],
    LB: ["Beirut", "Tripoli", "Jounieh", "Sidon", "Zahle"],
    LK: ["Colombo", "Kandy", "Galle", "Negombo", "Jaffna"],
    LT: ["Vilnius", "Kaunas", "Klaipeda", "Siauliai", "Panevezys"],
    LU: ["Luxembourg", "Esch-sur-Alzette", "Differdange", "Dudelange", "Ettelbruck"],
    LV: ["Riga", "Daugavpils", "Liepaja", "Jelgava", "Ventspils"],
    MA: ["Casablanca", "Rabat", "Marrakesh", "Tangier", "Fes"],
    MD: ["Chisinau", "Balti", "Tiraspol", "Cahul", "Ungheni"],
    ME: ["Podgorica", "Budva", "Kotor", "Bar", "Niksic"],
    MG: ["Antananarivo", "Toamasina", "Antsirabe", "Mahajanga", "Fianarantsoa"],
    MK: ["Skopje", "Bitola", "Ohrid", "Tetovo", "Kumanovo"],
    MM: ["Yangon", "Mandalay", "Naypyidaw", "Bagan", "Taunggyi"],
    MN: ["Ulaanbaatar", "Erdenet", "Darkhan", "Choibalsan", "Khovd"],
    MX: ["Mexico City", "Monterrey", "Guadalajara", "Puebla", "Merida"],
    MY: ["Kuala Lumpur", "George Town", "Johor Bahru", "Ipoh", "Kota Kinabalu"],
    NG: ["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan"],
    NL: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven"],
    NO: ["Oslo", "Bergen", "Trondheim", "Stavanger", "Tromso"],
    NZ: ["Auckland", "Wellington", "Christchurch", "Hamilton", "Queenstown"],
    OM: ["Muscat", "Salalah", "Sohar", "Nizwa", "Sur"],
    PE: ["Lima", "Arequipa", "Cusco", "Trujillo", "Piura"],
    PH: ["Manila", "Cebu City", "Davao", "Makati", "Quezon City"],
    PK: ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad"],
    PL: ["Warsaw", "Krakow", "Wroclaw", "Gdansk", "Poznan"],
    PT: ["Lisbon", "Porto", "Braga", "Faro", "Coimbra"],
    QA: ["Doha", "Al Rayyan", "Lusail", "Al Wakrah", "Umm Salal"],
    RO: ["Bucharest", "Cluj-Napoca", "Timisoara", "Brasov", "Iasi"],
    RS: ["Belgrade", "Novi Sad", "Nis", "Kragujevac", "Subotica"],
    RU: ["Moscow", "Saint Petersburg", "Kazan", "Sochi", "Yekaterinburg"],
    SA: ["Riyadh", "Jeddah", "Dammam", "Khobar", "Makkah"],
    SE: ["Stockholm", "Gothenburg", "Malmo", "Uppsala", "Helsingborg"],
    SG: ["Orchard", "Marina Bay", "Sentosa", "Jurong East", "Bugis"],
    SI: ["Ljubljana", "Maribor", "Koper", "Celje", "Kranj"],
    SK: ["Bratislava", "Kosice", "Zilina", "Nitra", "Presov"],
    TH: ["Bangkok", "Chiang Mai", "Phuket", "Pattaya", "Khon Kaen"],
    TN: ["Tunis", "Sfax", "Sousse", "Bizerte", "Hammamet"],
    TR: ["Istanbul", "Ankara", "Izmir", "Antalya", "Bursa"],
    TW: ["Taipei", "Taichung", "Kaohsiung", "Tainan", "Hsinchu"],
    TZ: ["Dar es Salaam", "Dodoma", "Arusha", "Mwanza", "Zanzibar City"],
    UA: ["Kyiv", "Lviv", "Odesa", "Kharkiv", "Dnipro"],
    UG: ["Kampala", "Entebbe", "Jinja", "Gulu", "Mbarara"],
    US: ["New York", "Los Angeles", "Chicago", "Miami", "Houston"],
    UY: ["Montevideo", "Punta del Este", "Salto", "Paysandu", "Maldonado"],
    UZ: ["Tashkent", "Samarkand", "Bukhara", "Namangan", "Andijan"],
    VE: ["Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay"],
    VN: ["Ho Chi Minh City", "Hanoi", "Da Nang", "Hoi An", "Nha Trang"],
    ZA: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Gqeberha"]
  };

  const TIMEZONE_TO_COUNTRY = {
    "Africa/Cairo": "EG",
    "Africa/Casablanca": "MA",
    "Africa/Johannesburg": "ZA",
    "America/Chicago": "US",
    "America/Denver": "US",
    "America/Los_Angeles": "US",
    "America/New_York": "US",
    "America/Sao_Paulo": "BR",
    "Asia/Bangkok": "TH",
    "Asia/Dubai": "AE",
    "Asia/Hong_Kong": "HK",
    "Asia/Jakarta": "ID",
    "Asia/Karachi": "PK",
    "Asia/Kolkata": "IN",
    "Asia/Kuala_Lumpur": "MY",
    "Asia/Kuwait": "KW",
    "Asia/Manila": "PH",
    "Asia/Qatar": "QA",
    "Asia/Riyadh": "SA",
    "Asia/Seoul": "KR",
    "Asia/Shanghai": "CN",
    "Asia/Singapore": "SG",
    "Asia/Tokyo": "JP",
    "Europe/Amsterdam": "NL",
    "Europe/Athens": "GR",
    "Europe/Berlin": "DE",
    "Europe/Brussels": "BE",
    "Europe/Bucharest": "RO",
    "Europe/Copenhagen": "DK",
    "Europe/Dublin": "IE",
    "Europe/Helsinki": "FI",
    "Europe/Istanbul": "TR",
    "Europe/Lisbon": "PT",
    "Europe/London": "GB",
    "Europe/Madrid": "ES",
    "Europe/Moscow": "RU",
    "Europe/Oslo": "NO",
    "Europe/Paris": "FR",
    "Europe/Prague": "CZ",
    "Europe/Rome": "IT",
    "Europe/Stockholm": "SE",
    "Europe/Vienna": "AT",
    "Pacific/Auckland": "NZ",
    "Pacific/Sydney": "AU"
  };

  const displayNames = typeof Intl.DisplayNames === "function"
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

  const buildCountryOptions = () =>
    COUNTRY_CODES
      .map((code) => ({
        code,
        label: displayNames?.of(code) || code
      }))
      .filter((item) => item.label && item.label !== item.code)
      .sort((left, right) => left.label.localeCompare(right.label));

  const createFallbackCities = (countryName) => {
    const label = String(countryName || "Delivery").trim();
    return [
      `${label} City`,
      `${label} Central`,
      `${label} Metro`
    ];
  };

  const uniqueValues = (values) => Array.from(new Set(values.filter(Boolean)));

  const getCitiesForCountry = (countryCode, countryName) => {
    const directory = CITY_DIRECTORY[countryCode] || createFallbackCities(countryName);
    return uniqueValues(directory);
  };

  const guessCountryCode = () => {
    const localeCandidates = [
      ...(navigator.languages || []),
      navigator.language || "",
      navigator.userLanguage || ""
    ];

    for (const locale of localeCandidates) {
      const match = String(locale).match(/[-_](\w{2})$/);
      const region = match?.[1]?.toUpperCase();
      if (region && COUNTRY_CODES.includes(region)) {
        return region;
      }
    }

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    return TIMEZONE_TO_COUNTRY[timeZone] || "";
  };

  window.LuxeCheckoutLocationData = {
    countryOptions: buildCountryOptions(),
    getCitiesForCountry,
    guessCountryCode
  };
})();
