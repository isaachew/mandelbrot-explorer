let canvas=document.getElementById("render")
let context=canvas.getContext("2d")

let width=canvas.width,height=canvas.height
let scale=4
let cx=-1,cy=0
let idata=context.createImageData(width,height)


var resPtr=null,resultsArray=null

async function render(){
    var start,pnow,nnow
    start=pnow=performance.now()

    var lrow=0
    for(var y=0;y<height;y++){
        Module.calcRow(y,1)


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
    }

    idata.data.set(resultsArray,0)
    context.putImageData(idata,0,0)
    console.log("put img data")
    nnow=performance.now()
    console.log("render in "+1e-3*(nnow-start)+" s")
}

function initModule(){

    console.log("wasm + webpage loaded")
    Module.init(width,height)

    resPtr=Module.getImgArray()
    resultsArray=Module.HEAPU8.subarray(resPtr,resPtr+width*height*4)
    render()
}
document.getElementById("render").addEventListener("contextmenu",e=>{
    e.preventDefault()
})
document.getElementById("render").addEventListener("mousedown",e=>{
    var coords=Module.getCoords(e.offsetX,e.offsetY)
    switch(e.button){
        case 0:
        scale/=2
        break;
        case 2:
        scale*=2
    }
    Module.updateCoords(coords,scale)
    coords.delete()
    render()
})
document.getElementById("render").addEventListener("keydown",e=>{
    var coords=Module.getCoords(450,450)
    scale*=.01
    Module.updateCoords(coords,scale)
    coords.delete()
    render()
    e.preventDefault()
})
if(initialised)initModule()
else Module.onRuntimeInitialized=initModule
