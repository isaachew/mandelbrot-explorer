let canvas=document.getElementById("render")
let context=canvas.getContext("2d")

let width=canvas.width,height=canvas.height
let scale=4
let cx=-1,cy=0
let idata=context.createImageData(width,height)


var resPtr=null,resultsArray=null
function getcol(x){
    if(x==-1)return 0
    return 255|((x&128?~(x<<1):x<<1)&255)<<8
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
    Mandelbrot.updateCoords(cx,cy,scale)
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
    document.getElementById("coordsdisp").textContent=cx+(cy>0?"+":"")+cy+"i"
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





document.getElementById("coordsinp").addEventListener("change",function(e){
    var val=e.target.value
    var vss=val.split` `
    cx=+vss[0]
    cy=+vss[1]
    Mandelbrot.updateCoords(cx,cy,scale)
    Mandelbrot.start()
    render()
})
document.getElementById("depthinp").addEventListener("change",function(e){
    var val=e.target.value
    scale=val
    Mandelbrot.updateCoords(cx,cy,scale)
    Mandelbrot.start()
    render()
})
