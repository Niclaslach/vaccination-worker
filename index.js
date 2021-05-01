const Router = require('./router')


addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

addEventListener("scheduled", event => {
    event.waitUntil(handleUpdateData())
})

/**
 * Respond to the request
 * @param {Request} request
 */

async function handleRequest(request) {
    const r = new Router()

    r.get('.*/get_data', () => handleUpdateData())

    r.post('.*/la_metric', request => handleLaMetric(request))
    r.get('.*/la_metric', request => handleLaMetric(request))

    const resp = await r.route(request)
    return resp
}

async function handleUpdateData() {
    const vaccinationWorldData = await getData()

    await vaccination_KV.put("vaccinationWorldData", JSON.stringify(vaccinationWorldData))

    return new Response(`Updated ${vaccinationWorldData.length} Countries`, { status: 200 })
}



async function handleLaMetric(request) {

    const { searchParams } = new URL(request.url)
    //vaccination_KV.put("lastRequestDEV", JSON.stringify(request.url)) //Comment out for Deployment
    console.log(searchParams.toString())
    let duration = NaN
    try { duration = Math.ceil(parseFloat(searchParams.get("duration")) * 1000 )} catch { }
    duration = isNaN(duration)? 2 * 60 * 1000 : duration
    console.log(`duration = ${duration}`)

    let countries = ['']
    try { countries = searchParams.get("countries").split(",") } catch { }
    const showCountryName = searchParams.get("showCountryName") == "true" ? true : false
    const showDate = searchParams.get("showDate") == "true" ? true : false
    const sortCountriesByDate = searchParams.get("sortCountriesByDate") == "true" ? true : false
    const showDailyIncrease = searchParams.get("showDailyIncrease") == "Daily Increase" ? true : false

    let vaccinationWorldData = await vaccination_KV.get("vaccinationWorldData", { type: "json" })


    console.log("ALL Countries Test")
    console.log(countries)
    vaccinationWorldData = shuffleArray(getCountries(vaccinationWorldData, countries))
    if (sortCountriesByDate) { 
        vaccinationWorldData.sort(function(a, b) {
            var keyA = a.date,
              keyB = b.date;
            // Compare the 2 dates
            if (keyA < keyB) return 1;
            if (keyA > keyB) return -1;
            return 0;
          })
    }

    const icons = getIcons()

    let frames = []
    let frame = []
    let text = ""
    
    
    for (vaccinationCountryData of vaccinationWorldData) {
        try {
            frame = []
            if (showCountryName) {
                if (showDate) {
                    text = vaccinationCountryData.country + " " + vaccinationCountryData.date
                } else {
                    text = vaccinationCountryData.country
                }
                frame.push({
                    text: text,
                    icon: icons[vaccinationCountryData.iso_code]
                })
            }

            frame.push({
                text: beautifyNumber(showDailyIncrease ? vaccinationCountryData.daily_vaccinations : vaccinationCountryData.people_vaccinated),
                duration: duration,
                icon: icons[vaccinationCountryData.iso_code],
                goalData: {
                    start: 0,
                    current: vaccinationCountryData.people_vaccinated_per_hundred,
                    end: 100
                }
            })
            console.log( )
            if (frame[frame.length-1].icon == undefined ||
                frame[frame.length-1].text == undefined ||
                frame[frame.length-1].goalData.current == undefined ) {
            } else if ((frame.length +frames.length) >20) {
                
                break
            } else {
                frames = frames.concat(frame)
            }

        }
        catch { }
    }


    console.log(`Number of frames returned = ${frames.length}`)

    return new Response(JSON.stringify({ frames: frames }), { status: 200 })
}


async function getData() {
    const response = await fetch('https://github.com/owid/covid-19-data/raw/master/public/data/vaccinations/vaccinations.json')

    const server = response.headers.get('server')

    const isThisWorkerErrorNotErrorWithinScrapedSite = (
        [530, 503, 502, 403, 400].includes(response.status) &&
        (server === 'cloudflare' || !server /* Workers preview editor */)
    )

    if (isThisWorkerErrorNotErrorWithinScrapedSite) {
        return generateJSONResponse({
            error: `Status ${response.status} requesting ${url}`
        }, pretty)
    }

    const rawVaccinationData = await response.json();
    console.log(rawVaccinationData[0])
    console.log(rawVaccinationData[0].data.length - 1)

    let latestVaccinations = []
    for (country of rawVaccinationData) {
        latestVaccinations.push({
            country: country.country,
            iso_code: country.iso_code,
            ...country.data[country.data.length - 1]
        })
    }

    return latestVaccinations

}


function getCountries(data, countries) {

    if (countries[0] == '') {
        console.log(`No Country Parameter`)
        return data
    }

    let selectedData = []

    for (countryData of data) {
        for (country of countries) {
            if (countryData.iso_code == country) {
                selectedData.push(countryData)
                break
            }
        }
    }

    return selectedData
}

function beautifyNumber(int) {
    const str = String(int)
    return String((str.length > 7) ? str.substr(0, str.length - 6) + "." + str.substr(str.length - 6, Math.max(11-str.length,0)) + "m" : str);
}

function shuffleArray(array) { //Source: http://thenewcode.com/1095/Shuffling-and-Sorting-JavaScript-Arrays
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function getIcons() {
    return {
        DEU: "i44344",
        DNK: "i44348",
        AFG: "i44986",
        AGO: "i44987",
        ARG: "i44988",
        ARM: "i44989",
        ABW: "i44990",
        AUS: "i44991",
        AUT: "i44992",
        BHS: "i44994",
        BHR: "i44995",
        BGD: "i44996",
        BEL: "i44997",
        BOL: "i44998",
        BWA: "i44999",
        BRA: "i45000",
        BGR: "i45001",
        CMR: "i45003",
        CAN: "i45004",
        CHL: "i45005",
        CHN: "i45006",
        COL: "i45007",
        HRV: "i45008",
        CZE: "i45009",
        ECU: "i45010",
        FIN: "i45011",
        FRA: "i45012",
        GAB: "i45013",
        HKG: "i45014",
        HUN: "i45015",
        ISL: "i45016",
        IND: "i45017",
        IDN: "i45018",
        IRL: "i45019",
        ISR: "i45020",
        ITA: "i45021",
        JPN: "i45022",
        LAO: "i45023",
        LIE: "i45024",
        LUX: "i45025",
        MAC: "i45026",
        MLI: "i45027",
        MEX: "i45028",
        MAR: "i45029",
        NAM: "i45030",
        NLD: "i45031",
        NZL: "i44991",
        NOR: "i45032",
        PER: "i45033",
        PHL: "i45034",
        POL: "i45035",
        RUS: "i45036",
        SLE: "i45037",
        SGP: "i45038",
        ESP: "i45039",
        SWE: "i45040",
        CHE: "i45041",
        TWN: "i45042",
        UKR: "i45043",
        GBR: "i44343",
        USA: "i45044",
        VNM: "i45045"
    }
}
