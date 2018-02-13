
mapboxgl.accessToken = 'pk.eyJ1IjoidGF0ZXJ0b3QiLCJhIjoiY2o1bGVnam9mMnNiejMybzZ5aDA0dmNmbiJ9.YHaAlOi4U2iI6hdIhAi-Lg';
// This adds the map to your page
var map = new mapboxgl.Map({
// container id specified in the HTML
container: 'map',
// style URL
style: 'mapbox://styles/mapbox/streets-v10',
// initial position in [lon, lat] format
center: [-77.034084, 30.909671],
// initial zoom
zoom: 3
});

//  Enables user to be taken to a certain geo-location

map.addControl(new MapboxGeocoder({
accessToken: mapboxgl.accessToken
}));

// Enables user to zoom in/zoom out/rotate map
map.addControl(new mapboxgl.NavigationControl());

// Enables the user to toggle both full screen and normal display
map.addControl(new mapboxgl.FullscreenControl());

//$.getJSON("CESR_newer.json", function(json) {
//    var testing = json
//    console.log(json); // this will show the info it in firebug console
//});

//console.log("hey");
//onsole.log(json);
var mydata = JSON.parse(data);
var places = mydata[0];

map.on('load', function(e) {
// Add the data to your map as a layer

map.addSource('places', {
    type: 'geojson',
    data: places//"./markers.geojson"//places
});

map.addLayer({
id: 'locations',
type: 'symbol',
// Add a GeoJSON source containing place coordinates and information.
source:'places'
//{
// type: 'geojson',
// data: places
//}
,
layout: {
 'icon-image': 'circle-stroked-15',
 'icon-allow-overlap': true,
},
});

console.log(places.features);
buildLocationList(places.features,0);
});



// to find the layers in use do:
// map.getStyle().layers
// some are nice because they give city, river, etc. info
// however some are not really useful .
// for now i will leave them but I'll remove the ability to


  //////////////////////////////////////////////////
 ////////// Map Filtering Done Here ///////////////
//////////////////////////////////////////////////
$('.menu-ui a').on('click', function() {
  //closetabs();

  // For each filter link, get the 'data-filter' attribute value.
  var filter = $(this).data('filter');
  console.log('current filter: ',filter)
  closetabs();
  var old_filters = map.getFilter('locations');
  console.log('old_filter: ', old_filters)
  $(this).addClass('active').siblings().removeClass('active');
  map.setFilter('locations', ["all",['==', filter, 'TRUE']]);
  if(filter == 'all'){
    map.setFilter('locations',["all"]);
    $(this).addClass('active').siblings().removeClass('active');
    //document.getElementById('listings').innerHTML = '';
    buildLocationList(places.features,0);
  }
  else {

    //var new_filter =
  //  map.setFilter('locations',new_filter)
    // Finds the points to populate the sidebar //
    // var new_locs = map.querySourceFeatures('places',  { filter:new_filter} );
    var new_locs = [];
    var x = places.features;
    var hi = x.forEach(function(elem) {
    if(elem.properties[filter] =="TRUE"){
      new_locs.push(elem)
      }
    });

    // NOTE: THE BELOW LINE WORKS !
    // map.setFilter('locations', ["all",['==', "Spring_Availability", 'TRUE'],['==', "Areas_of_Interest_Education", 'TRUE']]);
    // console.log(JSON.stringify(map.getFilter('locations')));
    // THIS GETS THE FEATURES: map.querySourceFeatures('places',  { filter:["all",["==","Spring_Availability","TRUE"],["==","Areas_of_Interest_Education","TRUE"]]} );



  // clears the sidebar //
//  document.getElementById('listings').innerHTML = '';
//  document.getElementById('resultnumber').innerHTML = '';
  //console.log(new_locs);
  //populates sidebar
  buildLocationList(new_locs,1);
}
});

  //////////////////////////////////////////////////////
 ////////// Popup with Onclick Event //////////////////
//////////////////////////////////////////////////////

map.on('click', function(e) {
  var features = map.queryRenderedFeatures(e.point, { layers: ['locations'] } ); // gets point clicked on
  if (!features.length) {
    return;
  }
  var feature = features[0];
  //gets a list of properties to add to the tooltip div
  var popupinfo = feature.properties;
  var popObj = JSON.stringify(popupinfo);
  var found = "<p>";
  for ( var n in popupinfo) {
      if ( popupinfo[n] == "TRUE") { found = found.concat(n.replace(/_/gi,' ').replace('Areas of Interest','')+", ");
    }
  }
  found = found.slice(0,found.length-2); //this removes the last comma
  found.concat("</p>");

  //get the additionalInfo for the tooltip div
  var additionalInfo = "";
  if(feature.properties['Local Volunteering (spring semester)'] !="" ||  feature.properties['Local Volunteering (spring semester)']!= ""){
    additionalInfo = "<h4>Additional Info</h4>"+"<p>"+feature.properties['Local Volunteering (spring semester)']+"</p>"+"<p>"+feature.properties['Language_Other_Languages']+"</p>"
  }
  // this adds the div to the map!
  var popup = new mapboxgl.Popup({ offset: [0, -15] })
    .setLngLat(feature.geometry.coordinates)
    .setHTML("<a "+ " href='"+ feature.properties.Organization_Information_Website +"'>"+ "<h3>" +
      feature.properties.Organization_Information_Name_of_Organization + "</h3></a>"+
      "<h4>Properties</h4>"+found+additionalInfo)
    .setLngLat(feature.geometry.coordinates)
    .addTo(map);

});


  ///////////////////////////////////////////////////////
 //// Builds List for Visible points in Sidebar ////////
///////////////////////////////////////////////////////

function buildLocationList(data,val) {
  // clears the sidebar //
  document.getElementById('listings').innerHTML = '';
  document.getElementById('resultnumber').innerHTML = '';

  // Iterate through the list of places //
  var res = data.length
  var numres = document.getElementById('resultnumber');
  numres.innerHTML = "<h2>Results: " + res.toString() + "</h2>" ;
  for (i = 0; i < data.length; i++) {
    var currentFeature = data[i];
    // Shorten data.feature.properties to just `prop` so we're not
    // writing this long form over and over again.
    var prop = currentFeature.properties;
    // Select the listing container in the HTML and append a div
    // with the class 'item' for each store
    var listings = document.getElementById('listings');
    var listing = listings.appendChild(document.createElement('div'));
    listing.className = 'item';
    listing.id = 'listing-' + i;
    // Create a new link (to the point on the map) with the class 'title' for each location
    // and fill it with the name
    var link = listing.appendChild(document.createElement('a'));
    link.href = '#';
    link.className = 'title';
    link.dataPosition = i;
    link.innerHTML = prop.Organization_Information_Name_of_Organization;

    // Add an event listener for the links in the sidebar listing
    link.addEventListener('click', function(e) {
      // Update the currentFeature to the store associated with the clicked link
      var clickedListing = data[this.dataPosition];
      // 1. Fly to the point associated with the clicked link
      flyToPlace(clickedListing);
      // 2. Close all other popups and display popup for clicked source
      closetabs();
      // display popup for clicked sourec
      this.parentNode.classList.add('active');
    })
    // Create a new div with the class 'details' for each location
    // and fill it with the email adress
    var details = listing.appendChild(document.createElement('div'));
    details.className += 'descrip';
    // we want <a href="prop.Organization_Information_Website"> Organization_Information_Name_of_Organization </a>
    //details.innerHTML = "<a href='"+prop.Organization_Information_Website +"'>"+ prop.Organization_Information_Name_of_Organization+"</a>";
    details.innerHTML = "<a href='"+prop.Organization_Information_Website +"'>(Website) </a>";
    if (prop.Organization_Information_Location_of_Organization_City != '') {
      details.innerHTML += '<a> &middot; ' + prop.Organization_Information_Location_of_Organization_City + ' &middot; ' + prop.Organization_Information_Location_of_Organization_State + '</a>';
    }
  } //end for loop
} //end buildLocationList



function closetabs(){
  //  Close all other popups //
  var activeItem = document.getElementsByClassName('item active');
  if (activeItem[0]) {
    console.log(activeItem[0])
    activeItem[0].classList.remove('active');
  }
}


function flyToPlace(currentFeature) {
  map.flyTo({
    center: currentFeature.geometry.coordinates,
    zoom: 15
  });
}

  //////////////////////////////////////////////////////
 //////////   Add an event listener for       /////////
////////// when a user clicks on the sidebar /////////
/////////////////////////////////////////////////////
map.on('click', function(e) {
  // Query all the rendered points in the view
  var features = map.queryRenderedFeatures(e.point, { layers: ['locations'] });
  if (features.length) {
    var clickedPoint = features[0];
    // 1. Fly to the point
    flyToPlace(clickedPoint);
    //flyToStore(clickedPoint);
    // 2. Close all other popups and display popup for clicked store
    var activeItem = document.getElementsByClassName('item active');
    console.log("actives",activeItem)
    if (activeItem[0]) {
      activeItem[0].classList.remove('active');
    }
    // Find the index of the store.features that corresponds to the clickedPoint that fired the event listener
    var selectedFeature = clickedPoint.properties.Organization_Information_Website;

    for (var i = 0; i < places.features.length; i++) {
      if (places.features[i].properties.Organization_Information_Website === selectedFeature) {
        selectedFeatureIndex = i;
      }
    }//end for loop
    // Select the correct list item using the found index and add the active class
    var listing = document.getElementById('listing-' + selectedFeatureIndex);
    listing.classList.add('active');
    console.log("listing",listing)
  }// end if statement
});

  //////////////////////////////////////////////////////
 ////////// Open and Close the Sidebar ////////////////
//////////////////////////////////////////////////////
function openNav() {
    document.getElementById("mySidenav").style.width = "30%";
    document.getElementById("main").style.marginLeft = "30%";
    document.getElementById('filter-container').style.marginLeft = "31%";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
    document.getElementById('filter-container').style.marginLeft = "130px";
}

  /////////////////////////////////////////////////////////
 ///// removes some elements and  opens the sidebar //////
/////////////////////////////////////////////////////////
$( ".mapboxgl-missing-css" ).remove();
$(".mapboxgl-ctrl-geocoder.mapboxgl-ctrl").remove();
$(".mapboxgl-ctrl-logo").remove();
window.onload = function () {
  openNav();
};
