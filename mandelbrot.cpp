#include <complex>
#include <emscripten/bind.h>
/*
compile with:
emcc mandelbrot.cpp --bind -ffast-math -o mandelbrot.js
 */

int maxiters=1000;
int width=600;
int height=600;

double zoom=4;
std::complex<double> center(0,0);

int* img;
int* results;
/*
int numits(std::complex<double> c){
    std::complex<double> z=0;
    for(int i=0;i<maxiters;i++){
        if(norm(z)>4)return i;
        z*=z;
        z+=c;
    }
    return -1;
}
/*/
int numits(std::complex<double> c){
    double zx=0,zy=0;
    for(int i=0;i<maxiters;i++){
        double zxs=zx*zx,zys=zy*zy;
        if(zxs+zys>4)return i;
        zy=2*zx*zy+c.imag();
        zx=zxs-zys+c.real();
    }
    return -1;
}
//*/
std::complex<double> getcoords(int x,int y){
    double xoff=(x-width*.5)/width;
    double yoff=(y-height*.5)/width;
    std::complex<double> reloff=std::complex<double>(xoff*zoom,yoff*zoom);
    return reloff+center;
}

void updcoords(std::complex<double> ncenter,double depth){
    center=ncenter;
    zoom=depth;
    for(int i=0;i<width*height;i++){
        results[i]=0;
    }
}

unsigned int getcol(int result){
    if(result==-1)return 255<<24;
    unsigned char r=255;
    unsigned char g=result&128?~(result<<1):result<<1;
    unsigned char b=0;
    return r|(g<<8)|(b<<16)|(255<<24);
}

void putpixel(int x,int y,int result){
    results[y*width+x]=result;
    img[y*width+x]=getcol(result);
}

int calcpixel(int x,int y,bool usecache){
    if(usecache){
        int cached=results[y*width+x];
        if(cached)return cached;
    }
    int res=numits(getcoords(x,y));
    putpixel(x,y,res);
    return res;
}

void drawrow(int y,bool usecache){
    for(int i=0;i<width;i++){
        calcpixel(i,y,1);
    }
}

int getpixel(int x,int y,bool fill=0){
    return results[y*width+x];
}

int getimg(){
    return (int)img;
}

void init(int wid,int hei){
    width=wid;
    height=hei;
    results=new int[width*height];
    img=new int[width*height];
}

EMSCRIPTEN_BINDINGS(cmplx){
    emscripten::class_<std::complex<double>> cmplx("complex");//will be complex in JavaScript
    cmplx.constructor<>();
    cmplx.constructor<double,double>();
    cmplx.property("real",emscripten::select_overload<double()const>(&std::complex<double>::real));
    cmplx.property("imag",emscripten::select_overload<double()const>(&std::complex<double>::imag));
}
EMSCRIPTEN_BINDINGS(mandelbrot){
    emscripten::function("init",&init);

    emscripten::function("getImgArray",&getimg);
    emscripten::function("getCoords",&getcoords);
    emscripten::function("getFromPalette",&getcol);
    emscripten::function("calcPixel",&calcpixel);
    emscripten::function("calcRow",&drawrow);

    emscripten::function("updateCoords",&updcoords);

    emscripten::function("numits",&numits);
}
