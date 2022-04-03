var vidChunks=[]
async function record(){
    var startParam=+document.getElementById("startParam").value
    var endParam=+document.getElementById("endParam").value
    var duration=+document.getElementById("vidDuration").value
    var totLength=0
    var enc=new VideoEncoder({
        output(a,b){
            vidChunks.push(a)
            let ab=new Uint8Array(b.description)
            let x=ab.map(a=>a.toString(16).padStart(2,0)).join` `
            totLength+=a.byteLength
        },
        error:console.log
    })

    Mandelbrot.start()
    await render()
    enc.configure({codec:"vp9",width:width,height:height,bitrate:20000000})
    for(var i=0;i<duration*30;i++){
        //Mandelbrot.updateCoords(0.35769030173765176128242160302761476,0.32581824336377923634344710990262683,0.7071**i)
        let totalProgress=i/(duration*30)
        let lerpProgress=totalProgress*(animStops.length-1)
        let lerpIndex=lerpProgress|0
        lerpProgress%=1
        palette.time=(animStops[lerpIndex]*(1-lerpProgress)+animStops[lerpIndex+1]*lerpProgress)
        draw()
        context.fillStyle="black"
        context.font="40px Verdana"
        context.fillText("P: "+(palette.time).toFixed(3),0,40)
        if(i%50==0)await new Promise(a=>setTimeout(a,20))
        var vfr=new VideoFrame(document.getElementById("render"),{timestamp:i*1000000/30,duration:1000/60})
        enc.encode(vfr,{keyFrame:(i%50==0)})
        vfr.close()
    }

    await enc.flush()
    console.log("done encoding")
    console.log("creating blob")


    enc.close()
    var vidBlob=muxIntoBlob(vidChunks,{duration:duration*1000,encoding:"V_VP9",encodingName:"vp9 (webm, again)",width,height})
    download(vidBlob,"video.webm")

}
