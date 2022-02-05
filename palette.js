function hexToRGB(st){
    return [parseInt(st.slice(1,3),16),parseInt(st.slice(3,5),16),parseInt(st.slice(5,7),16)]
}

let requested=false
function reqRender(){
    if(!requested){
        requested=true

    }
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

let selStop=null
function updateGradient(){
    let palcanv=document.getElementById("paletteGradient")
    let palctx=palcanv.getContext("2d")
    let grad=palctx.createLinearGradient(0,0,700,0)

    document.getElementById("paletteLength").textContent=palette.length
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
        dvel.style.left=colStop.position*700+"px"
        let csscol="#"+colStop.colour.map(a=>(a|0).toString(16).padStart(2,0)).join``
        dvel.style.backgroundColor=csscol
        dvel.textContent="\u00a0"
        dvel.addEventListener("click",e=>{
            selStop=curIndex
        })
        if(colStop.position%1){
            dvel.draggable=true
            dvel.addEventListener("dragstart",e=>{
                selStop=curIndex
            })
        }
        document.getElementById("colStops").append(dvel)
    }
}

let palDisp=document.getElementById("paletteDisplay")
palDisp.addEventListener("dragover",e=>{
    e.preventDefault()

    let palStops=palette.stops
    if(e.screenX==e.clientX&&e.clientX==0)return
    let offset=e.clientX-document.getElementById("colStops").offsetLeft
    if(offset<0)offset=0
    if(offset>700)offset=700

    let newPos=palStops[selStop].position=offset/700
    document.getElementById("paletteStop"+selStop).style.left=offset+"px"


    let newIndex=palStops.findIndex(a=>a.position>newPos)
    if(newIndex>selStop)newIndex--

    if(palStops[selStop].position<palStops[selStop-1].position
        ||
    palStops[selStop].position>palStops[selStop+1].position){
        selStop=newIndex
        palStops.sort((a,b)=>a.position-b.position)
        updateHandles()
    }
    updateGradient()

    let updTime=performance.now()
    if(updTime-lastUpdate>50){
        lastUpdate=updTime
        render()
    }
    //updateHandles()
})

palDisp.addEventListener("dragend",function(e){
    e.preventDefault()
    updateHandles()
    render()
},true)

document.getElementById("colInput").addEventListener("input",function(e){
    if(selStop!=null)palette.stops[selStop].colour=hexToRGB(this.value)
    dispPalette()
    render()
})
document.getElementById("lengthInput").addEventListener("input",function(e){
    palette.length=+this.value
    render()
})


function dispPalette(){
    updateGradient()
    updateHandles()
}

dispPalette()
