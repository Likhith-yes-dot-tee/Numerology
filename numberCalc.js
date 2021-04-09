
function repeatedSum(num) {
    if (num>9) {
     lnum = num.toString().split('').map(x=>+x)
     num = lnum[0]+lnum[1]
      return repeatedSum(num)
    }else{
      return num
    }
  }

// var date = '17-04-1999'

exports.spliter = function (date) {
  numl = date.split('-').join('').split('').map(x=>+x)
  return numl
}


exports.calcNumbers = function (list) {
    var a = repeatedSum(list[0]+list[1]),
        b = repeatedSum(list[2]+list[3]),
        c = repeatedSum(list[4]+list[5]),
        d = repeatedSum(list[6]+list[7]),
        e = repeatedSum(a+b),
        f = repeatedSum(c+d),
        g = repeatedSum(e+a),
        h = repeatedSum(e+b),
        i = repeatedSum(e+f),
        j = repeatedSum(f+c),
        k = repeatedSum(f+d),
        l = repeatedSum(g+h),
        m = repeatedSum(j+k),
        n = repeatedSum(l+m),
        o = repeatedSum(n+m),
        p = repeatedSum(n+l),
        q = repeatedSum(o+p)

        return finalList = [a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q]
    
}


// console.log(finalList);

// export {spliter,finalList}

//   a---b---c---d
//    \ /     \ /
//     e       f
//      \     /
//       \   / 
// g   h   i   j   k
//  \ /         \ /
//   l           m 
//    \         /
//     \       /
//      \     /
//       \   / 
//         n  
//        / \ 
//       o   p 
//        \ /
//         q