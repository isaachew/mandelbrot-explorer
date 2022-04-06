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
    let ncols=10
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
        dvel.textContent="\u00a0"

        function selectStop(){
            selStop=curIndex
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

function moveColourStop(index,position){

    let palStops=palette.stops
    document.getElementById("paletteStop"+selStop).style.left=position*700+"px"


    let newIndex=palStops.findIndex((a,b)=>b>index?a.position>=position:a.position>position)
    if(newIndex>index)newIndex--

    palStops[index].position=position

    if(palStops[index].position<palStops[index-1].position
        ||
    palStops[index].position>palStops[index+1].position){
        let oldEl=palStops.splice(index,1)[0]
        palStops.splice(newIndex,0,oldEl)
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


function dispPalette(){
    updateGradient()
    updateHandles()
}

dispPalette()
