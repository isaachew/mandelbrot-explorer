var SortedArray={
    pushAndSort(arr,val){
        var pos=val.position
        var ind=SortedArray.indexAfter(arr,pos)
        arr.splice(ind,0,val)
        return ind
    },
    updatePosition(arr,index,pos){
        var later=pos>arr[index].position
        var newInd=SortedArray.indexAfter(arr,pos)
        if(later)newInd-=arr[newInd-1].position==pos
        newInd-=later//the moved position is counted and needs to be subtracted
        arr[index].position=pos
        if(newInd!=index){//splice only if another index is required
            var oldEl=arr.splice(index,1).pop()
            arr.splice(newInd,0,oldEl)
        }
        return newInd
    },
    indexAfter(arr,pos){//Binary search. Finds the least index after or at the position.
        if(pos<arr[0].position)return 0
        let min=0,max=arr.length
        while(min+1<max){
            let mid=Math.floor((min+max)/2)
            if(pos<arr[mid].position){
                max=mid
            }else if(pos>arr[mid].position){
                min=mid
            }else{
                return mid
            }
        }
        return max
    },
    indexBefore(arr,pos){//Binary search. Finds the closest index before or at the position.
        if(pos<arr[0].position)return 0
        let min=0,max=arr.length
        while(min+1<max){
            let mid=Math.floor((min+max)/2)
            if(pos<arr[mid].position){
                max=mid
            }else if(pos>arr[mid].position){
                min=mid
            }else{
                return mid
            }
        }
        return min
    }
}
