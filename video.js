var animStops=[0]

var selStop2=0

var animVis=document.getElementById("animVisual")
var visWidth=+animVis.width
var visHeight=+animVis.height
var animContext=animVis.getContext("2d")

function addAnimStop(){
    let inp=document.createElement("div")
    inp.classList.add("animStop")
    inp.id="animStop"+animStops.length
    let animNum=animStops.length

    inp.style.left=700*(1-1/(animNum+1))+"px"
    animStops.push(0)
    inp.addEventListener("click",e=>{
        selStop2=animNum
    })
    document.getElementById("animStops").append(inp)
}

function updateStuff(){
    animContext.clearRect(0,0,visWidth,visHeight)
    animContext.strokeStyle="#ccc"
    animContext.fillStyle="#ccc"
    animContext.lineWidth=2
    animContext.beginPath()
    animContext.moveTo(0,visHeight-animStops[0])
    for(var i=1;i<animStops.length;i++){
        animContext.lineTo(visWidth*i/(animStops.length-1),visHeight-animStops[i])

    }
    animContext.stroke()
    for(var i=0;i<animStops.length;i++){
        animContext.beginPath()
        animContext.arc(visWidth*i/(animStops.length-1),visHeight-animStops[i],5,0,Math.PI*2,0)
        animContext.fill()
    }

    for(var i=0;i<animStops.length;i++){
        var stopElem=document.getElementById("animStop"+i)
        if(stopElem)stopElem.style.left=i*700/(animStops.length-1)+"px"
        else{

        }
    }
}

document.getElementById("addStop").addEventListener("click",a=>{
    addAnimStop()
    updateStuff()
})
document.getElementById("stopParam").addEventListener("input",a=>{
    animStops[selStop2]=+a.target.value
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
        //Mandelbrot.updateCoords(0.35769030173765176128242160302761476,0.32581824336377923634344710990262683,0.7071**i)
        let totalProgress=i/(duration*vidFPS)
        let lerpProgress=totalProgress*(animStops.length-1)
        let lerpIndex=lerpProgress|0
        lerpProgress%=1
        let lerpResult=animStops[lerpIndex]*(1-lerpProgress)+animStops[lerpIndex+1]*lerpProgress
        palette.time=lerpResult
        //Mandelbrot.updateWorkers({param:lerpResult})
        //Mandelbrot.start()
        //await render()
        draw()
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
