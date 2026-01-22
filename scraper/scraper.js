const puppeteer = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(stealthPlugin());

const scrapGDN = () => {
    const rows = document.querySelectorAll(".table__body .table__element");
    const csv = ['Data;Czas;Kierunek;Przewoznik;Rejs;Status;;Lotnisko wylotowe'];

    const startDate = new Date();
    let lastHour = 0;
    let dayOffset = 0;

    rows.forEach(row => {
        const time = row.querySelector(".table__time:not(.table__time_expected)").textContent;
        const [hour, minute] = time.split(':').map(Number);
        const currentHour = hour;

        if (currentHour < lastHour) {
            dayOffset += 1;
        }

        const flightDate = new Date(startDate);
        flightDate.setDate(flightDate.getDate() + dayOffset);
        const formattedDate = flightDate.toISOString().split('T')[0];

        lastHour = currentHour;
        const airport = row.querySelector(".table__airport").textContent;
        const company = row.querySelector(".table__company").textContent;
        const flight = row.querySelector(".table__flight").textContent;
        csv.push(`${formattedDate};${time};${airport};${company};${flight};0;;"GDN"`);
    });
    return csv.join("\n");
};

const scrapWRO = () => {
    const rows = document.querySelectorAll(".n-flights__data.desktop.n-flights__departures");
    const csv = ['Data;Czas;Kierunek;Przewoznik;Rejs;Status;;Lotnisko wylotowe'];

    const startDate = new Date();
    let lastHour = 0;
    let dayOffset = 0;
    
    rows.forEach(row => {
        const time = row.querySelector(".time")?.textContent || "Brak danych";

        const [hour, minute] = time.split(':').map(Number);
        const currentHour = hour;

        if (currentHour < lastHour) {
            dayOffset += 1;
        }

        const flightDate = new Date(startDate);
        flightDate.setDate(flightDate.getDate() + dayOffset);
        const formattedDate = flightDate.toISOString().split('T')[0];
        lastHour = currentHour;

        const airport = row.querySelector(".direction__name")?.textContent.trim() || "Brak danych";
        const companyImg = row.querySelector("img");
        const company = companyImg ? companyImg.getAttribute("alt") : " ";
        const flight = row.querySelector(".direction__number")?.textContent.trim() || "Brak danych";
        csv.push(`${formattedDate};${time};${airport};${company};${flight};0;;"WRO"`);
    });
    return csv.join("\n");
};

function scrapKTW() {
    const rows = document.querySelectorAll(".timetable__row.flight-board__row");
    const csv = ['Data;Czas;Kierunek;Przewoznik;Rejs;Status;;Lotnisko wylotowe'];
    const startDate = new Date();
    let lastHour = 0;
    let dayOffset = 0;
    rows.forEach(row => {
        const time = row.querySelector(".timetable__col.flight-board__col--1").textContent;

        const [hour, minute] = time.split(':').map(Number);
        const currentHour = hour;

        if (currentHour < lastHour) {
            dayOffset += 1;
        }

        const flightDate = new Date(startDate);
        flightDate.setDate(flightDate.getDate() + dayOffset);
        const formattedDate = flightDate.toISOString().split('T')[0];
        lastHour = currentHour;

        const airport = row.querySelector(".timetable__col.flight-board__col--2").textContent;
        const companyImg = row.querySelector("img");
        const company = companyImg ? companyImg.getAttribute("alt") : " ";
        const flight = row.querySelector(".timetable__col.flight-board__col--4").textContent;
        const csvRow = [];
        csvRow.push(`${formattedDate};${time};${airport};${company};${flight};0;;"KTW"`);
        csv.push(csvRow.join("\n"));
    });
    return csv.join("\n");
}

function scrapKRK() {
    const rows = document.querySelectorAll(".table-responsive.table-departures-arrivals table.table tbody tr");
    const csv = ['Data;Czas;Kierunek;Przewoznik;Rejs;Status;;Lotnisko wylotowe'];
    const startDate = new Date();
    let lastHour = 0;
    let dayOffset = 0;
    rows.forEach(row => {
        const time = row.querySelector("th").textContent.trim();
        const [hour, minute] = time.split(':').map(Number);
        const currentHour = hour;

        if (currentHour < lastHour) {
            dayOffset += 1;
        }

        const flightDate = new Date(startDate);
        flightDate.setDate(flightDate.getDate() + dayOffset);
        const formattedDate = flightDate.toISOString().split('T')[0];
        lastHour = currentHour;

        const tds = row.querySelectorAll("td");
        const airport = tds[0].textContent.trim();
        const flight = tds[1].textContent.trim();
        const csvRow = [];
        csvRow.push(`${formattedDate};${time};${airport};;${flight};0;;"KRK"`);
        csv.push(csvRow.join("\n"));
    });
    return csv.join("\n");
}

function scrapWMI() {
    const rows = document.querySelectorAll("table.departures-table tbody tr");
    const csv = ['Data;Czas;Kierunek;Przewoznik;Rejs;Status;;Lotnisko wylotowe'];
    const startDate = new Date();
    let lastHour = 0;
    let dayOffset = 0;
    rows.forEach(row => {
        const tds = row.querySelectorAll("td");
        if (tds.length > 0) {
            const time = tds[2].textContent.trim();
            const [hour, minute] = time.split(':').map(Number);
            const currentHour = hour;
    
            if (currentHour < lastHour) {
                dayOffset += 1;
            }
    
            const flightDate = new Date(startDate);
            flightDate.setDate(flightDate.getDate() + dayOffset);
            const formattedDate = flightDate.toISOString().split('T')[0];
            lastHour = currentHour;

            const airport = tds[1].textContent.trim();
            const flight = tds[0].textContent.trim();
            const csvRow = [];
            csvRow.push(`${formattedDate};${time};${airport};;${flight};0;"WMI"`);
            csv.push(csvRow.join("\n"));
        }
    });
    return csv.join("\n");
}

function scrapSSZ() {
    const rows = document.querySelectorAll("#departuresInfo tr");
    const csv = ['Data;Czas;Kierunek;Przewoznik;Rejs;Status;;Lotnisko wylotowe'];
    const startDate = new Date();
    let lastHour = 0;
    let dayOffset = 0;
    rows.forEach(row => {
        const tds = row.querySelectorAll("td")
        const time = tds[0]?.textContent;

        if (!time || !time.includes(':')) return;

        const [hour, minute] = time.split(':').map(Number);
        const currentHour = hour;

        if (currentHour < lastHour) {
            dayOffset += 1;
        }

        const flightDate = new Date(startDate);
        flightDate.setDate(flightDate.getDate() + dayOffset);
        const formattedDate = flightDate.toISOString().split('T')[0];
        lastHour = currentHour;

        const airport = tds[2]?.textContent;
        const flight = tds[1]?.textContent;
        const csvRow = [];
        csvRow.push(`${formattedDate};${time};${airport};;${flight};0;;"SSZ"`);
        csv.push(csvRow.join("\n"));
    });
    return csv.join("\n");
}

function scrapRZE() {
    const rows = document.querySelectorAll(".table-responsive.timetable-departures tr");
    const csv = ['Data;Czas;Kierunek;Przewoznik;Rejs;Status;;Lotnisko wylotowe'];
    const startDate = new Date();
    let lastHour = 0;
    let dayOffset = 0;
    rows.forEach(row => {
        const tds = row.querySelectorAll("td")
        if(tds[1]) {
            const time = tds[1].textContent;

            const [hour, minute] = time.split(':').map(Number);
            const currentHour = hour;
    
            if (currentHour < lastHour) {
                dayOffset += 1;
            }
    
            const flightDate = new Date(startDate);
            flightDate.setDate(flightDate.getDate() + dayOffset);
            const formattedDate = flightDate.toISOString().split('T')[0];
            lastHour = currentHour;

            const airport = tds[2].textContent;
            const companyImg = tds[0].querySelector("img");
            const company = companyImg ? companyImg.getAttribute("alt") : (tds[0].textContent ? tds[0].textContent.trim() : " ");
            const flight = tds[3].textContent;
            const csvRow = [];
            csvRow.push(`${formattedDate};${time};${airport};${company};${flight};0;;"RZE"`);
            csv.push(csvRow.join("\n"));
        }
    });
    return csv.join("\n");
}

function scrapBZG() {
    const rows = document.querySelectorAll("#departures tbody tr");
    const csv = ['Data;Czas;Kierunek;Przewoznik;Rejs;Status;;Lotnisko wylotowe'];
    const startDate = new Date();
    let lastHour = 0;
    let dayOffset = 0;
    rows.forEach(row => {
        const tds = row.querySelectorAll("td");
        const time = tds[0].childNodes[0]?.textContent.trim();
        const [hour, minute] = time.split(':').map(Number);
        const currentHour = hour;

        if (currentHour < lastHour) {
            dayOffset += 1;
        }

        const flightDate = new Date(startDate);
        flightDate.setDate(flightDate.getDate() + dayOffset);
        const formattedDate = flightDate.toISOString().split('T')[0];
        lastHour = currentHour;
        const airport = tds[2].childNodes[0].textContent.trim();
        const flight = tds[0].childNodes[2]?.textContent.trim();
        const csvRow = [];
        csvRow.push(`${formattedDate};${time};${airport};;${flight};0;;BZG`);

        csv.push(csvRow.join("\n"));
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
    const csv = ['Data;Czas;Kierunek;Przewoznik;Rejs;Status;;Lotnisko wylotowe'];


    function extractDayFromText(text) {
        const match = text.match(/(\d{1,2})/);
        return match ? parseInt(match[1], 10) : null;
    }

    function generateFormattedDate(day) {
        let formattedDate;
        if (day !== null) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const dayFormatted = String(day).padStart(2, '0');
            formattedDate = `${year}-${month}-${dayFormatted}`;
        
            console.log("Sformatowana data:", formattedDate);
        } else {
            console.log("Nie udało się wyciągnąć dnia z tekstu.");
        }
        return formattedDate
    }

    rows.forEach(row => {
        const date = row.previousElementSibling.innerText
        const day = extractDayFromText(date);
        const formattedDate = generateFormattedDate(day)
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
        csvRow.push(`${formattedDate};${time};${airport};${company};${flight};0;;"RDO"`);
        csv.push(csvRow.join("\n"));
    });
    return csv.join("\n");
}

function scrapPOZ() {
    const rows = document.querySelectorAll(".boardArchive__itemColumns");
    const csv = ['Data;Czas;Kierunek;Przewoznik;Rejs;Status;;Lotnisko wylotowe'];
    const startDate = new Date();
    let lastHour = 0;
    let dayOffset = 0;
    rows.forEach(row => {
        const timeContainer = row.querySelector(".boardArchive__itemColumn.boardArchive__itemColumn--time");
        const timeNode = timeContainer.querySelector("div").childNodes[1];
        const time = timeNode ? timeNode.textContent.trim() : '-';
        const [hour, minute] = time.split(':').map(Number);
        const currentHour = hour;

        if (currentHour < lastHour) {
            dayOffset += 1;
        }

        const flightDate = new Date(startDate);
        flightDate.setDate(flightDate.getDate() + dayOffset);
        const formattedDate = flightDate.toISOString().split('T')[0];
        lastHour = currentHour;
        const airport = row.querySelector(".boardArchive__itemColumn.boardArchive__itemColumn--destination").textContent.trim();
        const companyImg = row.querySelector("img");
        const company = companyImg ? companyImg.getAttribute("alt") : " ";
        const flight = row.querySelector(".boardArchive__itemColumn.boardArchive__itemColumn--number").textContent.trim();
        const csvRow = [];
        csvRow.push(`${formattedDate};${time};${airport};${company};${flight};0;;"POZ"`);
        csv.push(csvRow.join("\n"));
    });
    csv.splice(1, 1);
    return csv.join("\n");
}

function scrapWAW() {
    const rows = document.querySelectorAll("table.flightboard.departures tbody tr.tooltip");
    const csv = ['Data;Czas;Kierunek;Przewoznik;Rejs;Status;;Lotnisko wylotowe'];
    const startDate = new Date();
    let lastHour = 0;
    let dayOffset = 0;
    rows.forEach(row => {
        const tds = row.querySelectorAll("td");
        const time = tds[0].textContent.trim();
        const [hour, minute] = time.split(':').map(Number);
        const currentHour = hour;

        if (currentHour < lastHour) {
            dayOffset += 1;
        }

        const flightDate = new Date(startDate);
        flightDate.setDate(flightDate.getDate() + dayOffset);
        const formattedDate = flightDate.toISOString().split('T')[0];
        lastHour = currentHour;
        const airport = tds[1].textContent.trim();
        const company = tds[4].textContent.trim();
        const flight = tds[2].textContent.trim();
        const csvRow = [];
        csvRow.push(`${formattedDate};${time};${airport};${company};${flight};0;;"WAW"`);
        csv.push(csvRow.join("\n"));
    });
    csv.splice(1, 1);
    return csv.join("\n");

}

const scrapers = {
    "airport.gdansk.pl": { scrapeFunction: scrapGDN, name: "GDN" },
    "airport.wroclaw.pl": { scrapeFunction: scrapWRO, name: "WRO" },
    "katowice-airport.com": { scrapeFunction: scrapKTW, name: "KTW" },
    "krakowairport.pl": { scrapeFunction: scrapKRK, name: "KRK" },
    "modlinairport.pl": { scrapeFunction: scrapWMI, name: "WMI" },
    "airport.com.pl": { scrapeFunction: scrapSSZ, name: "SSZ" },
    "rzeszowairport.pl": { scrapeFunction: scrapRZE, name: "RZE" },
    "plb.pl": { scrapeFunction: scrapBZG, name: "BZG" },
    "lotniskowarszawa-radom.pl": { scrapeFunction: scrapRDO, name: "RDO" },
    "poznanairport.pl": { scrapeFunction: scrapPOZ, name: "POZ" },
    "lotnisko-chopina.pl": { scrapeFunction: scrapWAW, name: "WAW" }
};

const scrapeData = async (url) => {
    const selectedScraperKey = Object.keys(scrapers).find(key => url.includes(key));
    if (!selectedScraperKey) throw new Error("Nie obsługujemy tego lotniska.");
    const selectedScraper = scrapers[selectedScraperKey];

    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();

    if(selectedScraper.name === "POZ" || selectedScraper.name === "WAW" || selectedScraper.name === "BZG") {
        await page.setViewport({
            width: 375,
            height: 667,
            isMobile: true,
            hasTouch: true
        });
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/16A366 Safari/604.1' // User-agent iPhone
        });
    } else {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
            '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    }


    await page.goto(url, { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 5000));

    //await page.screenshot({ path: 'lotnisko_screenshot.png' });

    if (selectedScraper.name === "BZG") {
        await page.screenshot({ path: "debug_bzg_1_after_goto.png", fullPage: true });
        await page.evaluate(() => {
            document.querySelector('[aria-label="Akceptuj wszystko"]').click();
        });
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: "debug_bzg_2_after_cookies.png", fullPage: true });
    } else if (selectedScraper.name === "RZE") {
        await page.evaluate(() => {
            document.querySelector('#cookies a b').click();
        });
    }

    const data = await page.evaluate(selectedScraper.scrapeFunction);
    await browser.close();
    return { data, airportCode: selectedScraper.name };
};

const saveCSV = (csvContent, airportCode) => {
    const folderPath = 'scraper_output/';
    const fileName = `${folderPath}tabela_odlotow_${airportCode}.csv`;

    const newLines = csvContent.trim().split('\n');
    const header = newLines[0];
    const newData = newLines.slice(1);

    let existingData = [];
    if (fs.existsSync(fileName)) {
        const fileContent = fs.readFileSync(fileName, 'utf8');
        existingData = fileContent.trim().split('\n').slice(1);
    }

    const { updatedData, changes } = appendNewData(existingData, newData);

    const finalContent = [header, ...updatedData].join('\n');
    fs.writeFileSync(fileName, finalContent);
    console.log(`Zaktualizowano plik: ${fileName}`);

    if (changes.length > 0) {
        console.log('\n Wykryto zmiany:\n');
        changes.forEach(change => console.log(change));
    } else {
        console.log('\nBrak nowych danych lub zmian w godzinach.');
    }
};

function appendNewData(existingRows, newRows) {
    const seen = new Set(existingRows.map(row => row.split(';').slice(0, 5).join(';')));
    const updatedData = [...existingRows];
    const changes = [];

    for (const row of newRows) {
        const parts = row.split(';');
        const key = parts.slice(0, 5).join(';');
        const existingMatch = existingRows.find(r => r.includes(parts[4]) && r.startsWith(parts[0]));

        if (seen.has(key)) continue;

        if (existingMatch) {
            const oldTime = existingMatch.split(';')[1];
            const newTime = parts[1];
            const diff = timeDiffMinutes(oldTime, newTime);

            if (oldTime !== newTime) {
                changes.push(`✈️ ZMIANA: ${parts[4]} dnia ${parts[0]} – ${oldTime} → ${newTime} (${diff} min)`);
            }
        } else {
            changes.push(`➕ NOWY wpis: ${row}`);
            updatedData.push(row);
            seen.add(key);
        }
    }

    updatedData.sort((a, b) => {
        const [dateA, timeA] = a.split(';');
        const [dateB, timeB] = b.split(';');
        return new Date(`${dateA}T${timeA}`) - new Date(`${dateB}T${timeB}`);
    });

    return { updatedData, changes };
}

function timeDiffMinutes(t1, t2) {
    const [h1, m1] = t1.split(':').map(Number);
    const [h2, m2] = t2.split(':').map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
}


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
        runScraper('https://plb.pl/'),
        runScraper('https://www.airport.gdansk.pl/loty/tablica-odlotow-p2.html'),
        runScraper('https://www.airport.wroclaw.pl/pasazer/odlatuje/sprawdz-status-lotu/'),
        runScraper('https://www.katowice-airport.com/'),
        runScraper('https://www.krakowairport.pl/pl/pasazer/loty/odloty'),
        runScraper('https://www.modlinairport.pl/pasazer/rozklad-lotow'),
        runScraper('https://airport.com.pl/'),
        runScraper('https://www.rzeszowairport.pl/pl/pasazer/loty'),
        runScraper('https://www.lotniskowarszawa-radom.pl/loty/przyloty-i-odloty?flight_type=arrivals&flight='),
        runScraper('https://poznanairport.pl/loty/przyloty-odloty/odloty/'),
        runScraper('https://www.lotnisko-chopina.pl/pl/odloty.html')
    ]);
    process.exit(0);
})();