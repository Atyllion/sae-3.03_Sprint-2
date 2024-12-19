// DATA
import { Lycees } from "../../data/data-lycees.js";
import { Candidats } from "../../data/data-candidats.js";
import { CodesPostaux } from "../../data/data-code_postaux.js";

let MapView = {};

MapView.render = function(){

    var map = L.map('map').setView([45.833619, 1.261105], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    function ViewAllClusters() {
        let candidats = Candidats.getAll();
        let lycees = Lycees.getAll();
        let codesPostaux = CodesPostaux.getAll();

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
            }})});

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
            };
            });
        });

        // Afficher les informations des candidats dans la console
        console.log("Total des candidats :", totalCandidats);
        console.log("Nombre de candidats par lycée :", lyceeCandidatsCount);
        console.log("Nombre de candidats sans UAI :", candidatsSansUAI);
        console.log("Nombre de candidats avec UAI non relié à un établissement (IUT) :", candidatsAvecUAINonRelie);
        let totalUAI = candidatsSansUAI + candidatsAvecUAINonRelie;
        console.log("total UAI faux ou non relier", (totalUAI));
        console.log("donnée de la poste", codesPostaux);

        // Récupérer les candidats post-bac
        function getPostBacCandidates(candidats) {
            return candidats.filter(candidat => candidat.Baccalaureat.TypeDiplomeCode === 1);
        }

        let postBacCandidates = getPostBacCandidates(Candidats.getAll());
        console.log("Étudiants post-bac :", postBacCandidates);

        // Récupérer les donnée des étudiants post-bac avec code postal
        function getLastYearWithPostalCode(candidat) {
            let lastYear = candidat.Scolarite.reduce((latest, current) => {
                if (current.CommuneEtablissementOrigineCodePostal && current.AnneeScolaireCode > latest.AnneeScolaireCode) {
                    return current;
                }
                return latest;
            }, { AnneeScolaireCode: -1 });

            // Si aucune donnée pour AnneeScolaireCode = 0, prendre les données pour AnneeScolaireCode = 1
            if (lastYear.AnneeScolaireCode === 1) {
                lastYear = candidat.Scolarite.reduce((latest, current) => {
                    if (current.CommuneEtablissementOrigineCodePostal && current.AnneeScolaireCode === 1) {
                        return current;
                    }
                    return latest;
                }, { AnneeScolaireCode: -1 });
            }

            return lastYear;
        }

        // Récupérer la dernière année scolaire avec code postal pour chaque étudiant post-bac
        let lastYearWithPostalCode = postBacCandidates.map(candidat => getLastYearWithPostalCode(candidat));
        console.log("Dernière année scolaire avec code postal :", lastYearWithPostalCode);
        
        // Récupérer les codes postaux des étudiants post-bac
        let postBacPostalCodes = lastYearWithPostalCode.map(year => year.CommuneEtablissementOrigineCodePostal);
        console.log("Codes postaux des étudiants post-bac :", postBacPostalCodes);
        
        // faire le total des étudiants post-bac
        let totalPostBac = postBacPostalCodes.length;
        console.log("Total des étudiants post-bac :", totalPostBac);

        // Ne prendre que les deux premiers chiffres de chaque code postal
        let postBacPostalCodePrefixes = postBacPostalCodes.map(code => code ? code.toString().substring(0, 2) : null);
        console.log("Préfixes des codes postaux des étudiants post-bac :", postBacPostalCodePrefixes);

        // Créer un objet pour stocker les plus grandes villes par département
        let largestCitiesByDepartment = {};

        // Parcourir les codes postaux pour trouver la plus grande ville de chaque département
        codesPostaux.forEach(codePostal => {
            let departmentCode = codePostal.code_postal.substring(0, 2);
            if (!largestCitiesByDepartment[departmentCode] || codePostal.nom_de_la_commune.length > largestCitiesByDepartment[departmentCode].nom_de_la_commune.length) {
            largestCitiesByDepartment[departmentCode] = codePostal;
            }
        });

        // Extraire les données géographiques pour chaque grande ville
        let largestCitiesWithGeoData = Object.values(largestCitiesByDepartment)
            .map(city => {
                let [latitude, longitude] = city._geopoint.split(',');
                return {
                    code_postal_prefix: city.code_postal.substring(0, 2),
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude)
                };
            })
            .filter(city => !isNaN(city.latitude) && !isNaN(city.longitude));

        // Afficher les résultats dans la console
        console.log("Plus grandes villes par département avec données géographiques :", largestCitiesWithGeoData);

        // Associer chaque candidat post-bac à un code postal
        let postBacCandidatesWithPostalCodes = postBacCandidates.map(candidat => {
            let lastYear = getLastYearWithPostalCode(candidat);
            let codePostal = lastYear.CommuneEtablissementOrigineCodePostal;
            return {
            candidat: candidat,
            codePostal: codePostal ? codePostal.toString().substring(0, 2) : null
            };
        });

        // Ajouter des cercles pour chaque grande ville avec leurs données géographiques
        largestCitiesWithGeoData.forEach(city => {
            if (!isNaN(city.latitude) && !isNaN(city.longitude)) {
                var circle = L.circle([city.latitude, city.longitude], {
                    color: 'none',
                    fillColor: 'green',
                    fillOpacity: 0.5,
                    radius: 5000
                }).addTo(map);

            // Compter le nombre de candidats post-bac pour chaque département
            let postBacCountByDepartment = {};
            postBacCandidatesWithPostalCodes.forEach(candidate => {
                if (candidate.codePostal) {
                    if (postBacCountByDepartment[candidate.codePostal]) {
                        postBacCountByDepartment[candidate.codePostal]++;
                    } else {
                        postBacCountByDepartment[candidate.codePostal] = 1;
                    }
                }
            });

            // Afficher le nombre de candidats post-bac dans un popup pour chaque cercle
            let departmentCode = city.code_postal_prefix;
            let postBacCount = postBacCountByDepartment[departmentCode] || 0;
            if (postBacCount > 0) {
                circle.bindPopup(`Département : <b>${departmentCode}</b><br>Nombre de candidats post-bac : <b>${postBacCount}</b>`);
            } else {
                map.removeLayer(circle);
            }

            } else {
                console.warn(`Invalid coordinates for city: ${city.code_postal_prefix}`);
            }
        });

        console.log("Candidats post-bac avec codes postaux :", postBacCandidatesWithPostalCodes);

        // créer des cluster avec leaflet.markercluster
        var markers = L.markerClusterGroup({
            spiderfyOnMaxZoom: false,
            showCoverageOnHover: true,
            zoomToBoundsOnClick: false,
            animate: true,
            animateAddingMarkers: true,
            polygonOptions: {
            color: '#3388ff',
            weight: 2,
            opacity: 0.6,
            fillOpacity: 0.2,
            clickable: true,
            interactive: true,
            smoothFactor: 1,
            noClip: false,
            spiderLegPolylineOptions: {
                weight: 1.5,
                color: '#3388ff',
                opacity: 0.6
            }
            },
            iconCreateFunction: function(cluster) {
            var totalCluster = 0;

            cluster.getAllChildMarkers().forEach(marker => {
                let lyceeUAI = marker.options.lycee.numero_uai;
                if (lyceeCandidatsCount[lyceeUAI]) {
                totalCluster += lyceeCandidatsCount[lyceeUAI];
                }
            });

            cluster.on('click', function() {
                var totalCandidatures = 0;
                var filiereDetails = {
                "Générale": 0,
                "STI2D": 0,
                "Autre": 0
                };

                cluster.getAllChildMarkers().forEach(marker => {
                let lyceeUAI = marker.options.lycee.numero_uai;
                if (lyceeCandidatsCount[lyceeUAI]) {
                    totalCandidatures += lyceeCandidatsCount[lyceeUAI];
                    candidats.forEach(candidat => {
                    candidat.Scolarite.forEach(scolarite => {
                        if (scolarite.UAIEtablissementorigine === lyceeUAI && scolarite.AnneeScolaireCode === 0) {
                        let lycee = Lycees.binarySearch(scolarite.UAIEtablissementorigine);
                        if (lycee) {
                            if (candidat.Baccalaureat.SerieDiplomeCode === "Générale") {
                            filiereDetails["Générale"]++;
                            } else if (candidat.Baccalaureat.SerieDiplomeCode === "STI2D") {
                            filiereDetails["STI2D"]++;
                            } else {
                            filiereDetails["Autre"]++;
                            }
                        }
                        }
                    });
                    });
                }
                });

                L.popup()
                .setLatLng(cluster.getLatLng())
                .setContent(`Total des candidatures : <b>${totalCandidatures}</b><br>
                         Générale : <b>${filiereDetails["Générale"]}</b><br>
                         STI2D : <b>${filiereDetails["STI2D"]}</b><br>
                         Autre : <b>${filiereDetails["Autre"]}</b>`)
                .openOn(map);
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
            transition: 0.1s ease-in-out;
            }

            .custom-cluster span {
            display: inline-block;
            vertical-align: middle;
            }

            .custom-cluster:hover {
            background-color: rgba(255, 0, 0, 1);
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            }
        `;
        document.head.appendChild(style);

        // Ajouter les marqueurs au groupe de clusters avec les détails des filières
        lycees.forEach(lycee => {
            if (lyceeCandidatsCount[lycee.numero_uai] && lycee.latitude && lycee.longitude && !isNaN(lycee.latitude) && !isNaN(lycee.longitude)) {
            var filiereDetails = {
                "Générale": 0,
                "STI2D": 0,
                "Autre": 0
            };

            // Compter les candidatures par filière pour chaque lycée
            let lyceeCandidats = candidats.filter(candidat => 
                candidat.Scolarite.some(scolarite => 
                    scolarite.UAIEtablissementorigine === lycee.numero_uai && scolarite.AnneeScolaireCode === 0
                )
            );

            // Compter les candidatures par filière
            lyceeCandidats.forEach(candidat => {
                let scolarite = candidat.Scolarite.find(scolarite => scolarite.UAIEtablissementorigine === lycee.numero_uai && scolarite.AnneeScolaireCode === 0);
                if (scolarite) {
                    if (candidat.Baccalaureat.SerieDiplomeCode === "Générale") {
                        filiereDetails["Générale"]++;
                    } else if (candidat.Baccalaureat.SerieDiplomeCode === "STI2D") {
                        filiereDetails["STI2D"]++;
                    } else {
                        filiereDetails["Autre"]++;
                    }
                }
            });

            // Créer un marqueur pour chaque lycée
            var marker = L.marker([lycee.latitude, lycee.longitude], { lycee: lycee });
            marker.bindPopup(`<b>${lycee.appellation_officielle}</b><br>
                      Ville : <b>${lycee.libelle_commune}</b><br>
                      Nombre de candidats : <b>${lyceeCandidatsCount[lycee.numero_uai]}</b><br>
                      Générale : <b>${filiereDetails["Générale"]}</b><br>
                      STI2D : <b>${filiereDetails["STI2D"]}</b><br>
                      Autre : <b>${filiereDetails["Autre"]}</b>`);
            markers.addLayer(marker);
            }
        });

        // Ajouter le groupe de clusters à la carte
        map.addLayer(markers);
    }

    ViewAllClusters();
};

export {MapView};