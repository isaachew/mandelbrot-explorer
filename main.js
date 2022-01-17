let canvas=document.getElementById("render")
let context=canvas.getContext("2d")

let width=canvas.width,height=canvas.height
let scale=4
let cx=-1,cy=0
let idata=context.createImageData(width,height)


var resPtr=null,resultsArray=null

async function render(){
    console.log("wasm loaded")
    console.time("mandelbrot")
    var colarr=new Uint32Array(idata.data.buffer)
    var pnow=performance.now()
    for(var y=0;y<height;y++){
        for(var x=0;x<width;x++){
            Module.calcPixel(x,y)
        }
        idata.data.set(resultsArray,0)
        context.putImageData(idata,0,0)

        var nnow=performance.now()
        if(nnow>pnow+16){
            await new Promise(a=>setTimeout(a))
            pnow=nnow
        }
    }
    console.log("put img data")
    console.timeEnd("mandelbrot")
}

function initModule(){

    Module.init(width,height)

    resPtr=Module.getImgArray()
    resultsArray=Module.HEAPU8.subarray(resPtr,resPtr+width*height*4)
    render()
}
document.getElementById("render").addEventListener("contextmenu",e=>{
    e.preventDefault()
})
document.getElementById("render").addEventListener("mousedown",e=>{
    var coords=Module.getCoords(e.offsetX,e.offsetY);
    switch(e.button){
        case 0:
        scale/=2;
        break;
        case 2:
        scale*=2;
    }
    Module.updateCoords(coords,scale);
    coords.delete()
    render()
})
if(initialised)initModule()
else Module.onRuntimeInitialized=initModule
