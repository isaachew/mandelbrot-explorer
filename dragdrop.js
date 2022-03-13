function addDrag(el,startCall,dragCall,endCall){
    el.addEventListener("pointerdown",a=>{//
        console.log("dragstart")
        startCall(a)
        function moveHandler(a){
            dragCall(a)
        }
        function upHandler(a){
            endCall(a)
            document.removeEventListener("pointermove",moveHandler)
            document.removeEventListener("pointerup",upHandler)
        }
        document.addEventListener("pointermove",moveHandler)
        document.addEventListener("pointerup",upHandler)
    })
}
