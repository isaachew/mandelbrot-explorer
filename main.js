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
        {position:1/6,colour:[255,255,0]},
        {position:1/3,colour:[0,255,0]},
        {position:.5,colour:[0,255,255]},
        {position:2/3,colour:[0,0,255]},
        {position:5/6,colour:[255,0,255]},
        {position:1,colour:[255,0,0]}
    ],
    length:256
}

function getcol(x){
    if(x==-1)return 0
    x+=palette.time||0
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

        nnow=performance.now()
        if(nnow>pnow+30){
            context.putImageData(idata,0,0,0,lrow,width,(y+1)-lrow)
            lrow=(y+1)

            await new Promise(a=>setTimeout(a))

            pnow=nnow
        }
    }

    //idata.data.set(resultsArray,0)
    context.putImageData(idata,0,0)
    //console.log("put img data")
    //nnow=performance.now()
    //console.log("render in "+1e-3*(nnow-start)+" s")
}
function draw(){
    var colarr=new Uint32Array(idata.data.buffer)
    var lrow=0
    var index=0
    for(var y=0;y<height;y++){
        for(var x=0;x<width;x++){
            colarr[y*width+x]=-16777216|getcol(data[y][x])
        }
    }

    //idata.data.set(resultsArray,0)
    context.putImageData(idata,0,0)
}

function initModule(){

    console.log("wasm + webpage loaded")
    //Module.init(width,height)

    //resPtr=Module.getImgArray()
    //resultsArray=Module.HEAPU8.subarray(resPtr,resPtr+width*height*4)
    document.body.style.setProperty("--height",innerHeight+"px")

    document.getElementById("mid").style.height=innerHeight-157-document.getElementById("mid").offsetTop+"px"
    updateDims(width,height)
    Mandelbrot.updateCoords(cx,cy,scale)
    Mandelbrot.start()
    render()
}

function updateCoords(ncx,ncy,ndepth){
    Mandelbrot.updateCoords(cx=ncx,cy=ncy,scale=ndepth)
    Mandelbrot.start()
    render()
}

function updateDims(wid,hei){
    if(wid*canvcontainer.offsetHeight-canvcontainer.offsetWidth*hei>0){
        canvcontainer.className="vertical"
    }else{
        canvcontainer.className="horizontal"
    }
    canvas.width=width=wid
    canvas.height=height=hei
    Mandelbrot.updateDims(wid,hei)
    Mandelbrot.start()

    idata=context.createImageData(wid,hei)
    render()
}

document.getElementById("render").addEventListener("contextmenu",e=>{
    e.preventDefault()
})
document.getElementById("render").addEventListener("pointerup",e=>{
    let offx=e.offsetX,offy=e.offsetY
    let cont=document.getElementById("canvcontainer")
    let isVertical=e.target.width*cont.offsetHeight-e.target.height*cont.offsetWidth>0
    let asr=1
    if(isVertical){
        asr=e.target.width/cont.offsetWidth
    }else{
        asr=e.target.height/cont.offsetHeight
    }
    offx*=asr,offy*=asr

    var coords=Mandelbrot.getCoords(offx,offy);
    [cx,cy]=coords
    switch(e.button){
        case 0:
        scale/=2
        break;
        case 2:
        scale*=2
    }
    //document.getElementById("coordsDisp").textContent=cx+(cy>0?"+":"")+cy+"i"
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
//if(initialised)
//else Module.onRuntimeInitialized=initModule




/*
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
*/
/*
document.getElementById("editPalette").addEventListener("click",function(){
    document.getElementById("paletteEditor").style.display="block"
})
*/

addDrag(xhandle,
    function(a){

    },
    function(a){
        let yPos=a.pageY-3.5
        if(innerHeight-yPos-7<150){
            yPos=innerHeight-150-7
        }

        mid.style.height=(yPos-mid.offsetTop)+"px"
        mid.style.overflow="hidden"

        if(width*canvcontainer.offsetHeight-canvcontainer.offsetWidth*height>0){
            canvcontainer.className="vertical"
        }else{
            canvcontainer.className="horizontal"
        }
    },
    function(){

    }
)

addEventListener("resize",a=>{
    console.log("resized")
    document.body.style.setProperty("--height",innerHeight+"px")
    var mid=document.getElementById("mid")
    mid.style.height=Math.min(mid.offsetHeight,innerHeight-157-document.getElementById("render").offsetTop)+"px"
    if(width*canvcontainer.offsetHeight-canvcontainer.offsetWidth*height>0){
        canvcontainer.className="vertical"
    }else{
        canvcontainer.className="horizontal"
    }
})


/*
xhandle.addEventListener("mousemove",a=>{
    if(a.clientY==0)return
    console.log("drag")
    a.preventDefault()
    console.log(mid.offsetY,a.clientY)
    mid.style.height=(a.clientY-mid.offsetTop)+"px"
    mid.style.overflow="hidden"
})
*/
//xhandle.addEventListener("dragend",a=>{a.preventDefault()})


function download(blob,filename){
    var link=document.createElement('a')
    var objUrl=URL.createObjectURL(blob)
    link.href=objUrl
    link.download=filename
    link.click()
    URL.revokeObjectURL(blob)
}
function saveImg(){
    document.getElementById('render').toBlob(a=>{
        var link=document.createElement('a')
        var objUrl=URL.createObjectURL(a)
        link.href=objUrl
        link.download="render.png"
        link.click()
    },'image/png')
}

function showDiv(elem) {
    [...document.getElementsByClassName("visible")].map(el=>{
        el.classList.remove("visible")
    });

    document.getElementById(elem).classList.add("visible")
}

initModule()
