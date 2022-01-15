#include <complex>
#include <emscripten/bind.h>
/*
compile with:
emcc mandelbrot.cpp --bind -ffast-math -o mandelbrot.js
 */

int maxiters=1000;
int width=600;
int height=600;

int* results;

int numits(std::complex<double> c){
    std::complex<double> z=0;
    for(int i=0;i<maxiters;i++){
        if(norm(z)>4)return i;
        z*=z;
        z+=c;
    }
    return -1;
}


int getres(){
    return (int)results;
}

int init(int wid,int hei){
    width=wid;
    height=hei;
    results=new int[width*height];

    return 0;
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

    emscripten::function("getResultArray",&getres);

    emscripten::function("numits",&numits);
}
