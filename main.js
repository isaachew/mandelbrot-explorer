let canvas=document.getElementById("render")
let context=canvas.getContext("2d")

let width=canvas.width,height=canvas.height
let scale=4
let cx=-1,cy=0
let idata=context.createImageData(width,height)


var resPtr=null,resultsArray=null

function initModule(){
    Module.init(width,height)

    resPtr=Module.getImgArray()
    resultsArray=Module.HEAPU8.subarray(resPtr,resPtr+width*height*4)
    console.log("wasm loaded")
    console.time("mandelbrot")
    var colarr=new Uint32Array(idata.data.buffer)
    for(var y=0;y<height;y++){
        for(var x=0;x<width;x++){
            Module.calcPixel(x,y)
        }
    }
    console.log("put img data")
    idata.data.set(resultsArray,0)
    context.putImageData(idata,0,0)
    console.timeEnd("mandelbrot")
}
if(initialised)initModule()
else Module.onRuntimeInitialized=initModule
