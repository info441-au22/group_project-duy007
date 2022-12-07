
const escapeHTML = str => !str ? str : str.replace(/[&<>'"]/g, 
    tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag]));

function getLastUpdate(modified_date) {
    const time_diff = Date.now() - Date.parse(modified_date);
    console.log(time_diff)
    const dd = Math.floor(time_diff/1000/60/60/24);
    if (dd > 0) return new Date(modified_date).toDateString();
    const hh = Math.floor(time_diff/1000/60/60);
    if (hh > 0) return `${hh} Hours ago`;
    const mm = Math.floor(time_diff/1000/60);
    if (mm > 0) return `${mm} minutes ago`;
    const ss = Math.floor(time_diff/1000/60);
    if (ss > 0) return `${ss} seconds ago`;
    return `Right now`
}

function stringToTime(time_string) {
    // time string: HH:MM
    time_string = time_string.split(":")
    const hh = Math.floor(parseInt(time_string[0].trim())*60*60*1000)
    const mm = Math.floor(parseInt(time_string[1].trim())*60*1000)
    console.log(hh+mm)
    return hh+mm
}

function timeToString(time) {
    const raw_time = time/1000/60/60
    const hh = Math.floor(raw_time);
    let mm = Math.ceil((raw_time%1)*60);
    if (mm === 0) mm = "00";
    if (mm < 10) {
        mm = `0${mm}`
    }
    let time_string = ""
    hh < 12 ? time_string = `${hh}:${mm} AM`: time_string = `${hh-12}:${mm} PM`
    return time_string
}

async function fetchJSON(route, options){
    let response
    try{
        response = await fetch(route, {
            method: options && options.method ? options.method : "GET",
            body: options && options.body ? JSON.stringify(options.body) : undefined,
            headers: options && options.body ? {'Content-Type': 'application/json'}: undefined
        })
    }catch(error){
        displayError()
        throw new Error(
            `Error fetching ${route} with options: ${options ? JSON.stringify(options) : options}
             No response from server (failed to fetch)`)
    }
    let responseJson;
    try{
        responseJson = await response.json();
    }catch(error){
        try{
            let responseText = await response.text();
        }catch(getTextError){
            displayError()
            throw new Error(
                `Error fetching ${route} with options: ${options ? JSON.stringify(options) : options}
                Status: ${response.status}
                Couldn't get response body
                error: ${getTextError}`)
        }
        displayError()
        throw new Error(
            `Error fetching ${route} with options: ${options ? JSON.stringify(options) : options}
            Status: ${response.status}
            Response wasn't json: ${responseText ? JSON.stringify(responseText) : responseText}
            error: ${getTextError}`)
    }
    if(response.status < 200 || response.status >= 300 || responseJson.status == "error"){
        displayError()
        throw new Error(
            `Error fetching ${route} with options: ${options ? JSON.stringify(options) : options}
            Status: ${response.status}
            Response: ${responseJson ? JSON.stringify(responseJson) : responseJson}`)
    }
    return responseJson
}

async function displayError(){
    document.getElementById('errorInfo').innerText = 'Error: action failed (see console for more information)'
    document.getElementById('errorInfo').style.opacity = 1
    // pause 4 seconds
    await new Promise(resolve => setTimeout(resolve, 4 * 1000))
    document.getElementById('errorInfo').innerText= ''
    document.getElementById('errorInfo').style.opacity = 0
}
