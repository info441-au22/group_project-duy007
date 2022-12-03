function stringToTime(time_string) {
    // time string: HH:MM
    time_string = time_string.split(":")
    const hh = Math.floor(parseInt(time_string[0].trim())*60*60*1000)
    const mm = Math.floor(parseInt(time_string[1].trim())*60*1000)
    console.log(hh+mm)
    return hh+mm
}

export default stringToTime;