if(!window.Mandelbrot)window.Mandelbrot={}
Mandelbrot.cx=0
Mandelbrot.cy=0
Mandelbrot.numits=0
Mandelbrot.depth=1
Mandelbrot.width=800
Mandelbrot.height=600


var data=[]
var proms=[]
var complete=0

var workers=[]
for(var i=0;i<4;i++){
    var wrk=new Worker("mandelbrot/workers/worker.js")
    workers.push(wrk)

    wrk.onmessage=e=>{
        //console.log(e)
        if(proms[e.data.row])proms[e.data.row](e.data.data)
        data[e.data.row]=e.data.data
        if(complete<Mandelbrot.height){
            e.target.postMessage({type:1,row:complete++})
        }
    }
}


Mandelbrot.getCoords=(x,y)=>{
    return [(x-Mandelbrot.width/2)/Mandelbrot.width*Mandelbrot.depth+Mandelbrot.cx,(y-Mandelbrot.height/2)/Mandelbrot.width*Mandelbrot.depth+Mandelbrot.cy]
}

Mandelbrot.updateDims=(a,b)=>{
    Mandelbrot.width=a
    Mandelbrot.height=b
    canvas.width=a
    canvas.height=b
    for(var i=0;i<4;i++){
        workers[i].postMessage({type:0,update:{width:a,height:b}})
    }
}

Mandelbrot.updateCoords=(a,b,c)=>{
    Mandelbrot.cx=a
    Mandelbrot.cy=b
    Mandelbrot.depth=c
    for(var i=0;i<4;i++){
        workers[i].postMessage({type:0,update:{cx:a,cy:b,depth:c}})
    }
}

Mandelbrot.start=a=>{
    for(var i=0;i<4;i++){
        workers[i].postMessage({type:1,row:complete++})
    }
    complete=0
    proms=[]
    data=[]
}
Mandelbrot.calcRow=a=>{
    if(!data[a])return new Promise(r=>proms[a]=r)
    else return data[a]
}
