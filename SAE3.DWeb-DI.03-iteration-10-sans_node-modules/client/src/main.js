// VIEW
import { HeaderView } from "./ui/header/index.js";
import { MapView } from "./ui/map/index.js";

// DATA
import { Candidats } from "./data/data-candidats.js";
import { Lycees } from "./data/data-lycees.js";
import { CodesPostaux } from "./data/data-code_postaux.js";

// STYLE
import './index.css';


let C = {};

C.init = async function(){
    V.init();
    let candidats = Candidats.getAll();
    let lycees = Lycees.getAll();
    
    console.log(lycees);
    console.log(candidats);

}

let V = {
    header: document.querySelector("#header")
};

V.init = function(){
    V.renderHeader();
    V.renderMap();
}

V.renderHeader= function(){
    V.header.innerHTML = HeaderView.render();
}

V.renderMap = function(){
    MapView.render();
};


C.init();