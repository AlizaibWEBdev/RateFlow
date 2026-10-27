// Profiles for the currencies we build indexable pages for.
// `aliases` are the names people actually type into Google (see Search Console queries),
// `peg` describes fixed/managed rates and is also used to derive historical series.

const currencies = [
    // ---- Americas ----
    {
        code: 'USD', name: 'US Dollar', plural: 'US dollars', symbol: '$', flag: 'us', region: 'Americas',
        country: 'United States', aliases: ['dollar', 'American dollar', 'greenback'],
        bank: 'Federal Reserve', subunit: '100 cents',
        note: 'The US dollar is the world\'s main reserve currency and is on one side of roughly 88% of all foreign-exchange trades (BIS Triennial Survey, 2022).'
    },
    {
        code: 'CAD', name: 'Canadian Dollar', plural: 'Canadian dollars', symbol: 'C$', flag: 'ca', region: 'Americas',
        country: 'Canada', aliases: ['loonie'],
        bank: 'Bank of Canada', subunit: '100 cents',
        note: 'Traders call it the "loonie" after the loon on the one-dollar coin. Because Canada is a major oil exporter, the CAD often moves with crude oil prices.'
    },
    {
        code: 'MXN', name: 'Mexican Peso', plural: 'Mexican pesos', symbol: 'MX$', flag: 'mx', region: 'Americas',
        country: 'Mexico', aliases: ['peso', 'Mexican peso'],
        bank: 'Banco de México', subunit: '100 centavos',
        note: 'The Mexican peso is the most traded currency in Latin America and is strongly influenced by trade and remittance flows with the United States.'
    },
    {
        code: 'BRL', name: 'Brazilian Real', plural: 'Brazilian reais', symbol: 'R$', flag: 'br', region: 'Americas',
        country: 'Brazil', aliases: ['real', 'reais'],
        bank: 'Banco Central do Brasil', subunit: '100 centavos',
        note: 'The real was introduced in 1994 under the Plano Real to end years of hyperinflation, and today floats freely.'
    },
    {
        code: 'ARS', name: 'Argentine Peso', plural: 'Argentine pesos', symbol: '$', flag: 'ar', region: 'Americas',
        country: 'Argentina', aliases: ['Argentinian peso'],
        bank: 'Banco Central de la República Argentina', subunit: '100 centavos',
        note: 'Argentina has a long history of capital controls, so the official rate and the informal "blue dollar" rate can differ significantly.'
    },
    {
        code: 'CLP', name: 'Chilean Peso', plural: 'Chilean pesos', symbol: '$', flag: 'cl', region: 'Americas',
        country: 'Chile', aliases: ['Chile peso'],
        bank: 'Banco Central de Chile', subunit: 'no subunit in use',
        note: 'Chile is the world\'s largest copper producer, so the Chilean peso tends to rise and fall with copper prices. Prices are quoted in whole pesos.'
    },
    {
        code: 'COP', name: 'Colombian Peso', plural: 'Colombian pesos', symbol: '$', flag: 'co', region: 'Americas',
        country: 'Colombia', aliases: ['Colombia peso'],
        bank: 'Banco de la República', subunit: '100 centavos',
        note: 'Oil and coffee exports are key drivers of the Colombian peso, which floats freely against the dollar.'
    },
    {
        code: 'PEN', name: 'Peruvian Sol', plural: 'Peruvian soles', symbol: 'S/', flag: 'pe', region: 'Americas',
        country: 'Peru', aliases: ['sol', 'soles'],
        bank: 'Banco Central de Reserva del Perú', subunit: '100 céntimos',
        note: 'The sol is one of the most stable currencies in Latin America, helped by Peru\'s central bank actively smoothing large swings.'
    },
    {
        code: 'UYU', name: 'Uruguayan Peso', plural: 'Uruguayan pesos', symbol: '$U', flag: 'uy', region: 'Americas',
        country: 'Uruguay', aliases: ['Uruguay peso'],
        bank: 'Banco Central del Uruguay', subunit: '100 centésimos',
        note: 'Uruguay is highly dollarised: property and cars are commonly priced in US dollars rather than pesos.'
    },
    {
        code: 'CRC', name: 'Costa Rican Colón', plural: 'Costa Rican colones', symbol: '₡', flag: 'cr', region: 'Americas',
        country: 'Costa Rica', aliases: ['colon', 'colones', 'Costa Rica currency'],
        bank: 'Banco Central de Costa Rica', subunit: '100 céntimos',
        note: 'US dollars are widely accepted in Costa Rica\'s tourist areas, but change is usually given in colones.'
    },
    {
        code: 'JMD', name: 'Jamaican Dollar', plural: 'Jamaican dollars', symbol: 'J$', flag: 'jm', region: 'Americas',
        country: 'Jamaica', aliases: ['Jamaica dollar'],
        bank: 'Bank of Jamaica', subunit: '100 cents',
        note: 'Tourism and remittances from the US, UK and Canada are major sources of foreign currency for Jamaica.'
    },
    {
        code: 'DOP', name: 'Dominican Peso', plural: 'Dominican pesos', symbol: 'RD$', flag: 'do', region: 'Americas',
        country: 'Dominican Republic', aliases: ['Dominican Republic peso'],
        bank: 'Banco Central de la República Dominicana', subunit: '100 centavos',
        note: 'Remittances and tourism make the US dollar a common second currency in the Dominican Republic.'
    },

    // ---- Europe ----
    {
        code: 'EUR', name: 'Euro', plural: 'euros', symbol: '€', flag: 'eu', region: 'Europe',
        country: 'Eurozone', aliases: ['European euro'],
        bank: 'European Central Bank', subunit: '100 cents',
        note: 'The euro is the official currency of 21 EU countries and the second most held reserve currency after the US dollar.'
    },
    {
        code: 'GBP', name: 'British Pound', plural: 'British pounds', symbol: '£', flag: 'gb', region: 'Europe',
        country: 'United Kingdom', aliases: ['pound', 'pound sterling', 'sterling', 'quid'],
        bank: 'Bank of England', subunit: '100 pence',
        note: 'Pound sterling is the oldest currency still in continuous use, with a history going back over 1,200 years.'
    },
    {
        code: 'CHF', name: 'Swiss Franc', plural: 'Swiss francs', symbol: 'CHF', flag: 'ch', region: 'Europe',
        country: 'Switzerland', aliases: ['franc', 'Swissie'],
        bank: 'Swiss National Bank', subunit: '100 centimes (Rappen)',
        note: 'The Swiss franc is a classic safe-haven currency and is also legal tender in Liechtenstein.'
    },
    {
        code: 'SEK', name: 'Swedish Krona', plural: 'Swedish kronor', symbol: 'kr', flag: 'se', region: 'Europe',
        country: 'Sweden', aliases: ['krona', 'kronor'],
        bank: 'Sveriges Riksbank', subunit: '100 öre',
        note: 'Sweden\'s Riksbank, founded in 1668, is the oldest central bank in the world.'
    },
    {
        code: 'NOK', name: 'Norwegian Krone', plural: 'Norwegian kroner', symbol: 'kr', flag: 'no', region: 'Europe',
        country: 'Norway', aliases: ['krone', 'kroner'],
        bank: 'Norges Bank', subunit: '100 øre',
        note: 'As a major oil and gas exporter, Norway\'s krone is sensitive to energy prices.'
    },
    {
        code: 'DKK', name: 'Danish Krone', plural: 'Danish kroner', symbol: 'kr', flag: 'dk', region: 'Europe',
        country: 'Denmark', aliases: ['krone', 'kroner'],
        bank: 'Danmarks Nationalbank', subunit: '100 øre',
        peg: { base: 'EUR', rate: 7.46038, kind: 'band', label: 'pegged to the euro at 7.46038 DKK per EUR within the ERM II band' },
        note: 'Denmark keeps the krone pegged to the euro through the ERM II mechanism, so EUR/DKK moves only fractionally.'
    },
    {
        code: 'PLN', name: 'Polish Zloty', plural: 'Polish zlotys', symbol: 'zł', flag: 'pl', region: 'Europe',
        country: 'Poland', aliases: ['zloty', 'złoty'],
        bank: 'Narodowy Bank Polski', subunit: '100 groszy',
        note: 'Poland is an EU member but has kept its own currency rather than adopting the euro.'
    },
    {
        code: 'CZK', name: 'Czech Koruna', plural: 'Czech korunas', symbol: 'Kč', flag: 'cz', region: 'Europe',
        country: 'Czech Republic', aliases: ['koruna', 'Czech crown'],
        bank: 'Czech National Bank', subunit: '100 haléřů (no longer minted)',
        note: 'The Czech koruna is often called the "Czech crown" in English. Most of its trade is with the eurozone, so EUR/CZK is its key rate.'
    },
    {
        code: 'HUF', name: 'Hungarian Forint', plural: 'Hungarian forints', symbol: 'Ft', flag: 'hu', region: 'Europe',
        country: 'Hungary', aliases: ['forint'],
        bank: 'Magyar Nemzeti Bank', subunit: 'no subunit in use',
        note: 'The forint was introduced in 1946 after the pengő suffered the worst hyperinflation ever recorded.'
    },
    {
        code: 'RON', name: 'Romanian Leu', plural: 'Romanian lei', symbol: 'lei', flag: 'ro', region: 'Europe',
        country: 'Romania', aliases: ['leu', 'lei'],
        bank: 'National Bank of Romania', subunit: '100 bani',
        note: 'Romania redenominated the leu in 2005, removing four zeros (10,000 old lei = 1 new leu).'
    },
    {
        code: 'TRY', name: 'Turkish Lira', plural: 'Turkish lira', symbol: '₺', flag: 'tr', region: 'Europe',
        country: 'Türkiye', aliases: ['lira', 'Turkish lira'],
        bank: 'Central Bank of the Republic of Türkiye', subunit: '100 kuruş',
        note: 'High inflation has made the Turkish lira one of the most volatile major emerging-market currencies.'
    },
    {
        code: 'RUB', name: 'Russian Ruble', plural: 'Russian rubles', symbol: '₽', flag: 'ru', region: 'Europe',
        country: 'Russia', aliases: ['ruble', 'rouble', 'rubles', 'roubles'],
        bank: 'Bank of Russia', subunit: '100 kopecks',
        note: 'Since 2022, sanctions and capital controls mean ruble rates can differ noticeably between data providers and exchange services.'
    },
    {
        code: 'UAH', name: 'Ukrainian Hryvnia', plural: 'Ukrainian hryvnias', symbol: '₴', flag: 'ua', region: 'Europe',
        country: 'Ukraine', aliases: ['hryvnia', 'grivna'],
        bank: 'National Bank of Ukraine', subunit: '100 kopiyok',
        note: 'The National Bank of Ukraine moved to a "managed flexibility" regime in October 2023 after more than a year of a fixed rate.'
    },
    {
        code: 'ISK', name: 'Icelandic Króna', plural: 'Icelandic krónur', symbol: 'kr', flag: 'is', region: 'Europe',
        country: 'Iceland', aliases: ['krona', 'Iceland krona'],
        bank: 'Central Bank of Iceland', subunit: 'no subunit in use',
        note: 'Iceland\'s króna is one of the smallest free-floating currencies in the world and can swing sharply.'
    },

    // ---- Middle East ----
    {
        code: 'AED', name: 'UAE Dirham', plural: 'UAE dirhams', symbol: 'Dh', flag: 'ae', region: 'Middle East',
        country: 'United Arab Emirates', aliases: ['dirham', 'Emirati dirham', 'Dubai dirham', 'Dhs'],
        bank: 'Central Bank of the UAE', subunit: '100 fils',
        peg: { base: 'USD', rate: 3.6725, kind: 'fixed', label: 'pegged to the US dollar at 3.6725 AED per USD since 1997' },
        note: 'The dirham is used in all seven emirates, including Dubai and Abu Dhabi, which is why people often search for "Dubai currency".'
    },
    {
        code: 'SAR', name: 'Saudi Riyal', plural: 'Saudi riyals', symbol: 'SR', flag: 'sa', region: 'Middle East',
        country: 'Saudi Arabia', aliases: ['riyal', 'Saudi riyal'],
        bank: 'Saudi Central Bank (SAMA)', subunit: '100 halalas',
        peg: { base: 'USD', rate: 3.75, kind: 'fixed', label: 'pegged to the US dollar at 3.75 SAR per USD since 1986' },
        note: 'Saudi Arabia is one of the world\'s largest sources of migrant-worker remittances, especially to South Asia and the Philippines.'
    },
    {
        code: 'QAR', name: 'Qatari Riyal', plural: 'Qatari riyals', symbol: 'QR', flag: 'qa', region: 'Middle East',
        country: 'Qatar', aliases: ['riyal', 'Qatar riyal'],
        bank: 'Qatar Central Bank', subunit: '100 dirhams',
        peg: { base: 'USD', rate: 3.64, kind: 'fixed', label: 'pegged to the US dollar at 3.64 QAR per USD since 2001' },
        note: 'Qatar\'s large expatriate workforce makes QAR to INR and QAR to PKR some of its most searched conversions.'
    },
    {
        code: 'KWD', name: 'Kuwaiti Dinar', plural: 'Kuwaiti dinars', symbol: 'KD', flag: 'kw', region: 'Middle East',
        country: 'Kuwait', aliases: ['dinar', 'Kuwait dinar'],
        bank: 'Central Bank of Kuwait', subunit: '1,000 fils',
        note: 'The Kuwaiti dinar is the highest-valued currency unit in the world. Since 2007 it has been managed against an undisclosed basket of currencies.'
    },
    {
        code: 'OMR', name: 'Omani Rial', plural: 'Omani rials', symbol: 'OMR', flag: 'om', region: 'Middle East',
        country: 'Oman', aliases: ['rial', 'Oman rial'],
        bank: 'Central Bank of Oman', subunit: '1,000 baisa',
        peg: { base: 'USD', rate: 0.3845, kind: 'fixed', label: 'pegged to the US dollar at 0.3845 OMR per USD since 1986' },
        note: 'Because of its low peg, one Omani rial is worth about 2.60 US dollars, making it one of the most valuable currency units.'
    },
    {
        code: 'BHD', name: 'Bahraini Dinar', plural: 'Bahraini dinars', symbol: 'BD', flag: 'bh', region: 'Middle East',
        country: 'Bahrain', aliases: ['dinar', 'Bahrain dinar'],
        bank: 'Central Bank of Bahrain', subunit: '1,000 fils',
        peg: { base: 'USD', rate: 0.376, kind: 'fixed', label: 'pegged to the US dollar at 0.376 BHD per USD' },
        note: 'One Bahraini dinar is worth about 2.66 US dollars, the second-highest unit value in the world after the Kuwaiti dinar.'
    },
    {
        code: 'JOD', name: 'Jordanian Dinar', plural: 'Jordanian dinars', symbol: 'JD', flag: 'jo', region: 'Middle East',
        country: 'Jordan', aliases: ['dinar', 'Jordan dinar'],
        bank: 'Central Bank of Jordan', subunit: '1,000 fils',
        peg: { base: 'USD', rate: 0.709, kind: 'fixed', label: 'pegged to the US dollar at 0.709 JOD per USD since 1995' },
        note: 'The Jordanian dinar is also widely used alongside the shekel in the West Bank.'
    },
    {
        code: 'ILS', name: 'Israeli New Shekel', plural: 'Israeli shekels', symbol: '₪', flag: 'il', region: 'Middle East',
        country: 'Israel', aliases: ['shekel', 'shekels'],
        bank: 'Bank of Israel', subunit: '100 agorot',
        note: 'The new shekel replaced the old shekel in 1985 at a rate of 1,000 to 1 after a period of very high inflation.'
    },
    {
        code: 'EGP', name: 'Egyptian Pound', plural: 'Egyptian pounds', symbol: 'E£', flag: 'eg', region: 'Africa',
        country: 'Egypt', aliases: ['Egypt pound', 'gineih'],
        bank: 'Central Bank of Egypt', subunit: '100 piastres',
        note: 'Egypt let the pound float more freely in March 2024, after which its value against the dollar dropped sharply.'
    },

    // ---- South Asia ----
    {
        code: 'INR', name: 'Indian Rupee', plural: 'Indian rupees', symbol: '₹', flag: 'in', region: 'South Asia',
        country: 'India', aliases: ['rupee', 'rupees', 'Rs'],
        bank: 'Reserve Bank of India', subunit: '100 paise',
        note: 'India is the world\'s largest recipient of remittances, with large inflows from the Gulf, the US and the UK.'
    },
    {
        code: 'PKR', name: 'Pakistani Rupee', plural: 'Pakistani rupees', symbol: 'Rs', flag: 'pk', region: 'South Asia',
        country: 'Pakistan', aliases: ['rupee', 'Pakistan rupee', 'Rs'],
        bank: 'State Bank of Pakistan', subunit: '100 paisa',
        note: 'Workers\' remittances, mostly from Saudi Arabia, the UAE, the UK and the US, are one of Pakistan\'s biggest sources of foreign currency.'
    },
    {
        code: 'BDT', name: 'Bangladeshi Taka', plural: 'Bangladeshi taka', symbol: '৳', flag: 'bd', region: 'South Asia',
        country: 'Bangladesh', aliases: ['taka', 'Tk'],
        bank: 'Bangladesh Bank', subunit: '100 poisha',
        note: 'Remittances from the Gulf states and garment exports are the main sources of dollars for Bangladesh.'
    },
    {
        code: 'LKR', name: 'Sri Lankan Rupee', plural: 'Sri Lankan rupees', symbol: 'Rs', flag: 'lk', region: 'South Asia',
        country: 'Sri Lanka', aliases: ['rupee', 'Sri Lanka rupee'],
        bank: 'Central Bank of Sri Lanka', subunit: '100 cents',
        note: 'The Sri Lankan rupee lost a large part of its value during the 2022 economic crisis before stabilising.'
    },
    {
        code: 'NPR', name: 'Nepalese Rupee', plural: 'Nepalese rupees', symbol: 'Rs', flag: 'np', region: 'South Asia',
        country: 'Nepal', aliases: ['rupee', 'Nepali rupee'],
        bank: 'Nepal Rastra Bank', subunit: '100 paisa',
        peg: { base: 'INR', rate: 1.6, kind: 'fixed', label: 'pegged to the Indian rupee at 1.6 NPR per INR' },
        note: 'Because of the peg to the Indian rupee, NPR moves against the dollar almost exactly like INR does.'
    },

    // ---- East & Southeast Asia ----
    {
        code: 'JPY', name: 'Japanese Yen', plural: 'Japanese yen', symbol: '¥', flag: 'jp', region: 'East & Southeast Asia',
        country: 'Japan', aliases: ['yen'],
        bank: 'Bank of Japan', subunit: 'no subunit in everyday use',
        note: 'The yen is the third most traded currency in the world, and prices in Japan are quoted in whole yen.'
    },
    {
        code: 'CNY', name: 'Chinese Yuan', plural: 'Chinese yuan', symbol: '¥', flag: 'cn', region: 'East & Southeast Asia',
        country: 'China', aliases: ['yuan', 'renminbi', 'RMB'],
        bank: 'People\'s Bank of China', subunit: '10 jiao / 100 fen',
        note: 'Renminbi is the official name of the currency and yuan is its unit. The onshore rate trades within a band around a daily fixing set by the central bank.'
    },
    {
        code: 'HKD', name: 'Hong Kong Dollar', plural: 'Hong Kong dollars', symbol: 'HK$', flag: 'hk', region: 'East & Southeast Asia',
        country: 'Hong Kong', aliases: ['HK dollar'],
        bank: 'Hong Kong Monetary Authority', subunit: '100 cents',
        peg: { base: 'USD', rate: 7.8, kind: 'band', label: 'linked to the US dollar within a 7.75–7.85 HKD per USD band since 1983' },
        note: 'Hong Kong banknotes are issued by three commercial banks: HSBC, Standard Chartered and Bank of China (Hong Kong).'
    },
    {
        code: 'SGD', name: 'Singapore Dollar', plural: 'Singapore dollars', symbol: 'S$', flag: 'sg', region: 'East & Southeast Asia',
        country: 'Singapore', aliases: ['Sing dollar'],
        bank: 'Monetary Authority of Singapore', subunit: '100 cents',
        note: 'Singapore runs monetary policy through the exchange rate itself, managing the SGD against an undisclosed basket of currencies.'
    },
    {
        code: 'KRW', name: 'South Korean Won', plural: 'South Korean won', symbol: '₩', flag: 'kr', region: 'East & Southeast Asia',
        country: 'South Korea', aliases: ['won', 'Korean won'],
        bank: 'Bank of Korea', subunit: 'no subunit in use',
        note: 'The won is closely tied to global tech demand because semiconductors are South Korea\'s largest export.'
    },
    {
        code: 'TWD', name: 'New Taiwan Dollar', plural: 'New Taiwan dollars', symbol: 'NT$', flag: 'tw', region: 'East & Southeast Asia',
        country: 'Taiwan', aliases: ['Taiwan dollar', 'NT dollar'],
        bank: 'Central Bank of the Republic of China (Taiwan)', subunit: '100 cents',
        note: 'Taiwan\'s chip exports make the TWD sensitive to global semiconductor demand.'
    },
    {
        code: 'THB', name: 'Thai Baht', plural: 'Thai baht', symbol: '฿', flag: 'th', region: 'East & Southeast Asia',
        country: 'Thailand', aliases: ['baht', 'Thailand baht'],
        bank: 'Bank of Thailand', subunit: '100 satang',
        note: 'Tourism is a major driver of baht demand. The 1997 float of the baht triggered the Asian financial crisis.'
    },
    {
        code: 'MYR', name: 'Malaysian Ringgit', plural: 'Malaysian ringgit', symbol: 'RM', flag: 'my', region: 'East & Southeast Asia',
        country: 'Malaysia', aliases: ['ringgit', 'RM'],
        bank: 'Bank Negara Malaysia', subunit: '100 sen',
        note: 'The ringgit was pegged to the US dollar from 1998 to 2005 and has floated in a managed way since.'
    },
    {
        code: 'IDR', name: 'Indonesian Rupiah', plural: 'Indonesian rupiah', symbol: 'Rp', flag: 'id', region: 'East & Southeast Asia',
        country: 'Indonesia', aliases: ['rupiah'],
        bank: 'Bank Indonesia', subunit: '100 sen (not used)',
        note: 'With more than 15,000 rupiah to the dollar, everyday prices in Indonesia often run into the tens of thousands.'
    },
    {
        code: 'PHP', name: 'Philippine Peso', plural: 'Philippine pesos', symbol: '₱', flag: 'ph', region: 'East & Southeast Asia',
        country: 'Philippines', aliases: ['peso', 'Philippine peso'],
        bank: 'Bangko Sentral ng Pilipinas', subunit: '100 sentimo',
        note: 'Money sent home by overseas Filipino workers in the US, the Gulf and Asia is a key support for the peso.'
    },
    {
        code: 'VND', name: 'Vietnamese Dong', plural: 'Vietnamese dong', symbol: '₫', flag: 'vn', region: 'East & Southeast Asia',
        country: 'Vietnam', aliases: ['dong'],
        bank: 'State Bank of Vietnam', subunit: 'no subunit in use',
        note: 'The State Bank of Vietnam sets a daily central rate and lets the dong trade within a band around it.'
    },
    {
        code: 'KHR', name: 'Cambodian Riel', plural: 'Cambodian riels', symbol: '៛', flag: 'kh', region: 'East & Southeast Asia',
        country: 'Cambodia', aliases: ['riel'],
        bank: 'National Bank of Cambodia', subunit: '10 kak / 100 sen (not used)',
        note: 'Cambodia is heavily dollarised: US dollars are used for most larger purchases, with riel commonly given as change.'
    },

    // ---- Central Asia ----
    {
        code: 'KZT', name: 'Kazakhstani Tenge', plural: 'Kazakhstani tenge', symbol: '₸', flag: 'kz', region: 'Central Asia',
        country: 'Kazakhstan', aliases: ['tenge'],
        bank: 'National Bank of Kazakhstan', subunit: '100 tiyn',
        note: 'Oil exports and the Russian ruble both have a strong influence on the tenge.'
    },

    // ---- Africa ----
    {
        code: 'ZAR', name: 'South African Rand', plural: 'South African rand', symbol: 'R', flag: 'za', region: 'Africa',
        country: 'South Africa', aliases: ['rand'],
        bank: 'South African Reserve Bank', subunit: '100 cents',
        note: 'The rand is also legal tender in Lesotho, Namibia and Eswatini through the Common Monetary Area.'
    },
    {
        code: 'NGN', name: 'Nigerian Naira', plural: 'Nigerian naira', symbol: '₦', flag: 'ng', region: 'Africa',
        country: 'Nigeria', aliases: ['naira'],
        bank: 'Central Bank of Nigeria', subunit: '100 kobo',
        note: 'Nigeria unified its official exchange-rate windows in 2023, which caused a large adjustment in the naira\'s value.'
    },
    {
        code: 'GHS', name: 'Ghanaian Cedi', plural: 'Ghanaian cedis', symbol: 'GH₵', flag: 'gh', region: 'Africa',
        country: 'Ghana', aliases: ['cedi', 'Ghana cedi'],
        bank: 'Bank of Ghana', subunit: '100 pesewas',
        note: 'Gold, cocoa and oil exports are the main sources of foreign currency supporting the cedi.'
    },
    {
        code: 'KES', name: 'Kenyan Shilling', plural: 'Kenyan shillings', symbol: 'KSh', flag: 'ke', region: 'Africa',
        country: 'Kenya', aliases: ['shilling', 'Kenya shilling'],
        bank: 'Central Bank of Kenya', subunit: '100 cents',
        note: 'Kenya is a pioneer of mobile money (M-Pesa), which handles a large share of domestic payments in shillings.'
    },
    {
        code: 'MAD', name: 'Moroccan Dirham', plural: 'Moroccan dirhams', symbol: 'DH', flag: 'ma', region: 'Africa',
        country: 'Morocco', aliases: ['Morocco dirham'],
        bank: 'Bank Al-Maghrib', subunit: '100 santim',
        note: 'The Moroccan dirham is managed against a basket of the euro and the US dollar within a fluctuation band. It is a different currency from the UAE dirham.'
    },
    {
        code: 'XOF', name: 'West African CFA Franc', plural: 'West African CFA francs', symbol: 'CFA', flag: 'sn', region: 'Africa',
        country: 'West African Economic and Monetary Union', aliases: ['CFA franc', 'franc CFA'],
        bank: 'Central Bank of West African States (BCEAO)', subunit: 'no subunit in use',
        peg: { base: 'EUR', rate: 655.957, kind: 'fixed', label: 'pegged to the euro at 655.957 XOF per EUR' },
        note: 'Used by eight countries including Senegal, Côte d\'Ivoire, Togo, Benin, Mali and Burkina Faso.'
    },
    {
        code: 'XAF', name: 'Central African CFA Franc', plural: 'Central African CFA francs', symbol: 'FCFA', flag: 'cm', region: 'Africa',
        country: 'Central African Economic and Monetary Community', aliases: ['CFA franc', 'franc CFA'],
        bank: 'Bank of Central African States (BEAC)', subunit: 'no subunit in use',
        peg: { base: 'EUR', rate: 655.957, kind: 'fixed', label: 'pegged to the euro at 655.957 XAF per EUR' },
        note: 'Used by six countries including Cameroon, Gabon, Chad and the Republic of the Congo. It has the same value as the West African CFA franc but the two are not interchangeable.'
    },

    // ---- Oceania ----
    {
        code: 'AUD', name: 'Australian Dollar', plural: 'Australian dollars', symbol: 'A$', flag: 'au', region: 'Oceania',
        country: 'Australia', aliases: ['Aussie dollar', 'Aussie'],
        bank: 'Reserve Bank of Australia', subunit: '100 cents',
        note: 'The Aussie dollar is also used in Kiribati, Nauru and Tuvalu, and tends to track commodity prices such as iron ore.'
    },
    {
        code: 'NZD', name: 'New Zealand Dollar', plural: 'New Zealand dollars', symbol: 'NZ$', flag: 'nz', region: 'Oceania',
        country: 'New Zealand', aliases: ['kiwi', 'Kiwi dollar'],
        bank: 'Reserve Bank of New Zealand', subunit: '100 cents',
        note: 'Traders nickname the NZD the "kiwi" after the bird on the one-dollar coin.'
    },
    {
        code: 'FJD', name: 'Fijian Dollar', plural: 'Fijian dollars', symbol: 'FJ$', flag: 'fj', region: 'Oceania',
        country: 'Fiji', aliases: ['Fiji dollar'],
        bank: 'Reserve Bank of Fiji', subunit: '100 cents',
        note: 'The Fijian dollar is managed against a basket of the currencies of Fiji\'s main trading partners.'
    },
    {
        code: 'PGK', name: 'Papua New Guinean Kina', plural: 'Papua New Guinean kina', symbol: 'K', flag: 'pg', region: 'Oceania',
        country: 'Papua New Guinea', aliases: ['kina'],
        bank: 'Bank of Papua New Guinea', subunit: '100 toea',
        note: 'Kina and toea are named after traditional shell money once used across Papua New Guinea.'
    }
];

const byCode = Object.fromEntries(currencies.map(c => [c.code, c]));

module.exports = { currencies, byCode };
