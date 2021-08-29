export async function asyncSetState(state) {
  return new Promise(resolve => {
    this.setState(state, resolve);
  })
}
