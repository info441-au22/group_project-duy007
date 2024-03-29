async function init() {
    await loadIdentity();
    let formContent = loadInsertForm();
    document.getElementById("insert_form").innerHTML = formContent;
    document.getElementById("room_form").addEventListener('submit', insertSubmit);
    loadRooms(`api/${apiVersion}/rooms/`);
}

async function loadRooms(url) {
    document.getElementById("room_box").innerText = "Loading...";
    let roomsJson = await fetchJSON(url);
    console.log(roomsJson);
    let roomsHTML = await Promise.all(roomsJson.map(async room => {
        return `
        <div class="room card mb-3 px-0" id="${room._id}">
            <div class="row g-0">
                <div class="col-md-4">
                    <img src=${room.image} class="img-fluid" alt="...">
                </div>
                <div class="col-md-8">
                    <span class="heart-button-span ${myIdentity? "": "d-none"}">
                    ${room.likes && room.likes.includes(myIdentity) ?
                        `<button class="btn" onclick='unlikeRoom("${room._id}")'><img src="/imgs/like.svg"></button>` :
                        `<button class="btn" onclick='likeRoom("${room._id}")'><img src="/imgs/dislike.svg"></button>`}
                    </span>
                    <div class="card-body">
                    <p class="fs-7">Likes: ${room.likes.length}<p>
                    <h3 class="fs-6 card-titlefs-7 mb-0">${room.room_number !== "None" ? `${room.building} ${room.room_number}` : `${room.building}`}</h3>
                    <p class="fs-8 card-text mb-0">${room.location}</p>
                    <p class="fs-8 card-text">Noise Level: ${room.sound_level}</p>
                    <p class="fs-7 card-text">${room.description}</p>
                    <p class="fs-7 card-text">Hours: ${timeToString(room.time_open)} - ${timeToString(room.time_close)}</p>
                    <p class="fs-7 card-text mb-0">Charging: ${room.charging ? "Available" : "Not available"}</p>
                    <p class="fs-7 card-text mb-0">Computer: ${room.computer_access ? "Available" : "Not available"}</p>
                    <p class="fs-7 card-text mb-0">Private Space: ${room.private_space ? "Available" : "Not available"}</p>
                    <p class="fs-7 card-text">Reservation: ${room.private_space ? "Required" : "None"}</p>
                    <p class="fs-7 card-text">Last Updated: ${getLastUpdate(room.modified_date)}<p>
                    </div>
                </div>
            </div>
        </div>`;
    }));
    document.getElementById("room_box").innerHTML = roomsHTML.join('\n');
}

async function insertSubmit(event) {
  event.preventDefault();
  document.getElementById("room_box").innerText = "Insertion...";
  const valid_open = window.getComputedStyle(
    document.querySelector('#input_time_open'), ':invalid'
  )
  const valid_close = window.getComputedStyle(
    document.querySelector('#input_time_close'), ':invalid'
  )
  if (valid_open === null || valid_close === null ) {
    displayError()
    throw new Error(
      `time open and close are invalid`)
  };
  const local = document.getElementById("input_location").value;
  const s_lvl = document.getElementById("input_sound_level").value;
  const build = document.getElementById("input_building").value;
  const r_num = document.getElementById("input_room_number").value;
  const desc = document.getElementById("input_description").value;
  const img = document.getElementById("image").value;
  if (local === "" || s_lvl === "" || build==="" || r_num==="" || desc===""|| img==="") {
    displayError()
    throw new Error(
      `input are invalid`)
  };
  const formData = new FormData(document.getElementById("room_form"));
  const res = await fetch(`api/${apiVersion}/rooms`, {
    method: "POST",
    body: formData
  })
  document.getElementById("room_box").innerText = "Inserting...";
  await new Promise(resolve => {
    setTimeout(resolve, 5000)});
  if (res.status === 200) { 
    await loadRooms(`api/${apiVersion}/rooms/`)
  } else {
    displayError()
    throw new Error(
      `${res.error}`)
  }
}

async function queryRoom() {
    let query_url = `api/${apiVersion}/rooms?`;
    if (document.getElementById("charging").checked) query_url = query_url.concat(`charging=true&`);
    if (document.getElementById("computer_access").checked) query_url = query_url.concat(`computer_access=true&`);
    if (document.getElementById("private_space").checked) query_url = query_url.concat(`private_space=true&`);
    if (document.getElementById("reservation_required").checked) query_url = query_url.concat(`reservation_required=true&`);
    const location = encodeURIComponent(document.getElementById("location").value);
    if (location !== '') query_url = query_url.concat(`location=${location}&`);
    const sound_level = encodeURIComponent(document.getElementById("sound_level").value);
    if (sound_level !== '') query_url = query_url.concat(`sound_level=${sound_level}&`);
    const building_value = escapeHTML(document.getElementById("building").value);
    if (building_value.length >= 3) query_url = query_url.concat(`building=${encodeURIComponent(building_value)}&`);
    const room_number_value = escapeHTML(document.getElementById("room_number").value);
    if (room_number_value.length >= 1) query_url = query_url.concat(`room_number=${encodeURIComponent(room_number_value)}&`);
    if (document.getElementById("time_open").value !== '') query_url = query_url.concat(`time_open=${encodeURIComponent(stringToTime(document.getElementById("time_open").value))}&`);
    if (document.getElementById("time_close").value !== '') query_url = query_url.concat(`time_close=${encodeURIComponent(stringToTime(document.getElementById("time_close").value))}`);
    if (query_url.endsWith("&")) query_url = query_url.substring(0, query_url.length - 1);
    loadRooms(query_url);
    document.getElementById("charging").checked = false;
    document.getElementById("computer_access").checked = false;
    document.getElementById("private_space").checked = false;
    document.getElementById("reservation_required").checked = false;
    document.getElementById("location").value = "";
    document.getElementById("sound_level").value = "";
    document.getElementById("building").value = "";
    document.getElementById("room_number").value = "";
    document.getElementById("time_open").value = "";
    document.getElementById("time_close").value = "";
}

function loadInsertForm() {
    let query_url = `api/${apiVersion}/rooms`;
    return `    <form id="room_form" action="${query_url}" method="POST" enctype="multipart/form-data" target="hiddenFrame">
    <div class="filter-flex">
      <div>
        <label for="image">Upload Sample Image of Study Space:</label>
        <input type="file" id="image" name="image" accept="image/*"/ required>
        <div>
          <label for="input_time_open">Choose room open time (opening hours 6:00AM to 12:59PM):</label>
          <input type="time" id="input_time_open" name="input_time_open"
                min="06:00" max="12:59" required>
          <span class="validity"></span>
        </div>
        <div>
          <label for="input_time_close">Choose room closed time (closing hours 1:00PM to 12:59AM):</label>
          <input type="time" id="input_time_close" name="input_time_close"
                min="13:00" max="24:59" required>
          <span class="validity"></span>
        </div>
      </div>

      <div>
        <div>
          <input type="checkbox" id="input_charging" name="input_charging" checked>
          <label for="input_charging">Charging</label>
        </div>
        <div>
          <input type="checkbox" id="input_computer_access" name="input_computer_access" checked>
          <label for="input_computer_access">Computer Access</label>
        </div>
        <div>
          <input type="checkbox" id="input_private_space" name="input_private_space" checked>
          <label for="input_private_space">Private Space</label>
        </div>
        <div>
          <input type="checkbox" id="input_reservation_required" name="input_reservation_required">
          <label for="input_reservation_required">Reservation</label>
        </div>
      </div>

      <div>
        <div>
          <label for="input_building">Building</label>
          <input type="text" id="input_building" name="input_building" placeholder="MGH" required>
        </div>
        <div>
          <label for="input_room_number">Room Number</label>
          <input type="text" id="input_room_number" name="input_room_number" placeholder="430" required>
        </div>
        <div>
          <label for="input_description">Description</label>
          <input type="text" id="input_description" name="input_description" placeholder="Input a short description" required>
          </div>
        <div>
          <label for="sound-select">Choose a noise level:</label>
          <select name="input_sound_level" id="input_sound_level" required>
              <option value="">Please choose a noise level</option>
              <option value="Quiet">Quiet</option>
              <option value="Somewhat Quiet">Somewhat Quiet</option>
              <option value="Normal">Normal</option>
              <option value="Loud">Loud</option>
          </select>
        </div>
        <label for="input_location-select">Choose a location:</label>
        <select name="input_location" id="input_location" required>
            <option value="">Please choose a location</option>
            <option value="North Campus">North</option>
            <option value="Central Campus">Central</option>
            <option value="South Campus">South</option>
            <option value="West Campus">West</option>
            <option value="East Campus">East</option>
        </select>
      </div>

    </div>

    <div class="center-button">
      <input class="submit-button" type="submit" onClick="queryRoom()">
  </form>
  <iframe name="hiddenFrame" width="0" height="0" border="0" style="display: none;"></iframe>`;
}

async function likeRoom(roomID){
  await fetchJSON(`api/${apiVersion}/rooms/like`, {
      method: "POST",
      body: {roomID: roomID}
  })
  loadRooms(`api/${apiVersion}/rooms/`);
}


async function unlikeRoom(roomID){
  await fetchJSON(`api/${apiVersion}/rooms/unlike`, {
    method: "POST",
    body: {roomID: roomID}
  })
  loadRooms(`api/${apiVersion}/rooms/`);
}