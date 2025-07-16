document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const amountInput = document.getElementById('amount');
    const fromCurrencySelect = document.getElementById('from-currency');
    const toCurrencySelect = document.getElementById('to-currency');
    const resultInput = document.getElementById('result');
    const swapBtn = document.getElementById('swap-btn');
    const convertBtn = document.getElementById('convert-btn');
    const historicalBtn = document.getElementById('historical-btn');
    const exchangeRateText = document.getElementById('exchange-rate');
    const lastUpdatedText = document.getElementById('last-updated');
    const fromFlag = document.getElementById('from-flag');
    const toFlag = document.getElementById('to-flag');

    // Free API from ExchangeRate-API
    const API_URL = 'https://api.frankfurter.app';
    
    // Default currencies
    let fromCurrency = 'USD';
    let toCurrency = 'GBP';
    
 function loadFallbackCurrencies() {
    // Basic set of popular currencies as fallback
    const fallbackCurrencies = {
        'USD': { description: 'United States Dollar' },
        'EUR': { description: 'Euro' },
        'GBP': { description: 'British Pound' },
        'JPY': { description: 'Japanese Yen' },
        'AUD': { description: 'Australian Dollar' },
        'CAD': { description: 'Canadian Dollar' }
    };
    
    fromCurrencySelect.innerHTML = '';
    toCurrencySelect.innerHTML = '';
    
    for (const [code, details] of Object.entries(fallbackCurrencies)) {
        const option1 = document.createElement('option');
        option1.value = code;
        option1.textContent = `${code} - ${details.description}`;
        
        const option2 = option1.cloneNode(true);
        
        fromCurrencySelect.appendChild(option1);
        toCurrencySelect.appendChild(option2);
        
        if (code === 'USD') option1.selected = true;
        if (code === 'GBP') option2.selected = true;
    }
    
    fromCurrency = 'USD';
    toCurrency = 'GBP';
    updateFlag('from-flag', 'us');
    updateFlag('to-flag', 'gb');
}


 async function fetchCurrencies() {
    try {
        const response = await fetch(`${API_URL}/latest`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (!data.rates) {
            throw new Error('Invalid API response format');
        }
        
        // Rest of your function...
    } catch (error) {
        console.error('Error fetching currencies:', error);
        showError('Failed to load currency data. Please try again later.');
        // Fallback to a default set of currencies
        loadFallbackCurrencies();
    }
}
    



    // Convert currency
    async function convertCurrency() {
        const amount = parseFloat(amountInput.value);
        
        if (isNaN(amount)) {
            resultInput.value = '';
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/convert?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`);
            const data = await response.json();
            
            if (data.success) {
                const result = data.result;
                resultInput.value = result.toFixed(4);
                
                // Update exchange rate text
                const rate = data.info.rate;
                exchangeRateText.textContent = `1 ${fromCurrency} = ${rate.toFixed(6)} ${toCurrency}`;
                
                // Update last updated time
                const now = new Date();
                lastUpdatedText.textContent = `Rates updated: ${now.toLocaleTimeString()}`;
            } else {
                throw new Error('Conversion failed');
            }
        } catch (error) {
            console.error('Error converting currency:', error);
            showError('Conversion failed. Please try again.');
        }
    }
    
    // Swap currencies
    function swapCurrencies() {
        const temp = fromCurrency;
        fromCurrency = toCurrency;
        toCurrency = temp;
        
        // Update select values
        fromCurrencySelect.value = fromCurrency;
        toCurrencySelect.value = toCurrency;
        
        // Update flags
        updateFlag('from-flag', getCountryCode(fromCurrency));
        updateFlag('to-flag', getCountryCode(toCurrency));
        
        // Convert with new values
        convertCurrency();
    }
    
    // Update flag icon
    function updateFlag(elementId, countryCode) {
        const element = document.getElementById(elementId);
        if (element) {
            // Remove all flag classes
            Array.from(element.classList).forEach(className => {
                if (className.startsWith('fi-')) {
                    element.classList.remove(className);
                }
            });
            
            // Add new flag class
            if (countryCode) {
                element.classList.add(`fi-${countryCode.toLowerCase()}`);
            }
        }
    }
    
    // Get country code from currency code
    function getCountryCode(currencyCode) {
        const currencyToCountry = {
            'USD': 'us',
            'GBP': 'gb',
            'EUR': 'eu',
            'JPY': 'jp',
            'AUD': 'au',
            'CAD': 'ca',
            'CHF': 'ch',
            'CNY': 'cn',
            'SEK': 'se',
            'NZD': 'nz',
            'MXN': 'mx',
            'SGD': 'sg',
            'HKD': 'hk',
            'NOK': 'no',
            'KRW': 'kr',
            'TRY': 'tr',
            'RUB': 'ru',
            'INR': 'in',
            'BRL': 'br',
            'ZAR': 'za',
            'AED': 'ae',
            'AFN': 'af',
            'ALL': 'al',
            'AMD': 'am',
            'ANG': 'sx',
            'AOA': 'ao',
            'ARS': 'ar',
            'AWG': 'aw',
            'AZN': 'az',
            'BAM': 'ba',
            'BBD': 'bb',
            'BDT': 'bd',
            'BGN': 'bg',
            'BHD': 'bh',
            'BIF': 'bi',
            'BMD': 'bm',
            'BND': 'bn',
            'BOB': 'bo',
            'BSD': 'bs',
            'BTN': 'bt',
            'BWP': 'bw',
            'BYN': 'by',
            'BZD': 'bz',
            'CDF': 'cd',
            'CLP': 'cl',
            'COP': 'co',
            'CRC': 'cr',
            'CUP': 'cu',
            'CVE': 'cv',
            'CZK': 'cz',
            'DJF': 'dj',
            'DKK': 'dk',
            'DOP': 'do',
            'DZD': 'dz',
            'EGP': 'eg',
            'ERN': 'er',
            'ETB': 'et',
            'FJD': 'fj',
            'FKP': 'fk',
            'GEL': 'ge',
            'GHS': 'gh',
            'GIP': 'gi',
            'GMD': 'gm',
            'GNF': 'gn',
            'GTQ': 'gt',
            'GYD': 'gy',
            'HNL': 'hn',
            'HRK': 'hr',
            'HTG': 'ht',
            'HUF': 'hu',
            'IDR': 'id',
            'ILS': 'il',
            'IQD': 'iq',
            'IRR': 'ir',
            'ISK': 'is',
            'JMD': 'jm',
            'JOD': 'jo',
            'KES': 'ke',
            'KGS': 'kg',
            'KHR': 'kh',
            'KMF': 'km',
            'KPW': 'kp',
            'KWD': 'kw',
            'KYD': 'ky',
            'KZT': 'kz',
            'LAK': 'la',
            'LBP': 'lb',
            'LKR': 'lk',
            'LRD': 'lr',
            'LSL': 'ls',
            'LYD': 'ly',
            'MAD': 'ma',
            'MDL': 'md',
            'MGA': 'mg',
            'MKD': 'mk',
            'MMK': 'mm',
            'MNT': 'mn',
            'MOP': 'mo',
            'MRU': 'mr',
            'MUR': 'mu',
            'MVR': 'mv',
            'MWK': 'mw',
            'MYR': 'my',
            'MZN': 'mz',
            'NAD': 'na',
            'NGN': 'ng',
            'NIO': 'ni',
            'NPR': 'np',
            'OMR': 'om',
            'PAB': 'pa',
            'PEN': 'pe',
            'PGK': 'pg',
            'PHP': 'ph',
            'PKR': 'pk',
            'PLN': 'pl',
            'PYG': 'py',
            'QAR': 'qa',
            'RON': 'ro',
            'RSD': 'rs',
            'RWF': 'rw',
            'SAR': 'sa',
            'SBD': 'sb',
            'SCR': 'sc',
            'SDG': 'sd',
            'SHP': 'sh',
            'SLL': 'sl',
            'SOS': 'so',
            'SRD': 'sr',
            'SSP': 'ss',
            'STN': 'st',
            'SVC': 'sv',
            'SYP': 'sy',
            'SZL': 'sz',
            'THB': 'th',
            'TJS': 'tj',
            'TMT': 'tm',
            'TND': 'tn',
            'TOP': 'to',
            'TTD': 'tt',
            'TWD': 'tw',
            'TZS': 'tz',
            'UAH': 'ua',
            'UGX': 'ug',
            'UYU': 'uy',
            'UZS': 'uz',
            'VES': 've',
            'VND': 'vn',
            'VUV': 'vu',
            'WST': 'ws',
            'XAF': 'cm',
            'XCD': 'ag',
            'XOF': 'sn',
            'XPF': 'pf',
            'YER': 'ye',
            'ZMW': 'zm',
            'ZWL': 'zw'
        };
        
        return currencyToCountry[currencyCode] || '';
    }
    
    // Show error message
    function showError(message) {
        // In a real app, you might show this in a more visible way
        console.error(message);
        lastUpdatedText.textContent = message;
        lastUpdatedText.style.color = 'var(--error-color)';
        
        // Reset after 5 seconds
        setTimeout(() => {
            lastUpdatedText.style.color = '';
            lastUpdatedText.textContent = 'Rates updated: Just now';
        }, 5000);
    }
    
    // Event listeners
    amountInput.addEventListener('input', convertCurrency);
    fromCurrencySelect.addEventListener('change', function() {
        fromCurrency = this.value;
        updateFlag('from-flag', getCountryCode(fromCurrency));
        convertCurrency();
    });
    toCurrencySelect.addEventListener('change', function() {
        toCurrency = this.value;
        updateFlag('to-flag', getCountryCode(toCurrency));
        convertCurrency();
    });
    swapBtn.addEventListener('click', swapCurrencies);
    convertBtn.addEventListener('click', convertCurrency);
    historicalBtn.addEventListener('click', function() {
        alert('Historical rates feature coming soon!');
        // In a real app, this would open a date picker and show historical rates
    });
    
    // Initialize
    fetchCurrencies();
    
    // Auto-refresh rates every minute
    setInterval(convertCurrency, 60000);
});