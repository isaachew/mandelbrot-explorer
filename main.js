let canvas=document.getElementById("render")
let context=canvas.getContext("2d")
let width=canvas.width
let height=canvas.height
let scale=4
let cx=-1,cy=0
let idata=context.createImageData(width,height)
Module.onRuntimeInitialized=()=>{
    Module.init(width,height)
    console.log("wasm loaded")
    console.time("mandelbrot")
    var i=0
    for(var y=0;y<height;y++){
        for(var x=0;x<width;x++){
            let xoff=(x-width/2)/width
            let yoff=(y-height/2)/width
            let cmplx=new Module.complex(xoff*scale+cx,yoff*scale+cy)
            let result=Module.numits(cmplx)
            cmplx.delete()
            idata.data[i++]=result==-1||255
            idata.data[i++]=result*3
            idata.data[i++]=0
            idata.data[i++]=255

            //context.fillStyle="rgb(0,162,255)"
            //if(result>10)context.fillRect(x,y,1,1)
        }
    }
    console.log("put img data")
    context.putImageData(idata,0,0)
    console.timeEnd("mandelbrot")
}
