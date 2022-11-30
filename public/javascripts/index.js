async function init(){
    await loadIdentity();
    loadRooms(`api/${apiVersion}/rooms/`);
}

async function loadRooms(url){
    document.getElementById("room_box").innerText = "Loading...";
    let roomsJson = await fetchJSON(url);
    console.log(roomsJson)
    let roomsHTML = await Promise.all(roomsJson.map(async room => {
        return `
        <div class="room card mb-3 px-0" id="holder">
            <div class="row g-0">
                <div class="col-md-4">
                    <img src=${room.img} class="img-fluid" alt="...">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                    <h3 class="fs-6 card-titlefs-7 mb-0">${room.room_number !== "None" ? `${room.building} ${room.room_number}`: `${room.building}`}</h3>
                    <p class="fs-8 card-text">${room.location}</p>
                    <p class="fs-7 card-text">${room.description}</p>
                    <p class="fs-7 card-text">Hours: ${timeToString(room.time_open)} - ${timeToString(room.time_close)}</p>
                    <p class="fs-7 card-text mb-0">Charging: ${room.charging ? "Available": "Not available"}</p>
                    <p class="fs-7 card-text mb-0">Computer: ${room.computer_access ? "Available": "Not available"}</p>
                    <p class="fs-7 card-text mb-0">Private Space: ${room.private_space ? "Available": "Not available"}</p>
                    <p class="fs-7 card-text">Reservation: ${room.private_space ? "Required": "None"}</p>
                    <p class="fs-7 card-text">Last Updated: ${getLastUpdate(room.modified_date)}<p>
                    </div>
                </div>
            </div>
        </div>`
    }))
    document.getElementById("room_box").innerHTML = roomsHTML.join('\n');
}

async function queryRoom(){
    let query_url = `api/${apiVersion}/rooms?`
    if (document.getElementById("charging").checked) query_url.concat(`charging=true&`)
    if (document.getElementById("computer_access").checked) query_url.concat(`computer_access=true&`)
    if (document.getElementById("private_space").checked) query_url.concat(`&private_space=true&`)
    if (document.getElementById("reservation_required").checked) query_url.concat(`&reservation_required=true&`)
    const location = encodeURIComponent(document.getElementById("location").value)
    query_url = query_url.concat(`location=${location}&`)
    const sound_level = encodeURIComponent(document.getElementById("sound_level").value)
    query_url = query_url.concat(`sound_level=${sound_level}&`)
    const building_value = escapeHTML(document.getElementById("building").value)
    if (building_value.length >= 3) query_url = query_url.concat(`building=${encodeURIComponent(building_value)}&`)
    const room_number_value = escapeHTML(document.getElementById("room_number").value)
    if (room_number_value.length >= 1) query_url = query_url.concat(`room_number=${encodeURIComponent(room_number_value)}&`)
    if (document.getElementById("time_open").value !== '') query_url.concat(`time_open=${encodeURIComponent(stringToTime(document.getElementById("time_open").value))}&`)
    if (document.getElementById("time_close").value !== '') query_url.concat(`time_open=${encodeURIComponent(stringToTime(document.getElementById("time_open").value))}`)
    query_url = query_url.concat(`time_close=${encodeURIComponent(stringToTime(document.getElementById("time_close").value))}`)
    loadRooms(query_url)
}