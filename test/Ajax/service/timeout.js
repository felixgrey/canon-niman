const sleep = async (time) => new Promise(resolve => setTimeout(resolve, time));

module.exports = async function (reqData) {
  await sleep(1000);
  return reqData;
}