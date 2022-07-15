var palettePresets={
    rainbow:{
        stops:[
            {position:0,colour:[255,0,0]},
            {position:1/6,colour:[255,255,0]},
            {position:1/3,colour:[0,255,0]},
            {position:.5,colour:[0,255,255]},
            {position:2/3,colour:[0,0,255]},
            {position:5/6,colour:[255,0,255]},
            {position:1,colour:[255,0,0]}
        ],
        length:256,
        name:"Rainbow (default)"
    },
    rand:{
        stops:[
            {position:0,colour:[140.876,101.473,69.206]},
            {position:0.109,colour:[187.064,204.615,249.97]},
            {position:0.222,colour:[137.797,149.87,157.419]},
            {position:0.571,colour:[20.954,237.759,189.912]},
            {position:0.775,colour:[25.324,139.237,125.001]},
            {position:0.846,colour:[218.979,115.524,34.639]},
            {position:1,colour:[140.876,101.473,69.206]}
        ],
        length:293,
        name:"Random Palette 1"
    },
    rgb:{
        stops:[
            {position:0,colour:[0,0,0]},
            {position:1/6,colour:[255,180,180]},
            {position:1/3,colour:[0,0,0]},
            {position:.5,colour:[180,255,180]},
            {position:2/3,colour:[0,0,0]},
            {position:5/6,colour:[180,180,255]},
            {position:1,colour:[0,0,0]}
        ],
        length:256,
        name:"RGB Palette"
    }
}

//let exPals=JSON.parse(localStorage.palettes)
//Object.assign(palettePresets,exPals)
for(var i in palettePresets){
    var sel=document.createElement("option")
    sel.value=i
    sel.append(palettePresets[i].name)
    document.getElementById("presetSelect").append(sel)
}

function hexToRGB(st){
    return [
        parseInt(st.slice(1,3),16),
        parseInt(st.slice(3,5),16),
        parseInt(st.slice(5,7),16)
    ]
}

function rgbToHex(st){
    var toHex=comp=>(comp|0).toString(16).padStart(2,0)
    return "#"+toHex(st[0])+toHex(st[1])+toHex(st[2])
}

function randomPalette(){
    //let ncols=1
    //for(;Math.random()<.5;ncols++);
    let ncols=5
    var randcol=()=>[255*Math.random(),255*Math.random(),255*Math.random()]
    let endpoints=randcol()
    let stops=[{position:0,colour:endpoints},{position:1,colour:endpoints}]
    for(var colStop=0;colStop<ncols;colStop++){
        stops.push({position:Math.random(),colour:randcol()})
    }
    stops.sort((a,b)=>a.position-b.position)
    palette.stops=stops
    dispPalette()
    //Mandelbrot.start()
    draw()
}
document.getElementById("randomPalette").addEventListener("click",a=>{
    randomPalette()
})

let selStop=null
function updateGradient(){
    let palcanv=document.getElementById("paletteGradient")
    let palctx=palcanv.getContext("2d")
    let grad=palctx.createLinearGradient(0,0,700,0)

    document.getElementById("lengthInput").value=palette.length
    for(var ind=0;ind<palette.stops.length;ind++){
        let colStop=palette.stops[ind]
        let csscol="#"+colStop.colour.map(a=>(a|0).toString(16).padStart(2,0)).join``
        grad.addColorStop(colStop.position,csscol)

    }

    palctx.fillStyle=grad
    palctx.fillRect(0,0,700,30)
}
let lastUpdate=performance.now()
function updateHandles(){
    document.getElementById("colStops").innerHTML=""
    for(var ind=0;ind<palette.stops.length;ind++){
        let curIndex=ind
        let colStop=palette.stops[ind]
        let dvel=document.createElement("div")
        dvel.classList.add("colstop")
        dvel.id="paletteStop"+ind
        let csscol="#"+colStop.colour.map(a=>(a|0).toString(16).padStart(2,0)).join``
        dvel.style.backgroundColor=csscol
        dvel.style.left=colStop.position*700+"px"

        function selectStop(){
            if(selStop!=null)document.getElementById("paletteStop"+selStop).classList.remove("selectedStop")
            selStop=curIndex
            document.getElementById("paletteStop"+selStop).classList.add("selectedStop")
            document.getElementById("stopOffset").value=palette.stops[curIndex].position
            document.getElementById("stopColour").value=rgbToHex(palette.stops[curIndex].colour)
        }
        dvel.addEventListener("click",selectStop)
        if(curIndex%(palette.stops.length-1)){
            addDrag(dvel,selectStop,function(e){
                let pos=(e.clientX-document.getElementById("colStops").offsetLeft)/700
                if(pos<0)pos=0
                if(pos>1)pos=1
                selStop=moveColourStop(selStop,pos)

                let updTime=performance.now()
                if(updTime-lastUpdate>50){
                    lastUpdate=updTime
                    draw()
                }
            },function(){

            })
        }
        document.getElementById("colStops").append(dvel)
    }
}

function addColourStop(stop){
    SortedArray.pushAndSort(palette.stops,stop)
    updateGradient()
    updateHandles()
    draw()
}
function removeColourStop(index){
    if(index%(palette.stops.length-1)){
        palette.stops.splice(index,1)

        updateGradient()
        updateHandles()
        draw()
    }
}


document.getElementById("remColourStop").addEventListener("click",e=>{
    if(selStop!=null){
        removeColourStop(selStop)
        selStop=null
    }
})
document.getElementById("paletteGradient").addEventListener("click",e=>{
    console.log(e.clientX,e.target.offsetLeft,(e.clientX-e.target.offsetLeft)/e.target.offsetWidth)
    addColourStop({position:(e.clientX-e.target.offsetLeft)/e.target.offsetWidth,colour:[255,255,255]})
})


function moveColourStop(index,position){

    let palStops=palette.stops
    document.getElementById("paletteStop"+selStop).style.left=position*700+"px"


    let newIndex=SortedArray.updatePosition(palStops,index,position)
    if(newIndex!=index){
        updateHandles()
    }
    updateGradient()
    return newIndex
}

document.getElementById("stopOffset").addEventListener("input",function(e){
    if(selStop!=null&&selStop%(palette.stops.length-1)){
        if(this.value>=0&&this.value<=1)selStop=moveColourStop(selStop,+this.value)
    }
    dispPalette()
    draw()
})
document.getElementById("stopColour").addEventListener("input",function(e){
    if(selStop!=null)palette.stops[selStop].colour=hexToRGB(this.value)
    dispPalette()
    draw()
})
document.getElementById("lengthInput").addEventListener("input",function(e){
    palette.length=+this.value
    draw()
})

function clonePalette(pal){
    var newPalette={stops:[],length:0}
    newPalette.length=pal.length
    for(var i of pal.stops){
        newPalette.stops.push({position:i.position,colour:i.colour})
    }
    return newPalette
}

document.getElementById("presetSelect").addEventListener("input",function(e){
    palette=clonePalette(palettePresets[e.target.value])
    updateGradient()
    updateHandles()
    draw()
})


function dispPalette(){
    updateGradient()
    updateHandles()
}

dispPalette()
