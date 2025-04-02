const puppeteer = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(stealthPlugin());

const scrapGDN = () => {
    const rows = document.querySelectorAll(".table__body .table__element");
    const csv = ['Czas;Kierunek;Przewoznik;Rejs;;Lotnisko wylotowe'];
    rows.forEach(row => {
        const time = row.querySelector(".table__time:not(.table__time_expected)").textContent;
        const airport = row.querySelector(".table__airport").textContent;
        const company = row.querySelector(".table__company").textContent;
        const flight = row.querySelector(".table__flight").textContent;
        csv.push(`${time};${airport};${company};${flight};;"GDN"`);
    });
    return csv.join("\n");
};

const scrapWRO = () => {
    const rows = document.querySelectorAll(".n-flights__data.desktop.n-flights__departures");
    const csv = ['Czas;Kierunek;Przewoznik;Rejs;;Lotnisko wylotowe'];
    rows.forEach(row => {
        const time = row.querySelector(".time")?.textContent || "Brak danych";
        const airport = row.querySelector(".direction__name")?.textContent.trim() || "Brak danych";
        const companyImg = row.querySelector("img");
        const company = companyImg ? companyImg.getAttribute("alt") : " ";
        const flight = row.querySelector(".direction__number")?.textContent.trim() || "Brak danych";
        csv.push(`${time};${airport};${company};${flight};;"WRO"`);
    });
    return csv.join("\n");
};

function scrapKTW() {
    const rows = document.querySelectorAll(".timetable__row.flight-board__row");
    const csv = ['Czas;Kierunek;Przewoznik;Rejs;;Lotnisko wylotowe'];
    rows.forEach(row => {
        const time = row.querySelector(".timetable__col.flight-board__col--1").textContent;
        const airport = row.querySelector(".timetable__col.flight-board__col--2").textContent;
        const companyImg = row.querySelector("img");
        const company = companyImg ? companyImg.getAttribute("alt") : " ";
        const flight = row.querySelector(".timetable__col.flight-board__col--4").textContent;
        const csvRow = [];
        csvRow.push(`${time};${airport};${company};${flight};;"KTW"`);
        csv.push(csvRow.join("\n"));
    });
    return csv.join("\n");
}

function scrapKRK() {
    const rows = document.querySelectorAll(".table-responsive.table-departures-arrivals table.table tbody tr");
    const csv = ['Czas;Kierunek;Rejs;;Lotnisko wylotowe'];
    rows.forEach(row => {
        const time = row.querySelector("th").textContent.trim();
        const tds = row.querySelectorAll("td");
        const airport = tds[0].textContent.trim();
        const flight = tds[1].textContent.trim();
        const csvRow = [];
        csvRow.push(`${time};${airport};${flight};;"KRK"`);
        csv.push(csvRow.join("\n"));
    });
    return csv.join("\n");
}

function scrapWMI() {
    const rows = document.querySelectorAll("table.departures-table tbody tr");
    const csv = ['Czas;Kierunek;Rejs;;Lotnisko wylotowe'];
    rows.forEach(row => {
        const tds = row.querySelectorAll("td");
        if (tds.length > 0) {
            const time = tds[2].textContent.trim();
            const airport = tds[1].textContent.trim();
            const flight = tds[0].textContent.trim();
            const csvRow = [];
            csvRow.push(`${time};${airport};${flight};;"WMI"`);
            csv.push(csvRow.join("\n"));
        }
    });
    return csv.join("\n");
}

function scrapBZG() {
    const table = document.querySelector('#departures').childNodes[1].childNodes[3]
    const rows = table.querySelectorAll('tr');
    const csv = ['Czas;Kierunek;Przewoznik;Rejs;;Lotnisko wylotowe'];
    rows.forEach(row => {
        const tds = row.querySelectorAll("td");
            const time = tds[0].childNodes[0]?.textContent.trim();
            const airport = tds[2].childNodes[0].textContent.trim();
            const flight = tds[1].childNodes[0].textContent.trim();
            const csvRow = [];
            csvRow.push(`${time};${airport};;${flight};;BZG`);
            csv.push(csvRow.join("\n"));
    });
    return csv.join("\n");
}

function scrapSSZ() {
    const rows = document.querySelectorAll("#departuresInfo tr");
    const csv = ['Czas;Kierunek;Rejs;;Lotnisko wylotowe'];
    rows.forEach(row => {
        const tds = row.querySelectorAll("td")
        const time = tds[0]?.textContent;
        const airport = tds[2]?.textContent;
        const flight = tds[1]?.textContent;
        const csvRow = [];
        csvRow.push(`${time};${airport};${flight};;"SSZ"`);
        csv.push(csvRow.join("\n"));
    });
    csv.splice(1, 1);
    return csv.join("\n");
}

function scrapRZE() {
    const rows = document.querySelectorAll(".table-responsive.timetable-departures tr");
    const csv = ['Czas;Kierunek;Przewoznik;Rejs;;Lotnisko wylotowe'];
    rows.forEach(row => {
        const tds = row.querySelectorAll("td")
        if(tds[1]) {
            const time = tds[1].textContent;
            const airport = tds[2].textContent;
            const companyImg = tds[0].querySelector("img");
            const company = companyImg ? companyImg.getAttribute("alt") : (tds[0].textContent ? tds[0].textContent.trim() : " ");
            const flight = tds[3].textContent;
            const csvRow = [];
            csvRow.push(`${time};${airport};${company};${flight};;"RZE"`);
            csv.push(csvRow.join("\n"));
        }
    });
    return csv.join("\n");
}

function scrapRDO() {
    const buttonsContainer = document.querySelector(".f-table__buttons-container");
    if (buttonsContainer) {
        const button = buttonsContainer.querySelectorAll("div")[1];
        if (button) {
            button.click();
        } 
    } 

    const start = Date.now();
    while (Date.now() - start < 2000) {}

    const rows = document.querySelectorAll(".f-table-container__content");
    const csv = ['Czas;Kierunek;Przewoznik;Rejs;;Lotnisko wylotowe'];
    rows.forEach(row => {
        const time = row.querySelector(".col.f-time").textContent.trim();
        const airport = row.querySelector(".f-direction__origin").textContent.trim();
        const companyImg = row.querySelector("img");
        const company = companyImg?.getAttribute("src")?.includes("lot-logo")
        ? "LOT"
        : companyImg?.getAttribute("src")?.includes("wizz")
        ? "WIZZAIR"
        : " ";
        const flight = row.querySelector(".f-direction__number").textContent.trim();
        const csvRow = [];
        csvRow.push(`${time};${airport};${company};${flight};;"RDO"`);
        csv.push(csvRow.join("\n"));
    });
    return csv.join("\n");
}

function scrapFlightRadar() {
    const rows = document.querySelectorAll("tr");
    const csv = ['Czas;Kierunek;Przewoznik;Rejs;;Lotnisko wylotowe'];
    rows.forEach(row => {
        const tds = row.querySelectorAll("td")
        if(tds[1]) {
            const time = tds[0].textContent;
            const airport = tds[2].textContent;
            const company = tds[3].textContent;
            const flight = tds[1].textContent;
            const csvRow = [];
            csvRow.push(`${time};${airport};${company};${flight};;${scrapers[selectedScraper].name}`);
            csv.push(csvRow.join("\n"));
        }
    });
    return csv.join("\n");
}

const scrapers = {
    "airport.gdansk.pl": { scrapeFunction: scrapGDN, name: "GDN" },
    "airport.wroclaw.pl": { scrapeFunction: scrapWRO, name: "WRO" },
    //"lotnisko-chopina.pl": { scrapeFunction: scrapWAW, name: "WAW" },
    "katowice-airport.com": { scrapeFunction: scrapKTW, name: "KTW" },
    //"poznanairport.pl": { scrapeFunction: scrapPOZ, name: "POZ" },
    "krakowairport.pl": { scrapeFunction: scrapKRK, name: "KRK" },
    "modlinairport.pl": { scrapeFunction: scrapWMI, name: "WMI" },
    "plb.pl": { scrapeFunction: scrapBZG, name: "BZG" },
    "airport.com.pl": { scrapeFunction: scrapSSZ, name: "SSZ" },
    "rzeszowairport.pl": { scrapeFunction: scrapRZE, name: "RZE" },
    //"lotniskowarszawa-radom.pl": { scrapeFunction: scrapRDO, name: "RDO" }
};

const scrapeData = async (url) => {
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                            '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await page.setViewport({ width: 1366, height: 768 });
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Upgrade-Insecure-Requests': '1'
    });

    await page.goto(url, { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 5000));

    await page.screenshot({ path: 'lotnisko_screenshot.png' });

    const selectedScraper = Object.keys(scrapers).find(key => url.includes(key));
    if (!selectedScraper) throw new Error("Nie obsługujemy tego lotniska.");

    if (scrapers[selectedScraper].name === "BZG") {
        await page.evaluate(() => {
            document.querySelector('.moove-gdpr-infobar-allow-all').click();
        });
    } else if (scrapers[selectedScraper].name === "RZE") {
        await page.evaluate(() => {
            document.querySelector('#cookies a b').click();
        });
    }

    const data = await page.evaluate(scrapers[selectedScraper].scrapeFunction);
    await browser.close();
    return { data, airportCode: scrapers[selectedScraper].name };
};

const saveCSV = (csvContent, airportCode) => {
    const filename = `tabela_odlotow_${airportCode}_${new Date().toISOString()}.csv`;
    fs.writeFileSync(filename, csvContent);
    console.log(`Plik zapisany jako: ${filename}`);
};

const runScraper = async (url) => {
    try {
        const { data, airportCode } = await scrapeData(url);
        saveCSV(data, airportCode);
    } catch (error) {
        console.error(error.message);
    }
};

(async () => {
    await Promise.all([
        runScraper('https://www.airport.gdansk.pl/loty/tablica-odlotow-p2.html'),
        runScraper('https://www.airport.wroclaw.pl/pasazer/odlatuje/sprawdz-status-lotu/'),
        runScraper('https://www.katowice-airport.com/'),
        runScraper('https://www.krakowairport.pl/pl/pasazer/loty/odloty'),
        runScraper('https://www.modlinairport.pl/pasazer/rozklad-lotow'),
        runScraper('https://plb.pl/'),
        runScraper('https://airport.com.pl/'),
        runScraper('https://www.rzeszowairport.pl/pl/pasazer/loty')
    ]);
    process.exit(0);
})();

// Nie działające: 
// runScraper('https://www.lotnisko-chopina.pl/pl/odloty.html')
// runScraper('https://poznanairport.pl/');
// runScraper('https://www.lotniskowarszawa-radom.pl/loty/przyloty-i-odloty?flight_type=arrivals&flight=')