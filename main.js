Module.onRuntimeInitialized=()=>{
    let canvas=document.getElementById("render")
    let context=canvas.getContext("2d")
    let width=canvas.width
    let height=canvas.height
    let idata=context.createImageData(width,height)
    for(var x=0;x<width;x++){
        for(var y=0;y<height;y++){
            let xoff=(x-width/2)/width
            let yoff=(y-height/2)/width
            let cmplx=new Module.complex(xoff*4,yoff*4)
            let result=Module.numits(cmplx)
            cmplx.delete()
            idata.data[4*(x+y*width)]=result==-1||255
            idata.data[4*(x+y*width)+1]=result*3
            idata.data[4*(x+y*width)+2]=0
            idata.data[4*(x+y*width)+3]=255

            //context.fillStyle="rgb(0,162,255)"
            //if(result>10)context.fillRect(x,y,1,1)
        }
    }
    context.putImageData(idata,0,0)
    console.log("done")
}
