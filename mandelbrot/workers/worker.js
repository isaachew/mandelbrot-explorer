var notify=()=>{}
var dims={cx:0,cy:0,depth:1,width:800,height:600}
var curval=null
onmessage=function(mess){
    //console.log(mess)
    if(mess.data.type==1){
        curval=mess.data
        notify()
    }else{
        Object.assign(dims,mess.data.update)
    }
}

async function wait(){
    await new Promise(res=>{notify=res})
    notify=()=>{}
}
function getcoords(x,y){
    return [(x-dims.width/2)/dims.width*dims.depth+dims.cx,(y-dims.height/2)/dims.width*dims.depth+dims.cy]
}

function numits(cx,cy){
    var zx=0,zy=0
    for(var j=0;j<1000;j++){
        var zxs=zx*zx,zys=zy*zy
        if(zxs+zys>4)return j
        zy=2*zx*zy+cy
        zx=zxs-zys+cx
    }
    return -1
}

(async()=>{
    while(1){
        await wait()
        //console.log("notified")
        var row=new Array(dims.width)
        for(var i=0;i<dims.width;i++){
            row[i]=numits(...getcoords(i,curval.row))
        }
        postMessage({row:curval.row,data:row})
    }
})()
