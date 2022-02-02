let canvas=document.getElementById("render")
let context=canvas.getContext("2d")

let width=canvas.width,height=canvas.height
let scale=4
let cx=-1,cy=0
let paletteId=0
let idata=context.createImageData(width,height)


var resPtr=null,resultsArray=null

let palette={
    stops:[
        {position:0,colour:[255,0,0]},
        {position:0.5,colour:[255,255,0]},
        {position:1,colour:[255,0,0]}
    ],
    length:150
}
function changePalette(){
    let ncols=1
    for(;Math.random()<.5;ncols++);
    ncols=5
    var randcol=()=>[255*Math.random(),255*Math.random(),255*Math.random()]
    let endpoints=randcol()
    let stops=[{position:0,colour:endpoints},{position:1,colour:endpoints}]
    for(var i=0;i<ncols;i++){
        stops.push({position:Math.random(),colour:randcol()})
    }
    stops.sort((a,b)=>a.position-b.position)
    palette.stops=stops


    let palcanv=document.getElementById("paletteGradient")
    let palctx=palcanv.getContext("2d")
    let grad=palctx.createLinearGradient(0,0,700,0)

    for(var i of palette.stops){
        grad.addColorStop(i.position,"#"+i.colour.map(a=>(a|0).toString(16).padStart(2,0)).join``)
    }
    palctx.fillStyle=grad
    palctx.fillRect(0,0,700,25)



    //Mandelbrot.start()
    render()
}

function getcol(x){
    if(x==-1)return 0
    let progress=x%palette.length/palette.length
    let palind=palette.stops.findIndex(a=>a.position>progress)
    let colprog=(progress-palette.stops[palind-1].position)/(palette.stops[palind].position-palette.stops[palind-1].position)
    let cr=palette.stops[palind].colour[0]*colprog+palette.stops[palind-1].colour[0]*(1-colprog)
    let cg=palette.stops[palind].colour[1]*colprog+palette.stops[palind-1].colour[1]*(1-colprog)
    let cb=palette.stops[palind].colour[2]*colprog+palette.stops[palind-1].colour[2]*(1-colprog)
    return (cb<<16)|(cg<<8)|cr
}

async function render(){
    var start,pnow,nnow
    start=pnow=performance.now()
    var colarr=new Uint32Array(idata.data.buffer)
    var lrow=0
    for(var y=0;y<height;y++){
        var row=await Mandelbrot.calcRow(y,1)
        for(var x=0;x<width;x++){
            colarr[y*width+x]=-16777216|getcol(row[x])
        }
        /*

        nnow=performance.now()
        if(nnow>pnow+100){
            //idata.data.set(resultsArray,0)

            idata.data.set(resultsArray.subarray(width*lrow*4,width*(y+1)*4),0)
            //context.putImageData(idata,0,0)
            context.putImageData(idata,0,lrow,0,0,width,y+1-lrow)
            row=y+1

            await new Promise(a=>setTimeout(a))

            pnow=nnow
        }
        */
    }

    //idata.data.set(resultsArray,0)
    context.putImageData(idata,0,0)
    console.log("put img data")
    nnow=performance.now()
    console.log("render in "+1e-3*(nnow-start)+" s")
}

function initModule(){

    console.log("wasm + webpage loaded")
    //Module.init(width,height)

    //resPtr=Module.getImgArray()
    //resultsArray=Module.HEAPU8.subarray(resPtr,resPtr+width*height*4)
    Mandelbrot.updateDims(width,height)
    Mandelbrot.updateCoords(cx,cy,scale)
    Mandelbrot.start()
    render()
}

function updateDims(wid,hei){
    idata=context.createImageData(wid,hei)
    Mandelbrot.updateDims(width=wid,height=hei)
    Mandelbrot.start()
    render()
}

document.getElementById("render").addEventListener("contextmenu",e=>{
    e.preventDefault()
})
document.getElementById("render").addEventListener("mousedown",e=>{
    var coords=Mandelbrot.getCoords(e.offsetX,e.offsetY);
    [cx,cy]=coords
    switch(e.button){
        case 0:
        scale/=2
        break;
        case 2:
        scale*=2
    }
    document.getElementById("coordsDisp").textContent=cx+(cy>0?"+":"")+cy+"i"
    Mandelbrot.updateCoords(...coords,scale)
    Mandelbrot.start()
    render()
})
document.getElementById("render").addEventListener("keydown",e=>{
    var coords=Mandelbrot.getCoords(width/2,height/2)
    scale*=.01
    Mandelbrot.updateCoords(...coords,scale)
    Mandelbrot.start()
    render()
    e.preventDefault()
})
initModule()
//if(initialised)
//else Module.onRuntimeInitialized=initModule





document.getElementById("coordsInp").addEventListener("change",function(e){
    var val=e.target.value
    var vss=val.split` `
    cx=+vss[0]
    cy=+vss[1]
    Mandelbrot.updateCoords(cx,cy,scale)
    Mandelbrot.start()
    render()
})
document.getElementById("depthInp").addEventListener("change",function(e){
    var val=e.target.value
    scale=val
    Mandelbrot.updateCoords(cx,cy,scale)
    Mandelbrot.start()
    render()
})

let palcanv=document.getElementById("paletteGradient")
let palctx=palcanv.getContext("2d")
let grad=palctx.createLinearGradient(0,0,700,0)

for(var i of palette.stops){
    grad.addColorStop(i.position,"#"+i.colour.map(a=>a.toString(16).padStart(2,0)).join``)
}
palctx.fillStyle=grad
palctx.fillRect(0,0,700,25)
