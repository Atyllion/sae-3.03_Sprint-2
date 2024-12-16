// VIEW
import { HeaderView } from "./ui/header/index.js";
import { MapView } from "./ui/map/index.js";

// DATA
import { Candidats } from "./data/data-candidats.js";
import { Lycees } from "./data/data-lycees.js";

// STYLE
import './index.css';


let C = {};

C.init = async function(){
    V.init();
    console.log(Candidats.getAll());
    console.log(Lycees.getAll());
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