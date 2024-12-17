// DATA
import { Lycees } from "../../data/data-lycees.js";
import { Candidats } from "../../data/data-candidats.js";

let MapView = {};

MapView.render = function(){

    var map = L.map('map').setView([45.836319, 1.231629], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    function ViewAllClusters() {
        let candidats = Candidats.getAll();
        let lycees = Lycees.getAll();

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

        // Compter le nombre de candidats sans UAI 
        let totalCandidats = 0;
        let candidatsSansUAI = 0;
        let candidatsAvecUAINonRelie = 0;

        candidats.forEach(candidat => {
            candidat.Scolarite.forEach(scolarite => {
            if (scolarite.AnneeScolaireCode === 0) {
                totalCandidats++;
                if (!scolarite.UAIEtablissementorigine) {
                candidatsSansUAI++;
                } else if (!lycees.some(lycee => lycee.numero_uai === scolarite.UAIEtablissementorigine)) {
                candidatsAvecUAINonRelie++;
                }
            }
            });
        });

        // compter le nombre de candidats avec et sans BAC

        // creer un marker pour les candidats qui sont post BAC

        // met le markeur sur la ville avec le code postal si les coordonnées sont manquantes pour les candidats post BAC

        // "TypeDiplomeLibelle": "Baccalauréat en préparation",

        // Afficher les informations dans la console
        console.log("Total des candidats :", totalCandidats);
        console.log("Nombre de candidats sans UAI :", candidatsSansUAI);
        console.log("Nombre de candidats avec UAI non relié à un établissement (IUT) :", candidatsAvecUAINonRelie);
        console.log("total UAI faux ou non relier", (candidatsSansUAI + candidatsAvecUAINonRelie));
        console.log("Nombre de candidats par lycée :", lyceeCandidatsCount);

        // créer des cluster avec leaflet.markercluster
        var markers = L.markerClusterGroup({
            spiderfyOnMaxZoom: false,
            showCoverageOnHover: true,
            zoomToBoundsOnClick: true, 
            animate : true,
            animateAddingMarkers: true,

            // Ajouter le nombre de candidats par établissement dans les options du marqueur
            iconCreateFunction: function(cluster) {
                var totalCluster = 0;

                // Compter le nombre de candidats pour chaque marqueur dans le cluster
                cluster.getAllChildMarkers().forEach(marker => {
                    let lyceeUAI = marker.options.lycee.numero_uai;
                    if (lyceeCandidatsCount[lyceeUAI]) {
                        totalCluster += lyceeCandidatsCount[lyceeUAI];
                    }
                });
            
                return L.divIcon({ 
                    html: '<b>' + totalCluster + '</b>', 
                    className: 'custom-cluster', 
                    iconSize: L.point(40, 40) 
                });
            }
        });

        // CSS pour les clusters
        var style = document.createElement('style');
        style.innerHTML = `
            .custom-cluster {
            background-color: rgba(255, 0, 0, 0.6);
            border-radius: 50%;
            color: white;
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            line-height: 40px;
            }
            .custom-cluster span {
            display: inline-block;
            vertical-align: middle;
            }
        `;
        document.head.appendChild(style);

        // Ajouter les marqueurs au groupe de clusters
        lycees.forEach(lycee => {
            if (lyceeCandidatsCount[lycee.numero_uai] && lycee.latitude && lycee.longitude && !isNaN(lycee.latitude) && !isNaN(lycee.longitude)) {
            var marker = L.marker([lycee.latitude, lycee.longitude], { lycee: lycee });
            marker.bindPopup(`<b>${lycee.appellation_officielle}</b><br>Ville : <b>${lycee.libelle_commune}</b><br>Nombre de candidats : <b>${lyceeCandidatsCount[lycee.numero_uai]}</b>`);
            markers.addLayer(marker);
            }
        });

        // Ajouter le groupe de clusters à la carte
        map.addLayer(markers);
    }

    ViewAllClusters();
};

export {MapView};