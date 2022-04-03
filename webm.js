function encVarSize(len){
    var blen=len.toString(2).length
    var bibytes=[]
    var nunits=Math.ceil(blen/7)
    if(len==127)nunits++//all bits 1 is interpreted as "unknown", so 127 cannot be encoded as a single byte
    for(var x=len,i=0;i<nunits;i++){
        bibytes.push(x&255)
        x>>=8;
    }
    var bytes=new Uint8Array(nunits)
    for(var i=0;i<nunits;i++){
        bytes[i]=bibytes[bibytes.length-i-1]

    }
    nunits--
    bytes[nunits>>3]|=128>>(nunits&7)
    return bytes
}
function encInteger(integer){
    var bytes=[]
    for(var i=0;integer;i++){
        bytes.push(Number(integer&255))
        if(integer==-1)break
        integer>>=8;
    }
    return new Uint8Array(bytes.reverse())
}
function encIntegerFixed(integer,nBytes){
    var bytes=[]
    for(var i=0;i<nBytes;i++){
        bytes.push(Number(integer&255))
        integer>>=8;
    }
    return new Uint8Array(bytes.reverse())
}
function createBlock(data,timestamp,keyframe=0){
    var nodes=[]

    var trackNumber=encVarSize(1)
    nodes.push(trackNumber)
    nodes.push(encIntegerFixed(timestamp,2))
    nodes.push(encIntegerFixed(keyframe<<7,1))//no lacing, may be keyframe
    var dataBuffer=new Uint8Array(data.byteLength)
    data.copyTo(dataBuffer)
    nodes.push(dataBuffer)

    var dv=new Uint8Array(nodes.reduce((a,b)=>a+b.byteLength,0))
    var ptr=0
    for(var i of nodes){
        dv.set(i,ptr)
        ptr+=i.byteLength
    }
    return dv
}
function generateEBML(frames,{width:videoWidth,height:videoHeight,duration:vidDuration,encoding="V_VP8",encodingName="VP8 (webm)"}){
    if(videoWidth==null)videoWidth=frames[0].width
    if(videoHeight==null)videoWidth=frames[0].height

    var clusters=[]
    var curCluster=null
    var clusterTimestamp=null
    var cuePoints=[]

    //used for cues
    var lastKeyTime=0
    var numBlocks=0

    for(var i=0;i<frames.length;i++){
        let curFrame=frames[i]
        let timestamp=Math.floor(curFrame.timestamp/1000)//timestamp is in microseconds
        if(curCluster==null||timestamp>30000+clusterTimestamp){//create curCluster
            clusterTimestamp=timestamp
            if(curCluster!=null)clusters.push(curCluster)
            curCluster={
                id:0x1F43B675,//Cluster
                content:[
                    {
                        id:0xE7,//Timestamp
                        content:clusterTimestamp
                    }
                ]
            }
            numBlocks=0
        }
        let block={
            id:0xA3,//SimpleBlock
            content:createBlock(curFrame,timestamp-clusterTimestamp,frames[i].type=="key")
        }
        if(frames[i].type=="key"){
            lastKeyTime=timestamp
            cuePoints.push({clusterNum:clusters.length,blockNum:numBlocks,time:timestamp})
        }

        curCluster.content.push(block)
        numBlocks++
    }
    if(curCluster!=null)clusters.push(curCluster)
    var tracksEl={
        id:0x1654AE6B,//Tracks
        content:[
            {
                id:0xAE,//TrackEntry
                content:[
                    {
                        id:0xd7,//TrackNumber
                        content:1
                    },
                    {
                        id:0x73C5,//TrackUID
                        content:1962
                    },
                    {
                        id:0x83,//TrackType
                        content:1
                    },
                    {
                        id:0x9C,//FlagLacing
                        content:0
                    },
                    {
                        id:0x86,//CodecID
                        content:encoding
                    },
                    {
                        id:0x258688,//CodecName
                        content:encodingName
                    },
                    {
                        id:0xE0,//Video
                        content:[
                            {
                                id:0xB0,//PixelWidth
                                content:videoWidth
                            },
                            {
                                id:0xBA,//PixelHeight
                                content:videoHeight
                            }
                        ]
                    }
                ]
            }
        ]
    }

    var segment={
        id:0x18538067,//Segment
        content:[
            {
                id:0x1549A966,//Info
                content:[
                    {
                        id:0x2AD7B1,//TimestampScale
                        content:1000000//milliseconds
                    },{
                        id:0x4489,//Duration
                        content:vidDuration,
                        float:true
                    },{
                        id:0x4D80,//MuxingApp
                        content:"Mandelbrot Explorer"
                    },{
                        id:0x5741,//WritingApp
                        content:"Mandelbrot Explorer"
                    }
                ]
            },
            {
                id:0x114D9B74,//SeekHead
                content:[
                    {
                        id:0x4DBB,//Seek
                        content:[
                            {
                                id:0x53AB,//SeekID
                                content:0x1C53BB6B//Cues
                            },{
                                id:0x53AC,//SeekPosition
                                content:2
                            }
                        ]
                    }
                ]
            },
            {
                id:0x1C53BB6B,//Cues
                content:cuePoints.map(({clusterNum,blockNum,time})=>{
                    return {
                        id:0xBB,//CuePoint
                        content:[
                            {
                                id:0xB3,//CueTime
                                content:time
                            },
                            {
                                id:0xB7,//CueTrackPositions
                                content:[
                                    {
                                        id:0xF7,//CueTrack
                                        content:1
                                    },{
                                        id:0xF1,//CueClusterPosition
                                        content:clusterNum+4
                                    },{
                                        id:0xF0,//CueRelativePosition
                                        content:blockNum+1
                                    }

                                ]
                            }
                        ]
                    }
                })
            },
            tracksEl,
            ...clusters
        ]
    }
    var rootEl=[
        {
            id:0x1a45dfa3,//EBML
            content:[
                {
                    id:0x4286,//EBMLVersion
                    content:1
                },{
                    id:0x42f7,
                    content:1//EBMLReadVersion
                },{
                    id:0x42f2,
                    content:4//EBMLMaxIDLength
                },{
                    id:0x42f3,
                    content:8//EBMLMaxSizeLength
                },{
                    id:0x4282,
                    content:"webm"//DocType
                },{
                    id:0x4287,
                    content:2//DocTypeVersion
                },{
                    id:0x4285,
                    content:2//DocTypeReadVersion
                }
            ]
        },
        segment
    ]

    return rootEl
}
/*
Encodes an EBML element into an array of buffers.
*/
function ebmlToBuffers(elem){
    var dataLength=0
    var dataBuffers=[]
    if(elem.content.constructor==Array){
        for(let i of elem.content){
            let curArray=ebmlToBuffers(i)
            dataLength+=curArray.byteLength
            dataBuffers.push(...curArray)
        }
    }else if(elem.content.constructor==Number){
        if(elem.float){
            let buf=new ArrayBuffer(8)
            let dv=new DataView(buf)
            dv.setFloat64(0,elem.content,false)
            dataBuffers.push(new Uint8Array(buf))
            dataLength=8
        }else{
            let encoded=encInteger(elem.content)
            dataBuffers.push(encoded)
            dataLength=encoded.length
        }
    }else if(elem.content.constructor==String){
        let encoded=new Uint8Array(elem.content.length)
        for(let i=0;i<elem.content.length;i++){
            encoded[i]=elem.content.charCodeAt(i)
        }
        dataBuffers.push(encoded)
        dataLength=encoded.length
    }else if(elem.content.constructor==Uint8Array){
        dataBuffers.push(elem.content)
        dataLength=elem.content.length
    }
    var ebmlId=encInteger(elem.id)
    var elemLength=encVarSize(dataLength)
    var bufferData=[ebmlId,elemLength,...dataBuffers]
    bufferData.byteLength=dataLength+ebmlId.byteLength+elemLength.byteLength
    return bufferData

}
/*
Generates a Blob (webm file) from a set of frames.
*/
function muxIntoBlob(frames,options){
    var ebml=generateEBML(frames,options)
    return new Blob(ebml.flatMap(ebmlToBuffers),{type:"video/webm"})
}
