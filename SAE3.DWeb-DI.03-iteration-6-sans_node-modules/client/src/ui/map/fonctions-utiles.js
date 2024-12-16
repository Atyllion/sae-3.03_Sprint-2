/*
    // un simple marqueur //
    var marker = L.marker([45.836319, 1.231629]).addTo(map);
    marker.bindPopup("<b>LA !</b><br> ici").openPopup();

    // un cercle (rayon en mètres) //
    var circle = L.circle([51.508, -0.11], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 500
    }).addTo(map);
    circle.bindPopup("I am a circle.");
    
    // un polygone (liste de coordonnées) //
    var polygon = L.polygon([
        [51.509, -0.08],
        [51.503, -0.06],
        [51.51, -0.047]
    ]).addTo(map);
    polygon.bindPopup("I am a polygon.");

    // un popup autonome (sans marqueur) //
    var popup = L.popup()
    .setLatLng([51.513, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(map);

    {
        "numero_uai": "numero_uai",
        "appellation_officielle": "appellation_officielle",
        "denomination_principale": "denomination_principale",
        "patronyme_uai": "patronyme_uai",
        "secteur_public_prive_libe": "secteur_public_prive_libe",
        "adresse_uai": "adresse_uai",
        "lieu_dit_uai": "lieu_dit_uai",
        "boite_postale_uai": "boite_postale_uai",
        "code_postal_uai": "code_postal_uai",
        "localite_acheminement_uai": "localite_acheminement_uai",
        "libelle_commune": "libelle_commune",
        "coordonnee_x": "coordonnee_x",
        "coordonnee_y": "coordonnee_y",
        "EPSG": "EPSG",
        "latitude": "latitude",
        "longitude": "longitude",
        "appariement": "appariement",
        "localisation": "localisation",
        "nature_uai": "nature_uai",
        "nature_uai_libe": "nature_uai_libe",
        "etat_etablissement": "etat_etablissement",
        "etat_etablissement_libe": "etat_etablissement_libe",
        "code_departement": "code_departement",
        "code_region": "code_region",
        "code_academie": "code_academie",
        "code_commune": "code_commune",
        "libelle_departement": "libelle_departement",
        "libelle_region": "libelle_region",
        "libelle_academie": "libelle_academie",
        "position": "position",
        "secteur_prive_code_type_contrat": "secteur_prive_code_type_contrat",
        "secteur_prive_libelle_type_contrat": "secteur_prive_libelle_type_contrat",
        "code_ministere": "code_ministere",
        "libelle_ministere": "libelle_ministere",
        "date_ouverture": "date_ouverture"
    },
*/