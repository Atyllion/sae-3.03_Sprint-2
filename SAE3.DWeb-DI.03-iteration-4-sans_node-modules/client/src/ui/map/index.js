import { Lycees } from "../../data/data-lycees.js";
import { Candidats } from "../../data/data-candidats.js";

let MapView = {};

MapView.render = function(){

    var map = L.map('map').setView([45.836319, 1.231629], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    function onMapClick(e) {
        var popup = L.popup();
        popup
            .setLatLng(e.latlng)
            .setContent("You clicked the map at " + e.latlng.toString())
            .openOn(map);
    }
    
    map.on('click', onMapClick);

    // Permet de visualiser tous les lycées sur la carte (7163 lycée = sa lag un peu)
    function ViewAllLycees() {
        Lycees.getAll().forEach(lycee => {
            if (lycee.latitude && lycee.longitude && !isNaN(lycee.latitude) && !isNaN(lycee.longitude)) {
                var marker = L.marker([lycee.latitude, lycee.longitude]).addTo(map);
                marker.bindPopup(`<b>${lycee.appellation_officielle}</b><br>${lycee.libelle_commune}`);
            }
        });
    };
    
    ViewAllLycees();
}
export {MapView};