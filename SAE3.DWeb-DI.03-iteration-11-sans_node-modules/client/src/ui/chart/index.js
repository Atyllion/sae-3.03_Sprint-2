// DATA
import { Lycees } from "../../data/data-lycees.js";
import { Candidats } from "../../data/data-candidats.js";
import { CodesPostaux } from "../../data/data-code_postaux.js";

// Chart
import zingchart from '../../../node_modules/zingchart/es6.js';
// Modules must be imported EXPLICITLY when using es6 version
import '../../../node_modules/zingchart/modules-es6/zingchart-pareto.min.js';

let ChartView = {};

ChartView.render = function() {
    // Filtrer les départements avec au moins un candidat
    let departementsWithCandidates = new Set();

    let candidats = Candidats.getAll();
    let codesPostaux = CodesPostaux.getAll();

    // Récupérer les candidats post-bac
    let postBacCandidates = getPostBacCandidates(candidats);

    // Fonction pour obtenir les candidats post-bac
    function getPostBacCandidates(candidats) {
        return candidats.filter(candidat => candidat.Baccalaureat && candidat.Baccalaureat.TypeDiplomeCode === 1);
    }

    // Récupérer la dernière année scolaire avec code postal pour chaque candidat
    let lastYearWithPostalCode = postBacCandidates.map(candidat => getLastYearWithPostalCode(candidat));

    // Récupérer les codes postaux des candidats post-bac
    let postBacPostalCodes = lastYearWithPostalCode.map(year => year.CommuneEtablissementOrigineCodePostal);

    // Compter le nombre de candidats par département et par filière
    let candidatsByDepartement = {
        generale: {},
        sti2d: {},
        autre: {},
        postBac: {}
    };

    console.table("candidats par département : ", candidatsByDepartement);
    
    // Compter les candidats post-bac par département
    postBacPostalCodes.forEach(codePostal => {
        if (codePostal) {
            let departement = codePostal.substring(0, 2);
            if (!candidatsByDepartement.postBac[departement]) {
                candidatsByDepartement.postBac[departement] = 0;
            }
            candidatsByDepartement.postBac[departement]++;
        }
    });

    // Compter les candidats par département et par filière
    candidats.forEach(candidat => {
        let lastYear = getLastYearWithPostalCode(candidat);
        let codePostal = lastYear.CommuneEtablissementOrigineCodePostal;
        if (codePostal) {
            let departement = codePostal.substring(0, 2);
            let filiere = getFiliere(candidat.Baccalaureat.SerieDiplomeCode);
            if (!candidatsByDepartement[filiere][departement]) {
                candidatsByDepartement[filiere][departement] = 0;
            }
            candidatsByDepartement[filiere][departement]++;
        }
    });

    // Fonction pour obtenir la filière
    function getFiliere(serieDiplomeCode) {
        switch (serieDiplomeCode) {
            case "Générale":
                return "generale";
            case "STI2D":
                return "sti2d";
            default:
                return "autre";
        }
    }

    // Créer un élément select pour le tri
    let select = document.createElement('select');
    select.innerHTML = `
        <option value="departement">Trier par département</option>
        <option value="candidats">Trier par nombre de candidats</option>
    `;

    document.getElementById('chart').appendChild(select);

    // Ajouter un écouteur d'événement pour le changement de tri
    select.addEventListener('change', function() {
        let sortBy = select.value;

        if (sortBy === 'candidats') {
            departementsWithCandidates.sort((a, b) => {
                let totalA = ['generale', 'sti2d', 'autre', 'postBac'].reduce((sum, filiere) => sum + (candidatsByDepartement[filiere][a] || 0), 0);
                let totalB = ['generale', 'sti2d', 'autre', 'postBac'].reduce((sum, filiere) => sum + (candidatsByDepartement[filiere][b] || 0), 0);
                return totalB - totalA;
            });
        } else {
            departementsWithCandidates.sort((a, b) => a.localeCompare(b));
        }

        chartConfig.scaleX.labels = departementsWithCandidates;
        ['generale', 'sti2d', 'autre', 'postBac'].forEach((filiere, index) => {
            chartConfig.series[index].values = departementsWithCandidates.map(dep => candidatsByDepartement[filiere][dep] || 0);
        });

        // Re-render la chart
        zingchart.exec('chart', 'setdata', { data: chartConfig });
    });

    // Créer un élément input de type range pour le seuil
    let slider = document.createElement('input');
    slider.type = 'range';
    slider.min = 1;
    slider.max = 10;
    slider.value = 3;
    slider.id = 'thresholdSlider';

    // Créer un label pour afficher la valeur du seuil
    let sliderLabel = document.createElement('label');
    sliderLabel.htmlFor = 'thresholdSlider';
    sliderLabel.innerText = `Seuil: ${slider.value}`;
    document.getElementById('chart').appendChild(sliderLabel);
    document.getElementById('chart').appendChild(slider);

    // Ajouter un écouteur d'événement pour le changement de seuil
    slider.addEventListener('input', function() {
        let threshold = parseInt(slider.value);
        sliderLabel.innerText = `Seuil: ${threshold}`;

        let filteredDepartements = [];
        let autresDepartementsCount = { generale: 0, sti2d: 0, autre: 0, postBac: 0 };

        departementsWithCandidates.forEach(departement => {
            let totalCandidats = ['generale', 'sti2d', 'autre', 'postBac'].reduce((sum, filiere) => sum + (candidatsByDepartement[filiere][departement] || 0), 0);

            if (totalCandidats > threshold) {
                filteredDepartements.push(departement);
            } else {
                ['generale', 'sti2d', 'autre', 'postBac'].forEach(filiere => {
                    autresDepartementsCount[filiere] += (candidatsByDepartement[filiere][departement] || 0);
                });
            }
        });

        filteredDepartements.push('Autres départements');

        chartConfig.scaleX.labels = filteredDepartements;
        ['generale', 'sti2d', 'autre', 'postBac'].forEach((filiere, index) => {
            chartConfig.series[index].values = filteredDepartements.map(dep => dep === 'Autres départements' ? autresDepartementsCount[filiere] : (candidatsByDepartement[filiere][dep] || 0));
        });

        // Re-render la chart
        zingchart.exec('chart', 'setdata', { data: chartConfig });
    });

    // Filtrer les départements avec au moins un candidat
    Object.values(candidatsByDepartement).forEach(filiere => {
        Object.keys(filiere).forEach(departement => {
            if (filiere[departement] > 0) {
                departementsWithCandidates.add(departement);
            }
        });
    });

    departementsWithCandidates = Array.from(departementsWithCandidates);

    // Trier les départements par ordre croissant
    departementsWithCandidates.sort((a, b) => a.localeCompare(b));

    // Configuration du graphique
    let chartConfig = {
        type: 'hbar',
        stacked: true,

        // le titre du graphique
        title: {
            text: 'Candidats par département',
            align: 'center',
            verticalAlign: 'top',
            color: '#5D7D9A',
            padding: '30 0 0 0',
        },

        // les noms des différentes filières
        legend: {
            backgroundColor: 'white',
            borderWidth: '1px',
            borderColor: '#D8D8D8',
            item: {
                cursor: 'hand',
                fontColor: '#307C70',
                fontFamily: 'arial',
                fontSize: '12px',
                fontWeight: 'bold',
                shadow: false,
                padding: '5px',
            },
            layout: '4x1',
            align: 'right',
            verticalAlign: 'bottom',
            marker: {
                type: 'circle',
                size: 5,
                cursor: 'hand',
            },
            toggleAction: 'remove',
            draggable: true,
            dragHandler: 'icon',
        },

        // les paramètres du graphique
        plot: {
            stacked: true,
            stackedNumber: 4,
            tooltip: {
                visible: true,
                text: '%t : %v',
            },
            barWidth: '1px',
        },

        // les paramètres de l'axe des x
        scaleX: {
            labels: departementsWithCandidates,
            label: {
                color: '#6C6C6C',
                text: 'Départements',
            },
            item: {
                color: '#6C6C6C',
                angle: 45,
                maxChars: 5,
            },
            lineColor: '#D8D8D8',
            tick: {
                visible: false,
                lineColor: '#D8D8D8',
            },

            zooming: true,

            guide: {
                visible: true,
                lineColor: '#D8D8D8',
            },
        },

        // les paramètres de l'axe des y
        scaleY: {
            values: '0:160:10',
            label: {
                padding: '20 0 0 0',
                text: 'Candidats',
                color: '#6C6C6C',
            },
            guide: {
                lineStyle: 'solid',
            },
            item: {
                color: '#6C6C6C',
            },
            lineColor: '#D8D8D8',
            tick: {
                lineColor: '#D8D8D8',
            },

            zooming: true,

            // les paramètres de la barre de défilement
            scrollY: {
                bar: {
                    backgroundColor: '#D8D8D8',
                    alpha: 0.5,
                    width: '10px',
                },
                handle: {
                    backgroundColor: '#5D7D9A',
                    alpha: 0.7,
                    width: '10px',
                },
            },
        },

        // les paramètres de la barre de prévisualisation
        // a enlever si on ne veut pas de barre de prévisualisation
        preview: {
            backgroundColor: '#F5F7F3',
            borderWidth: '0px',
            handle: {
                borderWidth: '1px',
            },
            height: '80%',
            mask: {
                alpha: 0.8,
                backgroundColor: 'gray',
            },
            preserveZoom: false,
            y: '20%',
            x: '2%',
        },

        series: [
            {
                text: 'Générale',
                values: departementsWithCandidates.map(dep => candidatsByDepartement.generale[dep] || 0),
                backgroundColor: '#FFD700',
            },
            {
                text: 'STI2D',
                values: departementsWithCandidates.map(dep => candidatsByDepartement.sti2d[dep] || 0),
                backgroundColor: '#FF6347',
            },
            {
                text: 'Autre',
                values: departementsWithCandidates.map(dep => candidatsByDepartement.autre[dep] || 0),
                backgroundColor: '#4682B4',
            },
            {
                text: 'Post-Bac',
                values: departementsWithCandidates.map(dep => candidatsByDepartement.postBac[dep] || 0),
                backgroundColor: '#32CD32',
            }
        ],
    };

    // Fonction pour obtenir la dernière année scolaire avec code postal
    function getLastYearWithPostalCode(candidat) {
        let lastYear = { AnneeScolaireCode: 0 };

        candidat.Scolarite.forEach(current => {
            if (current.CommuneEtablissementOrigineCodePostal && current.AnneeScolaireCode > lastYear.AnneeScolaireCode) {
                lastYear = current;
            }
        });

        return lastYear;
    }

    // Mettre à jour les labels et les valeurs du graphique
    chartConfig.scaleX.labels = departementsWithCandidates;

    // render chart
    zingchart.render({
        id: 'chart',
        data: chartConfig,
        height: '100%',
        width: '100%',
    });
};

export { ChartView };