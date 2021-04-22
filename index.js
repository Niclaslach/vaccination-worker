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
    const duration = 2 * 60 * 1000
    console.log(searchParams.get("countries"))
    let countries = []
    try { countries = searchParams.get("countries").split(",") } catch {}

    let vaccinationWorldData = await vaccination_KV.get("vaccinationWorldData", {type: "json"})

    console.log("ALL Countries Test")
    console.log(countries)
    vaccinationWorldData = getCountries(vaccinationWorldData, countries)

    const icons = getIcons()

    let frames_touple = []
    let frame = []
    
    for (vaccinationCountryData of vaccinationWorldData) {
        try {
            frame.push({
                text: vaccinationCountryData.country,
                icon: icons[vaccinationCountryData.iso_code]
            })

            frame.push({
                text: beautifyNumber(vaccinationCountryData.people_vaccinated),
                duration: duration,
                icon: icons[vaccinationCountryData.iso_code],
                goalData: {
                    start: 0,
                    current: vaccinationCountryData.people_vaccinated_per_hundred,
                    end: 100
                }
            })

            if (frame[1].icon == undefined || 
                frame[1].text == undefined || 
                frame[1].goalData.current == undefined) 
                {
                throw new Error()
            }
            

            frames_touple.push(frame)
            frame = []
            
        }
        catch {}
    }

    
    frames_touple.sort(() => Math.random() - 0.5)
    frames = []

    for (touple of frames_touple) {
        frames.push(touple[0])
        frames.push(touple[1])
    }
    
    return new Response(JSON.stringify({frames: frames}), { status: 200 })
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


function getCountries(data, countries){

    if (countries.length == 0) {
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
    return String((str.length > 7) ? str.substr(0, str.length - 6) + "." + str.substr(str.length - 6, 3) + "m" : str);
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
