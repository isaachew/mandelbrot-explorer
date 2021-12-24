#include <complex>
#include <emscripten/bind.h>
/*
compile with:
emcc mandelbrot.cpp --bind -ffast-math -o mandelbrot.js
 */




EMSCRIPTEN_BINDINGS(cmplx){
    emscripten::class_<std::complex<double>> cmplx("complex");//will be complex in JavaScript
    cmplx.constructor<>();
    cmplx.constructor<double,double>();
    cmplx.property("real",emscripten::select_overload<double()const>(&std::complex<double>::real));
    cmplx.property("imag",emscripten::select_overload<double()const>(&std::complex<double>::imag));
    
}
