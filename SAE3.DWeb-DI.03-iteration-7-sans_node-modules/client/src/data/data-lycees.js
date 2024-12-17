

let data = await fetch("./src/data/json/lycees.json");
data = await data.json();

data.shift();

let compare = function(a,b){
    return a.numero_uai < b.numero_uai ? -1 : a.numero_uai > b.numero_uai ? 1 : 0;
}

data.sort(compare);

let Lycees = {}

Lycees.getAll = function(){ 
    return data;
}

Lycees.binarySearch = function(numero_uai){
    let min = 0;
    let max = data.length - 1;
    let mid;
    let element;

    while(min <= max){
        mid = Math.floor((min + max) / 2, 10);
        element = data[mid];
        if(element.numero_uai < numero_uai){
            min = mid + 1;
        } else if(element.numero_uai > numero_uai){
            max = mid - 1;
        } else {
            return element;
        }
    }
    return null;
}

export { Lycees };