export default async function(time = 1000) {
  await new Promise(r => setTimeout(r, time));
}