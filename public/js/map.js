document.addEventListener('DOMContentLoaded', function() {
  if (!mapCoords || mapCoords.length !== 2) return;
  
  const lat = mapCoords[1];
  const lng = mapCoords[0];

  const map = L.map('map').setView([lat, lng], 13);
  
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Create red icon
  const redIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Add marker with red icon
  const marker = L.marker([lat, lng], {icon: redIcon}).addTo(map);
  
  marker.bindPopup(
    '<i class="fa-solid fa-house" style="color:red;"></i> <b>Listing Location</b>'
  ).openPopup();
});