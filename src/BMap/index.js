// https://api.map.baidu.com/api?v=1.0&type=webgl&ak=您的密钥

async function importBMap(isGl = false) {
  const theGlobal = window;
  const ak = importBMap.AK;

  if (!isGl && theGlobal.BMap) {
    return theGlobal.BMap;
  }

  if (isGl && theGlobal.BMapGL) {
    return theGlobal.BMapGL;
  }
  
  if (!importBMap.AK) {
    return Promise.reject('must set importBMap.AK first');
  }

  const callbackName = 'bMap_' + (Math.random() * 10 ^ 18);

  let nextResolve = null;
  const nextPromise = new Promise(resolve => nextResolve = resolve);

  const script = document.createElement('script');
  theGlobal[callbackName] = function() {
    document.body.removeChild(script);
    delete theGlobal[callbackName];

    if (isGl) {
      theGlobal.BMapGL.isGl = true;
      nextResolve(theGlobal.BMapGL);
    } else {
      theGlobal.BMap.isGl = false;
      nextResolve(theGlobal.BMap);
    }
  }

  const searchParams = new URLSearchParams();
  searchParams.append('ak', ak);
  searchParams.append('callback', callbackName);
  if (isGl) {
    searchParams.append('type', 'webgl');
    searchParams.append('v', '1.0');
  } else {
    searchParams.append('v', '3.0');
  }

  script.src = `${theGlobal.location.protocol}//api.map.baidu.com/api?${searchParams}`;
  document.body.appendChild(script);

  return nextPromise;
}

importBMap.AK = null;
importBMap.AK = '3zq2c5fIT48YHlvVGVd8ShkBqF8LafPW';
export default importBMap;
