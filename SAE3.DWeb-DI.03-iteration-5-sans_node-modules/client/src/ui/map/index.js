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

        // input pour l'année scolaire
        let anneeScolaireInput = document.createElement('input');
        anneeScolaireInput.type = 'number';
        anneeScolaireInput.value = 0;
        anneeScolaireInput.id = 'anneeScolaireInput';
        anneeScolaireInput.min = 0;
        anneeScolaireInput.max = 6;
        anneeScolaireInput.step = 1;
        anneeScolaireInput.value = '';
        anneeScolaireInput.placeholder = 'Entrez le code de l\'année scolaire (0-6)';

        anneeScolaireInput.style.position = 'relative';
        anneeScolaireInput.style.display = 'block';
        anneeScolaireInput.style.margin = '10px auto';
        anneeScolaireInput.style.width = '300px';
        anneeScolaireInput.style.zIndex = '1000';
        anneeScolaireInput.style.padding = '5px';
        anneeScolaireInput.style.border = '1px solid #ccc';
        anneeScolaireInput.style.borderRadius = '4px';
        anneeScolaireInput.style.backgroundColor = '#fff';

        let input = document.getElementById('input');
        input.appendChild(anneeScolaireInput);

        anneeScolaireInput.addEventListener('change', function() {
            lyceesToShow = [];
            let anneeScolaireCode = parseInt(anneeScolaireInput.value);

            candidats.forEach(candidat => {
            candidat.Scolarite.forEach(scolarite => {
                if (scolarite.AnneeScolaireCode === anneeScolaireCode) {
                lyceesToShow.push(scolarite.UAIEtablissementorigine);
                }
            });
            });

            map.eachLayer(function (layer) {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
            });

            lycees.forEach(lycee => {
            if (lyceesToShow.includes(lycee.numero_uai) && lycee.latitude && lycee.longitude && !isNaN(lycee.latitude) && !isNaN(lycee.longitude)) {
                var marker = L.marker([lycee.latitude, lycee.longitude]).addTo(map);
                marker.bindPopup(`<b>${lycee.appellation_officielle}</b><br>${lycee.libelle_commune}`);
            }
            });
        });

        // Collecter toutes les UAI des lycées d'où viennent les candidats (AnneeScolaireCode: 0)
        candidats.forEach(candidat => {
            candidat.Scolarite.forEach(scolarite => {
            if (scolarite.AnneeScolaireCode === 0) {
                lyceesToShow.push(scolarite.UAIEtablissementorigine);
            }
            });
        });

        console.log(lyceesToShow);

        // Afficher les lycées sur la carte en utilisant l'UAI
        lycees.forEach(lycee => {
            if (lyceesToShow.includes(lycee.numero_uai) && lycee.latitude && lycee.longitude && !isNaN(lycee.latitude) && !isNaN(lycee.longitude)) {
            var marker = L.marker([lycee.latitude, lycee.longitude]).addTo(map);
            marker.bindPopup(`<b>${lycee.appellation_officielle}</b><br>${lycee.libelle_commune}`);
            }
        });
    }

    ViewAllCandidatures();
};

export {MapView};