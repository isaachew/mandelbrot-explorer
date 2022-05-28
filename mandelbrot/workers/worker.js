var notify=()=>{}
var dims={cx:0,cy:0,depth:1,width:800,height:600,iters:1000,params:{x:0,y:0},fracType:"mandel"}
var curval=null
onmessage=function(mess){
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

function numits_j(zx,zy){
    var cx=dims.params.x,cy=dims.params.y
    for(var j=0;j<dims.iters;j++){
        var zxs=zx*zx,zys=zy*zy
        if(zxs+zys>4)return j
        zy=2*zx*zy+cy
        zx=zxs-zys+cx
    }
    return -1
}

/**/

function numits_m(cx,cy){
    var zx=0,zy=0
    for(var j=0;j<dims.iters;j++){
        var zxs=zx*zx,zys=zy*zy
        if(zxs+zys>4)return j
        zy=2*zx*zy+cy
        zx=zxs-zys+cx
    }
    return -1
}
/**/
/*
function numits(zx,zy){
    zy=-zy
    var ang=dims.params.angle*Math.PI/180
    for(var j=0;j<dims.iters;j++){
        var zxs=zx*zx,zys=zy*zy
        if(zxs+zys>16)return j
        zx=Math.abs(zx);
        [zx,zy]=[2*(zx-1)*Math.cos(ang/2)**2-zy*Math.sin(ang)+1,(zx-1)*Math.sin(ang)+2*zy*Math.cos(ang/2)**2]
        zy=-zy
    }
    return -1
}
//*/
let fracTypes={
    julia:numits_j,
    mandel:numits_m,
    ifs:(a,b)=>0
};

(async()=>{
    while(1){
        await wait()
        //console.log("notified")
        var row=new Array(dims.width)
        for(var i=0;i<dims.width;i++){
            let fracFun=fracTypes[dims.fracType]
            row[i]=fracFun(...getcoords(i,curval.row))
        }
        postMessage({row:curval.row,data:row})
    }
})()
