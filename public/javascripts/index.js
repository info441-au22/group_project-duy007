async function init(){
    await loadIdentity();
    loadRooms(`api/${apiVersion}/rooms/`);
}

async function loadRooms(url){
    document.getElementById("room_box").innerText = "Loading...";
    let roomsJson = await fetchJSON(url);
    console.log(roomsJson)
    let roomsHTML = roomsJson.map(room => {
        return `
        <div class="room card mb-3 px-0">
            <div class="row g-0">
                <div class="col-md-4">
                    <img src="http://commons.trincoll.edu/library/files/2015/02/LITC113_2.jpg" class="img-fluid" alt="...">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                    <h3 class="fs-6 card-title">${room.building} ${room.room_number}<h3>
                    <p class="fs-7 card-text">${room.description}</p>
                    <p class="fs-7 card-text">Hours: ${timeToString(room.time_open)} - ${timeToString(room.time_close)}</p>
                    <p class="fs-7 card-text">Charging: ${room.charging ? "Available": "Not available"}</p>
                    <p class="fs-7 card-text">Computer: ${room.computer_access ? "Available": "Not available"}</p>
                    <p class="fs-7 card-text">Private Space: ${room.private_space ? "Available": "Not available"}</p>
                    <p class="fs-7 card-text">Reservation: ${room.private_space ? "Required": "None"}</p>
                    <p class="fs-7 card-text">Last Updated: ${getLastUpdate(room.modified_date)}<p>
                    </div>
                </div>
            </div>
        </div>`
    });
    document.getElementById("room_box").innerHTML = roomsHTML
}

async function queryRoom(){
    let query_url = `api/${apiVersion}/rooms?`
    query_url = query_url.concat(`charging=${encodeURIComponent(document.getElementById("charging").checked)}`)
    query_url = query_url.concat(`&computer_access=${encodeURIComponent(document.getElementById("computer_access").checked)}`)
    query_url = query_url.concat(`&private_space=${encodeURIComponent(document.getElementById("private_space").checked)}`)
    query_url = query_url.concat(`&reservation_required=${encodeURIComponent(document.getElementById("reservation_required").checked)}`)
    const location = encodeURIComponent(document.getElementById("location").value)
    query_url = query_url.concat(`&location=${location}`)
    const sound_level = encodeURIComponent(document.getElementById("sound_level").value)
    query_url = query_url.concat(`&sound_level=${sound_level}`)
    const building_value = escapeHTML(document.getElementById("building").value)
    if (building_value.length >= 3) query_url = query_url.concat(`&building=${encodeURIComponent(building_value)}`)
    const room_number_value = escapeHTML(document.getElementById("room_number").value)
    if (room_number_value.length >= 1) query_url = query_url.concat(`&room_number=${encodeURIComponent(room_number_value)}`)
    query_url = query_url.concat(`&time_open=${encodeURIComponent(stringToTime(document.getElementById("time_open").value))}`)
    query_url = query_url.concat(`&time_close=${encodeURIComponent(stringToTime(document.getElementById("time_close").value))}`)
    loadRooms(query_url)
}