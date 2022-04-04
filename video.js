var animStops=[0,0,85,85,170,170,0,170,42,42,128,128,224,224,0,0]

var selStop2=0

function addAnimStop(){
    let inp=document.createElement("input")
    inp.type="number"
    inp.id="animStop"+animStops.length
    let animNum=animStops.length
    inp.addEventListener("input",e=>{
        animStops[1]=1
    })
    document.getElementById("animStops").append(inp)

}

var vidChunks=[]
var fps=30
async function record(){
    //var startParam=+document.getElementById("startParam").value
    //var endParam=+document.getElementById("endParam").value
    var duration=+document.getElementById("vidDuration").value
    var enc=new VideoEncoder({
        output(a,b){
            vidChunks.push(a)
        },
        error:console.log
    })

    Mandelbrot.start()
    await render()
    enc.configure({codec:"vp8",width:width,height:height,bitrate:20000000})
    for(var i=0;i<duration*fps;i++){
        //Mandelbrot.updateCoords(0.35769030173765176128242160302761476,0.32581824336377923634344710990262683,0.7071**i)
        let totalProgress=i/(duration*fps)
        let lerpProgress=totalProgress*(animStops.length-1)
        let lerpIndex=lerpProgress|0
        lerpProgress%=1
        let lerpResult=animStops[lerpIndex]*(1-lerpProgress)+animStops[lerpIndex+1]*lerpProgress
        palette.time=lerpResult
        await render()
        context.fillStyle="black"
        context.font="40px Verdana"
        context.fillText("P: "+lerpResult.toFixed(3),0,40)
        //if(i%50==0)await new Promise(a=>setTimeout(a,20))
        var vfr=new VideoFrame(document.getElementById("render"),{timestamp:i*1000000/30,duration:1000/60})
        enc.encode(vfr,{keyFrame:(i%50==0)})
        vfr.close()
    }

    await enc.flush()
    console.log("done encoding")
    console.log("creating blob")


    enc.close()
    var vidBlob=muxIntoBlob(vidChunks,{duration:duration*1000,encoding:"V_VP8",encodingName:"vp9 (webm, again)",width,height})
    download(vidBlob,"video.webm")

}
