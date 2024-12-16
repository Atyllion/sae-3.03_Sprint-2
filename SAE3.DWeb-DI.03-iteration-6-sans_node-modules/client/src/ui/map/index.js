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

    // permet de visualiser tous les lycées des candidats sur la carte (sa lag moins et c'est plus pertinent)
    function ViewAllCandidatures() {
        let candidats = Candidats.getAll();
        let lycees = Lycees.getAll();
        let lyceesToShow = [];

        // Collecter toutes les UAI des lycées d'où viennent les candidats (AnneeScolaireCode: 0)
        let lyceeCandidatsCount = {};
        candidats.forEach(candidat => {
            candidat.Scolarite.forEach(scolarite => {
            if (scolarite.AnneeScolaireCode === 0) {
                if (lyceeCandidatsCount[scolarite.UAIEtablissementorigine]) {
                lyceeCandidatsCount[scolarite.UAIEtablissementorigine]++;
                } else {
                lyceeCandidatsCount[scolarite.UAIEtablissementorigine] = 1;
                }
            }
            });
        });

        console.log(lyceeCandidatsCount);

        // Afficher les lycées sur la carte en utilisant l'UAI
        lycees.forEach(lycee => {
            if (lyceeCandidatsCount[lycee.numero_uai] && lycee.latitude && lycee.longitude && !isNaN(lycee.latitude) && !isNaN(lycee.longitude)) {
            var marker = L.marker([lycee.latitude, lycee.longitude]).addTo(map);
            marker.bindPopup(`<b>${lycee.appellation_officielle}</b><br>Ville : <b>${lycee.libelle_commune}</b><br>Nombre de candidats : <b>${lyceeCandidatsCount[lycee.numero_uai]}</b>`);
            }
        });
    }

    ViewAllCandidatures();
};

export {MapView};