var orgLat
var orgLon
var destLat
var destLon
var distance
latPoints = []
lonPoints = []
geocoderList = []
jsonList = []
gasStations = []
let marker_list = []
var buttonClicked = false
var instructionsVariable
var inProgress = false

if (window.innerHeight < 500 || window.innerWidth < 1000){
  instructionsVariable = false
  alert('For best experience, please use your phone in landscape mode.')
}else{
  instructionsVariable = true
}
gas_accessToken = "KYrBJ6gHSpRdmh8jAiJOhqS1dDCMo5H4 " 

mapboxgl.accessToken =
  "pk.eyJ1IjoibGlscGVzaCIsImEiOiJjbDFvN2oxY2MwNDZpM2p1aXFlZ3M1bXZxIn0.-gV7jGrALXS7PCVi3qjfsw"

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
  enableHighAccuracy: true
})


let km_button = document.getElementById("km-button");
let predict_button = document.getElementById("predict-button")
/*let video = document.querySelector("#video");
let canvas = document.querySelector("#canvas");
let kmImage = document.getElementById("km-image")*/

const kmForm = document.getElementById('km-form')
kmForm.addEventListener('submit', function(e){
  e.preventDefault()
  const formData = new FormData(kmForm)
  kmGiven = formData.get('km-number')
  alert("Data has been submited")
  kmForm.reset() 
  closePopup()

  $.ajax({
    type: "POST",
    url: "/km_check",
    data: {"numberValue": kmGiven}
  })
  buttonClicked = true
})

function loadPopup(){
  document.getElementById("km-popup").hidden = false
  document.getElementById("km-overlay").hidden = false
}
function closePopup(){
  document.getElementById("km-popup").hidden = true
  document.getElementById("km-overlay").hidden = true
}
km_button.addEventListener('click', async function() {
  loadPopup()
  /*try{
    let stream = await navigator.mediaDevices.getUserMedia({ video: {facingMode: "environment"}, audio: false });
    video.srcObject = stream;
    setTimeout(takePicture, 1000)}catch{
      alert('Your camera has not been activated')
      buttonClicked = false
    }*/
});

predict_button.addEventListener('click', async function(){
  fetch("/predict_price").then(response => response.json()).then(function(data){
    console.log(data)
    alert(data['tomorrowPrice'])
  });
})
  
/*function takePicture() {
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      let image_data_url = canvas.toDataURL('image/jpeg');
      kmImage.src = image_data_url
      console.log(kmImage)
      // data url of the image
      console.log(image_data_url);
      $.ajax({
        type: "POST",
        url: "/km_check",
        data: {"url": image_data_url}
      })
      buttonClicked = true
};*/
  

function errorLocation() {
  setupMap([-2.24, 53.48])
  alert('Please give the site access to your location. Otherwise you will have to tap on your location on the map then input your destination')
}

function setupMap(center) {
  map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: center,
    zoom: 15
  })

  nav = new mapboxgl.NavigationControl()
  map.addControl(nav)

   directions = new MapboxDirections({
    accessToken: mapboxgl.accessToken,
    alternatives: false,
    profile: 'mapbox/driving',
    unit: 'metric',
    controls: {
        profileSwitcher: false,
        instructions: instructionsVariable
    }

  })

  map.addControl(directions, "top-left")

  directions.on('route', async (event) => {
    if (buttonClicked == true){
      if (inProgress == true){
        alert('Search is already in progress. Markers placed will now be relative to the original route.')
        directions.removeRoutes()
      } else{
      inProgress = true
      buttonClicked = false
      gasStations = []
      let routes = event.route
      document.getElementById('verdict-statement').innerText = 'Loading...'
      window.setTimeout(timeMessage, 15000)
      window.setTimeout(timeMessageError, 30000)
      if (marker_list.length !== 0) {
        for (var l = marker_list.length - 1; l >= 0; l--) {
            marker_list[l].remove()
        }
    }

      // Each route object has a distance property
      distance = (routes.map(r => r.distance)[0])
      console.log(distance)
      $.ajax({
        type: "POST",
        url: "/distance_mesure",
        data: {"distance": distance},
        timeout: 3000
      })

      var typeOfFuel = document.querySelector('input[name="type"]:checked').value
      if (typeOfFuel == 'Regular'){
        $.ajax({
          type: "POST",
          url: "/type_input",
          data: {"fuelType": 0}
        })
      } else if (typeOfFuel == 'Midgrade'){
        $.ajax({
          type: "POST",
          url: "/type_input",
          data: {"fuelType": 1}
        })
      } else if (typeOfFuel == 'Premium'){
        $.ajax({
          type: "POST",
          url: "/type_input",
          data: {"fuelType": 2}
        })
      } else if (typeOfFuel == 'Diesel'){
        $.ajax({
          type: "POST",
          url: "/type_input",
          data: {"fuelType": 3}
        })
      } 
      
      fetch_km()

      orgLat = (directions.getOrigin()).geometry.coordinates[1]
      orgLon = (directions.getOrigin()).geometry.coordinates[0]
      destLat = (directions.getDestination()).geometry.coordinates[1]
      destLon = (directions.getDestination()).geometry.coordinates[0]
      console.log(orgLat, orgLon)
      console.log(destLat, destLon)

      try {
        //Store polyline
        geocoderList = polyline.decode(event.route[0].geometry)

        getWaypoints()
      }catch (err){
        console.log(err)
      }}
    }else{
      alert('please check the kilometers you have available by clicking the button.')
      directions.removeRoutes()
    }
  })
}

function successLocation(position) {
    setupMap([position.coords.longitude, position.coords.latitude])
    directions.setOrigin([position.coords.longitude, position.coords.latitude]);
  }

function getWaypoints(){
  latPoints = []
  lonPoints = []
  if (distance > 100){
    interval = 200
  } else{
    interval = 100
  }
  for (let i = 0; i < geocoderList.length; i +=interval) {
    latPoints.push(geocoderList[i][0]);
    lonPoints.push(geocoderList[i][1])
   
}
console.log(latPoints)
console.log(lonPoints)
}

async function routeStations(){
  const res = await fetch(`https://api.tomtom.com/search/2/categorySearch/petrol-station.json?lat=${destLat}&lon=${destLon}&radius=3500&key=${gas_accessToken}`) 
    response = await res.json();
    jsonList.push(response)
    for (let x = 0; x < jsonList[0]['results'].length; x++){
      gasStations.push({
        lat: jsonList[0]['results'][x]['position']['lat'],
        lon: jsonList[0]['results'][x]['position']['lon'],
        name: jsonList[0]['results'][x]['poi']['name'],
        address: jsonList[0]['results'][x]['address']['freeformAddress'],
        dist: jsonList[0]['results'][x]['dist']
        })
    }

  for (let i = 0; i < latPoints.length; i++){
    await sleep(0.4)
    jsonList = []
    const res = await fetch(`https://api.tomtom.com/search/2/categorySearch/petrol-station.json?lat=${latPoints[i]}&lon=${lonPoints[i]}&radius=3500&key=${gas_accessToken}`) 
    response = await res.json();
    jsonList.push(response)
    console.log(jsonList[0])

    for (let x = 0; x < jsonList[0]['results'].length; x++){ 
      const current = gasStations.find((station) => station.lat === jsonList[0]['results'][x]['position']['lat'])
        if (current){
          
        } else {
          gasStations.push({
          lat: jsonList[0]['results'][x]['position']['lat'],
          lon: jsonList[0]['results'][x]['position']['lon'],
          name: jsonList[0]['results'][x]['poi']['name'],
          address: jsonList[0]['results'][x]['address']['freeformAddress'],
          dist: jsonList[0]['results'][x]['dist']
          })
        }      
  }
  }
  $.ajax({
    type: "POST",
    url: "/array_object",
    data: JSON.stringify(gasStations),
    contentType: "application/json",
    dataType: 'json' 
  })
  console.log(gasStations)
  
}

async function originStations(){
  jsonList = []

  const res = await fetch(`https://api.tomtom.com/search/2/categorySearch/petrol-station.json?lat=${orgLat}&lon=${orgLon}&radius=3500&key=${gas_accessToken}`) 
  response = await res.json();
  jsonList.push(response)

  for (let x = 0; x < jsonList[0]['results'].length; x++){
    gasStations.push({
      lat: jsonList[0]['results'][x]['position']['lat'],
      lon: jsonList[0]['results'][x]['position']['lon'],
      name: jsonList[0]['results'][x]['poi']['name'],
      address: jsonList[0]['results'][x]['address']['freeformAddress'],
      dist: jsonList[0]['results'][x]['dist']
      })
  }
  $.ajax({
    type: "POST",
    url: "/array_object",
    data: JSON.stringify(gasStations),
    contentType: "application/json",
    dataType: 'json' 
  })

  console.log(gasStations)
}

var km_left;

function fetch_km() {
  fetch("/km_object").then(response => response.json()).then(function(data){
    console.log(data)
    if (data['value'] == 'True'){
      originStations()
      myInterval = setInterval(fetchStations, 5000)
    } else if (data['value'] == 'False'){
      routeStations()
      myInterval = setInterval(fetchStations, 5000)
    } else{
      alert('Please take another picture, it was not clear enough to read')
    }
  });
}

function fetchStations(){
  try{
    fetch("/post_list").then(response => response.json()).then(function(data){
      console.log(data)
      clearInterval(myInterval);
      setMarkers(data)
    })
    inProgress = false
  } catch(err){
    console.log(err) 
    myInterval = setInterval(fetchStations, 5000)  
  }
  
}

function setMarkers(data){
  console.log(data)
  var verdictText = document.getElementById('verdict-statement')
  const colors = ['#09de33', '#7ede09', '#bade09', '#debe09', '#de3309']
  try{

    verdictText.innerText = data[0]['verdict']
    a = data[0]['index']
    b = data[1]['index']
    c = data[2]['index']
    d = data[3]['index']
    e = data[4]['index']

    try{
      document.getElementById('row-1-name').innerText = gasStations[a].name
      document.getElementById('row-1-address').innerText = gasStations[a].address
      document.getElementById('row-1-price').innerText = data[0]['price'] + '¢'
      document.getElementById('row-1-distance').innerText = gasStations[a].dist + 'm'

      markers = new mapboxgl.Marker({
        color: colors[0],
        draggable: false, 
    })

     markers.setLngLat([gasStations[a].lon, gasStations[a].lat])
     .addTo(map);
     marker_list.push(markers)
    } catch{
      document.getElementById('row-1-name').innerText = 'no option found'
      document.getElementById('row-1-address').innerText = 'n/a'
      document.getElementById('row-1-price').innerText = 'n/a'
      document.getElementById('row-1-distance').innerText = 'n/a'

      alert('No options were found, either all gas prices are outdated or data is not available. You can try visitng a gas station to find the price or select a different fuel type.')
    }
   
    try{
      document.getElementById('row-2-name').innerText = gasStations[b].name
      document.getElementById('row-2-address').innerText = gasStations[b].address
      document.getElementById('row-2-price').innerText = data[1]['price'] + '¢'
      document.getElementById('row-2-distance').innerText = gasStations[b].dist + 'm'

      markers = new mapboxgl.Marker({
        color: colors[1],
        draggable: false, 
    })

     markers.setLngLat([gasStations[b].lon, gasStations[b].lat])
     .addTo(map);
     marker_list.push(markers)
    } catch {
      document.getElementById('row-2-name').innerText = 'no option found'
      document.getElementById('row-2-address').innerText = 'n/a'
      document.getElementById('row-2-price').innerText = 'n/a'
      document.getElementById('row-2-distance').innerText = 'n/a'
    }

    try{
      document.getElementById('row-3-name').innerText = gasStations[c].name
      document.getElementById('row-3-address').innerText = gasStations[c].address
      document.getElementById('row-3-price').innerText = data[2]['price'] + '¢'
      document.getElementById('row-3-distance').innerText = gasStations[c].dist + 'm'

      markers = new mapboxgl.Marker({
        color: colors[2],
        draggable: false, 
    })

     markers.setLngLat([gasStations[c].lon, gasStations[c].lat])
     .addTo(map);
     marker_list.push(markers)
    }catch{
      document.getElementById('row-3-name').innerText = 'no option found'
      document.getElementById('row-3-address').innerText = 'n/a'
      document.getElementById('row-3-price').innerText = 'n/a'
      document.getElementById('row-3-distance').innerText = 'n/a'
    }

    try{
      document.getElementById('row-4-name').innerText = gasStations[d].name
      document.getElementById('row-4-address').innerText = gasStations[d].address
      document.getElementById('row-4-price').innerText = data[3]['price'] + '¢'
      document.getElementById('row-4-distance').innerText = gasStations[d].dist + 'm'

      markers = new mapboxgl.Marker({
        color: colors[3],
        draggable: false, 
    })

     markers.setLngLat([gasStations[d].lon, gasStations[d].lat])
     .addTo(map);
     marker_list.push(markers)
    }catch{
      document.getElementById('row-4-name').innerText = 'no option found'
      document.getElementById('row-4-address').innerText = 'n/a'
      document.getElementById('row-4-price').innerText = 'n/a'
      document.getElementById('row-4-distance').innerText = 'n/a'
    }

    try{
      document.getElementById('row-5-name').innerText = gasStations[e].name
      document.getElementById('row-5-address').innerText = gasStations[e].address
      document.getElementById('row-5-price').innerText = data[4]['price'] + '¢'
      document.getElementById('row-5-distance').innerText = gasStations[e].dist + 'm'

      markers = new mapboxgl.Marker({
        color: colors[4],
        draggable: false, 
    })

     markers.setLngLat([gasStations[e].lon, gasStations[e].lat])
     .addTo(map);
     marker_list.push(markers)
    }catch{
      document.getElementById('row-5-name').innerText = 'no option found'
      document.getElementById('row-5-address').innerText = 'n/a'
      document.getElementById('row-5-price').innerText = 'n/a'
      document.getElementById('row-5-distance').innerText = 'n/a'
    }
  }catch{
    verdictText.innerText = data['verdict']

    document.getElementById('row-1-name').innerText = ''
    document.getElementById('row-1-address').innerText = ''
    document.getElementById('row-1-price').innerText = ''
    document.getElementById('row-1-distance').innerText = ''

    document.getElementById('row-2-name').innerText = ''
    document.getElementById('row-2-address').innerText = ''
    document.getElementById('row-2-price').innerText = ''
    document.getElementById('row-2-distance').innerText = ''

    document.getElementById('row-3-name').innerText = ''
    document.getElementById('row-3-address').innerText = ''
    document.getElementById('row-3-price').innerText = ''
    document.getElementById('row-3-distance').innerText = ''

    document.getElementById('row-4-name').innerText = ''
    document.getElementById('row-4-address').innerText = ''
    document.getElementById('row-4-price').innerText = ''
    document.getElementById('row-4-distance').innerText = ''

    document.getElementById('row-5-name').innerText = ''
    document.getElementById('row-5-address').innerText = ''
    document.getElementById('row-5-price').innerText = ''
    document.getElementById('row-5-distance').innerText = ''
  }

  data = ''

}

function timeMessage(){
  if (document.getElementById('verdict-statement').innerText == 'Loading...'){
    document.getElementById('verdict-statement').innerText = 'This is taking some time... Almost done'
  }
}

function timeMessageError(){
  if (document.getElementById('verdict-statement').innerText == 'This is taking some time... Almost done'){
    document.getElementById('verdict-statement').innerText = 'There was an error in showing your results. Please refresh the page and try again.'
  }
}

async function sleep(seconds){
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
}
