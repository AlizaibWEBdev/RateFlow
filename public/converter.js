// Client-side converter. Rates are embedded by the server (USD base), so
// conversion is instant and needs no API calls or keys in the browser.
(function () {
    var dataEl = document.getElementById('rf-data');
    if (!dataEl) return;
    var data = JSON.parse(dataEl.textContent);
    var rates = data.rates;
    var flags = data.flags || {};

    var amountEl = document.getElementById('conv-amount');
    var fromEl = document.getElementById('conv-from');
    var toEl = document.getElementById('conv-to');
    var swapEl = document.getElementById('conv-swap');
    var valueEl = document.getElementById('conv-value');
    var lineEl = document.getElementById('conv-line');
    var linkEl = document.getElementById('conv-link');
    var fromFlag = document.getElementById('conv-from-flag');
    var toFlag = document.getElementById('conv-to-flag');
    var initialPair = fromEl.value + '-' + toEl.value;

    // Only the selected currency is server-rendered; add the rest here.
    function fillSelect(select) {
        var current = select.value;
        var html = '';
        Object.keys(data.names).sort().forEach(function (code) {
            html += '<option value="' + code + '"' + (code === current ? ' selected' : '') + '>' + code + ' – ' + data.names[code] + '</option>';
        });
        select.innerHTML = html;
    }
    fillSelect(fromEl);
    fillSelect(toEl);

    function group(n, d) {
        return n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
    }

    function fmtRate(r) {
        if (r >= 1000) return group(r, 2);
        if (r >= 1) return group(r, 4);
        var digits = Math.min(10, Math.max(4, 4 - Math.floor(Math.log10(r))));
        return r.toFixed(digits).replace(/(\.\d*?[1-9])0+$/, '$1');
    }

    function fmtMoney(n) {
        if (n === 0) return '0';
        return Math.abs(n) >= 1 ? group(n, 2) : fmtRate(n);
    }

    function setFlag(el, code) {
        el.className = 'fi' + (flags[code] ? ' fi-' + flags[code] : '');
    }

    function update() {
        var from = fromEl.value;
        var to = toEl.value;
        var amount = parseFloat(amountEl.value);
        var rate = rates[to] / rates[from];
        setFlag(fromFlag, from);
        setFlag(toFlag, to);
        if (!isFinite(amount) || amount < 0) {
            valueEl.textContent = 'Enter an amount';
        } else {
            valueEl.textContent = amount.toLocaleString('en-US', { maximumFractionDigits: 4 }) + ' ' + from + ' = ' + fmtMoney(amount * rate) + ' ' + to;
        }
        lineEl.textContent = '1 ' + from + ' = ' + fmtRate(rate) + ' ' + to + ' · 1 ' + to + ' = ' + fmtRate(1 / rate) + ' ' + from;
        var pair = from + '-' + to;
        if (pair !== initialPair && from !== to) {
            linkEl.href = '/convert/' + from.toLowerCase() + '-to-' + to.toLowerCase();
            linkEl.textContent = 'See the full ' + from + ' to ' + to + ' page →';
            linkEl.hidden = false;
        } else {
            linkEl.hidden = true;
        }
    }

    amountEl.addEventListener('input', update);
    fromEl.addEventListener('change', update);
    toEl.addEventListener('change', update);
    swapEl.addEventListener('click', function () {
        var t = fromEl.value;
        fromEl.value = toEl.value;
        toEl.value = t;
        update();
    });
})();
