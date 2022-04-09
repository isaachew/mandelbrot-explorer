var animStops=[{position:0,param:100},{position:1,param:100}]

var selStop2=0

var animVis=document.getElementById("animVisual")
var visWidth=+animVis.width
var visHeight=+animVis.height
var animCtx=animVis.getContext("2d")

function addAnimStop(pos){
    let animNum=animStops.length
    //inp.style.left=700*(1-0.95**(animNum+1))+"px"
    SortedArray.pushAndSort(animStops,{position:pos,param:100})
    updateHandles2()
}

function updateStuff(){
    animCtx.clearRect(0,0,visWidth,visHeight)
    animCtx.strokeStyle="#ccc"
    animCtx.fillStyle="#ccc"
    animCtx.lineWidth=2
    animCtx.beginPath()
    animCtx.moveTo(0,visHeight-animStops[0].param)
    for(var i=1;i<animStops.length;i++){
        animCtx.lineTo(visWidth*animStops[i].position,visHeight-animStops[i].param)

    }
    animCtx.stroke()
    for(var i=0;i<animStops.length;i++){
        animCtx.beginPath()
        animCtx.arc(visWidth*animStops[i].position,visHeight-animStops[i].param,5,0,Math.PI*2,0)
        animCtx.fill()
    }
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
        },e=>{
            let offset=document.getElementById("animStops").offsetLeft
            var newInd=SortedArray.updatePosition(animStops,selStop2,(e.clientX-offset)/700)
            selStop2=newInd
            updateHandles2()
            updateStuff()
        },a=>{})
        document.getElementById("animStops").append(inp)
    }
}

document.getElementById("animVisual").addEventListener("click",a=>{
    addAnimStop(0.5)
    updateStuff()
})

document.getElementById("addStop").addEventListener("click",a=>{
    addAnimStop(0.5)
    updateStuff()
})
document.getElementById("stopParam").addEventListener("input",a=>{
    animStops[selStop2].param=+a.target.value
    updateStuff()
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
    enc.configure({codec:"vp8",width:width,height:height,bitrate:20000000})
    for(var i=0;i<duration*vidFPS;i++){
        let totalProgress=i/(duration*vidFPS)
        let lerpIndex=animStops.findIndex(a=>a.position>totalProgress)
        let lerpProgress=(totalProgress-animStops[lerpIndex-1].position)/(animStops[lerpIndex].position-animStops[lerpIndex-1].position)
        let lerpResult=animStops[lerpIndex-1].param*(1-lerpProgress)+animStops[lerpIndex].param*lerpProgress
        Mandelbrot.updateWorkers({param:lerpResult/100-1})
        Mandelbrot.start()
        await render()
        context.fillStyle="black"
        context.font="40px Verdana"
        context.fillText("P: "+lerpResult.toFixed(3),0,40)
        var vfr=new VideoFrame(document.getElementById("render"),{timestamp:i*1000000/vidFPS,duration:1000000/vidFPS})
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

updateStuff()
updateHandles2()
