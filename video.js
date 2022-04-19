var animation={x:[{position:0,param:0},{position:1,param:0}],y:[{position:0,param:0},{position:1,param:0}]}
var animProps=["x","y"]

var animStops=animation.x

var selStop2=0

var animVis=document.getElementById("animVisual")
var visWidth=+animVis.width
var visHeight=+animVis.height
var animCtx=animVis.getContext("2d")

function addAnimStop(pos){
    //inp.style.left=700*(1-0.95**(animNum+1))+"px"
    SortedArray.pushAndSort(animStops,{position:pos,param:100})
    updateHandles2()
}

function updateView(){
    animCtx.clearRect(0,0,visWidth,visHeight)
    animCtx.strokeStyle="#ccc"
    animCtx.fillStyle="#ccc"
    animCtx.lineWidth=2
    animCtx.beginPath()
    for(var i=0;i<animStops.length;i++){
        animCtx.lineTo(visWidth*animStops[i].position,visHeight/2-animStops[i].param*50)

    }
    animCtx.stroke()
    for(var i=0;i<animStops.length;i++){
        animCtx.beginPath()
        animCtx.arc(visWidth*animStops[i].position,visHeight/2-animStops[i].param*50,5,0,Math.PI*2,0)
        animCtx.fill()
    }
}

function lerpArray(array,position){
    let lerpIndex=SortedArray.indexAfter(array,position)
    let lerpProgress=(position-array[lerpIndex-1].position)/(array[lerpIndex].position-array[lerpIndex-1].position)
    let lerpResult=array[lerpIndex-1].param*(1-lerpProgress)+array[lerpIndex].param*lerpProgress
    return lerpResult
}

function updateHandles2(){
    document.getElementById("animStops").innerHTML=""
    for(let i=0;i<animStops.length;i++){
        let inp=document.createElement("div")
        inp.classList.add("animStop")
        inp.id="animStop"+animStops.length

        inp.style.left=animStops[i].position*700+"px"
        addDrag(inp,a=>{
            selStop2=i
            document.getElementById("stopParam").value=animStops[i].param
        },e=>{
            let offset=document.getElementById("animStops").offsetLeft
            var newInd=SortedArray.updatePosition(animStops,selStop2,(e.clientX-offset)/700)
            selStop2=newInd
            updateHandles2()
            updateView()
        },a=>{})
        document.getElementById("animStops").append(inp)
    }
}

document.getElementById("animVisual").addEventListener("dblclick",a=>{
    SortedArray.pushAndSort(animStops,{position:a.offsetX/700,param:(50-a.offsetY)/25})
    updateView()
    updateHandles2()
})

document.getElementById("animVisual").addEventListener("click",a=>{
    let totalProgress=a.offsetX/700
    var params={}
    for(let i of animProps){
        params[i]=lerpArray(animation[i],totalProgress)
    }
    console.log(params)
    Mandelbrot.updateWorkers({params})
    Mandelbrot.start()
    render()
})

document.getElementById("addStop").addEventListener("click",a=>{
    addAnimStop(0.5)
    updateView()
})
document.getElementById("stopParam").addEventListener("input",a=>{
    animStops[selStop2].param=+a.target.value
    updateView()
})
document.getElementById("paramSelect").addEventListener("input",a=>{
    if(~animProps.indexOf(a.target.value))animStops=animation[a.target.value]
    updateHandles2()
    updateView()
})


var vidChunks=[]
async function record(){
    vidChunks=[]
    //var startParam=+document.getElementById("startParam").value
    //var endParam=+document.getElementById("endParam").value
    var duration=+document.getElementById("vidDuration").value
    var vidFPS=+document.getElementById("vidFPS").value
    var enc=new VideoEncoder({
        output(a,b){
            vidChunks.push(a)
        },
        error:console.log
    })

    Mandelbrot.start()
    await render()
    enc.configure({codec:"vp8",width:width,height:height,bitrate:40000000})
    let targetDepth=Mandelbrot.depth

    let keyframe=null
    let keyframeDepth=44444
    for(var i=0;i<duration*vidFPS;i++){
        let totalProgress=i/(duration*vidFPS)
        let newDepth=4*(targetDepth/4)**totalProgress
        var params={}
        for(let i of animProps){
            params[i]=lerpArray(animation[i],totalProgress)
        }
        let paramsChanged=0
        let newFrame
        if(paramsChanged){//keyframe needs to be rerendered
            Mandelbrot.updateWorkers({params})
            Mandelbrot.start()
            await render()
            newFrame=context.getImageData(0,0,width,height)
        }else if(keyframeDepth>newDepth*2){
            keyframeDepth=newDepth
            Mandelbrot.updateCoords(Mandelbrot.cx,Mandelbrot.cy,newDepth)
            Mandelbrot.start()
            await render()
            newFrame=context.getImageData(0,0,width,height)
        }else{
            console.log("scale option")
            let keyframeData=context.getImageData(0,0,width,height)
            let keyframeArr=new Uint32Array(keyframeData.data.buffer)
            newFrame=context.createImageData(width,height)
            let newFrameArr=new Uint32Array(newFrame.data.buffer)
            for(var y=0;y<height;y++){
                for(var x=0;x<width;x++){
                    var index=y*width+x
                    var scaledX=Math.round((x-width/2)*(newDepth/keyframeDepth)+width/2)
                    var scaledY=Math.round((y-height/2)*(newDepth/keyframeDepth)+height/2)
                    var scaledIndex=scaledY*width+scaledX
                    newFrameArr[index]=keyframeArr[scaledIndex]
                }
            }
        }
        let bitmap=await createImageBitmap(newFrame)
        var vfr=new VideoFrame(bitmap,{timestamp:i*1000000/vidFPS,duration:1000000/vidFPS})
        enc.encode(vfr,{keyFrame:(i%50==0)})
        vfr.close()
    }

    await enc.flush()
    console.log("done encoding")
    console.log("creating blob")


    enc.close()
    var vidBlob=muxIntoBlob(vidChunks,{duration:duration*1000,encoding:"V_VP8",encodingName:"vp8 (webm)",width,height})
    download(vidBlob,"video.webm")

}

updateView()
updateHandles2()
