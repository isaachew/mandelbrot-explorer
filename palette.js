function hexToRGB(st){
    return [parseInt(st.slice(1,3),16),parseInt(st.slice(3,5),16),parseInt(st.slice(5,7),16)]
}

function randomPalette(){
    let ncols=1
    for(;Math.random()<.5;ncols++);
    ncols=5
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
    render()
}

let selectedStop=null
function updateGradient(){
    let palcanv=document.getElementById("paletteGradient")
    let palctx=palcanv.getContext("2d")
    let grad=palctx.createLinearGradient(0,0,700,0)

    document.getElementById("paletteLength").textContent=palette.length
    for(var ind=0;ind<palette.stops.length;ind++){
        var colStop=palette.stops[ind]
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
        let colStop=palette.stops[ind]
        let dvel=document.createElement("div")
        dvel.classList.add("colstop")
        dvel.style.left=colStop.position*700+"px"
        let csscol="#"+colStop.colour.map(a=>(a|0).toString(16).padStart(2,0)).join``
        dvel.style.backgroundColor=csscol
        dvel.textContent="\u00a0"
        dvel.setAttribute("a",ind)
        dvel.draggable=true
        dvel.addEventListener("dragstart",e=>{})
        dvel.addEventListener("drag",e=>{
            if(e.screenX==e.clientX&&e.clientX==0)return
            let offset=e.clientX-document.getElementById("colStops").offsetLeft
            if(offset<0)offset=0
            if(offset>700)offset=700
            palette.stops[dvel.getAttribute("a")].position=offset/700
            dvel.style.left=offset+"px"

            palette.stops.sort((a,b)=>a.position-b.position)
            updateGradient()
            let updTime=performance.now()
            if(updTime-lastUpdate>100){
                console.log(updTime)
                render()
                lastUpdate=updTime
            }
            //updateHandles()
        })
        document.getElementById("colStops").append(dvel)
    }
}


document.addEventListener("dragover",function(e){
    e.preventDefault()
})
document.addEventListener("dragend",function(e){
    e.preventDefault()
    palette.stops.sort((a,b)=>a.position-b.position)
    updateHandles()
    render()
})


function dispPalette(){
    updateGradient()
    updateHandles()
}

dispPalette()
