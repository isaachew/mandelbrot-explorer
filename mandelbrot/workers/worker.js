var notify=()=>{}
var cx=0,cy=0,depth=1
var curval=null
onmessage=function(mess){
    //console.log(mess)
    if(mess.data.type==1){
        curval=mess.data
        notify()
    }else{
        [cx,cy,depth]=[mess.data.cx,mess.data.cy,mess.data.depth]
    }
}

async function wait(){
    await new Promise(res=>{notify=res})
    notify=()=>{}
}
function getcoords(x,y){
    return [(x-400)/800*depth+cx,(y-300)/800*depth+cy]
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
        var row=new Array(800)
        for(var i=0;i<800;i++){
            row[i]=numits(...getcoords(i,curval.row))
        }
        postMessage({row:curval.row,data:row})
    }
})()
