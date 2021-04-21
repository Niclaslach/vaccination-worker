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
    const duration = 5 * 60 * 1000
    console.log(searchParams.get("countries"))
    const countries = searchParams.get("countries").split(",")

    let vaccinationWorldData = await vaccination_KV.get("vaccinationWorldData", {type: "json"})

    vaccinationWorldData = getCountries(vaccinationWorldData, countries)

    const icons = getIcons()

    let frames = []
    
    for (vaccinationCountryData of vaccinationWorldData) {
        try {
            frames.push({
                text: beautifyNumber(vaccinationCountryData.people_vaccinated),
                duration: duration,
                icon: icons[vaccinationCountryData.iso_code],
                goalData: {
                    start: 0,
                    current: vaccinationCountryData.people_vaccinated_per_hundred,
                    end: 100
                }
            })
        }
        catch {}
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
        DNK: "i44348"
    }
}
