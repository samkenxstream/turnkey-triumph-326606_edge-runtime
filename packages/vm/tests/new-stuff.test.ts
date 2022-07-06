// pnpm run test ./tests/new-stuff.test.ts

import { EdgeVM } from "../src/new-edge-vm";
// import { EdgeVM as OldVM } from "../src/edge-vm";

it('does stuff', async () => {
  // const e = new EdgeVM();

  const textp = await (new EdgeVM().evaluate(`
    async function foo() {
      const res = await fetch('https://example.com')
      return res.text()
    }

    foo();
  `))

  console.log(textp)
  // console.log(new TextDecoder().decode(await textp))


  expect(true).toEqual(true)
})




it('uses the same builtins in polyfills as in VM', () => {
  expect(new EdgeVM().evaluate(`(new TextEncoder().encode('abc')) instanceof Uint8Array`)).toBe(true)
  expect(new EdgeVM().evaluate(`(new TextEncoder().encode('abc')) instanceof Object`)).toBe(true)
  expect(new EdgeVM().evaluate(`(new Uint8Array()) instanceof Object`)).toBe(true)
})

it('does not alter instanceof for literals and objects', async () => {
  expect(new EdgeVM().evaluate('new Float32Array() instanceof Object')).toBe(true)
  expect(new EdgeVM().evaluate('new Float32Array() instanceof Float32Array')).toBe(true)
  expect(new EdgeVM().evaluate('[] instanceof Array')).toBe(true)
  expect(new EdgeVM().evaluate('new Array() instanceof Array')).toBe(true)
  expect(new EdgeVM().evaluate('/^hello$/gi instanceof RegExp')).toBe(true)
  expect(new EdgeVM().evaluate('new RegExp("^hello$", "gi") instanceof RegExp')).toBe(true)
  expect(new EdgeVM().evaluate('({ foo: "bar" }) instanceof Object')).toBe(true)
  expect(new EdgeVM().evaluate('Object.create({ foo: "bar" }) instanceof Object')).toBe(true)
  expect(new EdgeVM().evaluate('new Object({ foo: "bar" }) instanceof Object')).toBe(true)
  expect(new EdgeVM().evaluate('(() => {}) instanceof Function')).toBe(true)
  expect(new EdgeVM().evaluate('(function () {}) instanceof Function')).toBe(true)
})

describe('contains all required primitives', () => {
  let edgeVM: EdgeVM<any>;

  beforeAll(() => {
    edgeVM = new EdgeVM()
  })

  it.each([
    { api: 'AbortController' },
    { api: 'AbortSignal' },
    { api: 'AggregateError' },
    { api: 'Array' },
    { api: 'ArrayBuffer' },
    { api: 'atob' },
    // { api: 'Atomics' },
    { api: 'BigInt' },
    { api: 'BigInt64Array' },
    { api: 'BigUint64Array' },
    { api: 'Blob' },
    { api: 'Boolean' },
    { api: 'btoa' },
    // { api: 'Cache' },
    // { api: 'caches' },
    // { api: 'CacheStorage' },
    { api: 'clearInterval' },
    { api: 'clearTimeout' },
    { api: 'console' },
    // { api: 'crypto' },
    // { api: 'Crypto' },
    // { api: 'CryptoKey' },
    { api: 'DataView' },
    { api: 'Date' },
    // { api: 'decodeURI' },
    // { api: 'decodeURIComponent' },
    // { api: 'encodeURI' },
    // { api: 'encodeURIComponent' },
    { api: 'Error' },
    { api: 'EvalError' },
    // { api: 'Event' },
    // { api: 'EventTarget' },
    { api: 'fetch' },
    // { api: 'FetchEvent' },
    { api: 'File' },
    { api: 'Float32Array' },
    { api: 'Float64Array' },
    { api: 'FormData' },
    { api: 'Function' },
    // { api: 'globalThis' },
    { api: 'Headers' },
    { api: 'Infinity' },
    { api: 'Int8Array' },
    { api: 'Int16Array' },
    { api: 'Int32Array' },
    // { api: 'Intl' },
    // { api: 'isFinite' },
    { api: 'isNaN' },
    { api: 'JSON' },
    { api: 'Map' },
    { api: 'Math' },
    { api: 'Number' },
    { api: 'Object' },
    { api: 'parseFloat' },
    { api: 'parseInt' },
    { api: 'Promise' },
   //  { api: 'PromiseRejectionEvent' },
    { api: 'Proxy' },
    { api: 'RangeError' },
    { api: 'ReadableStream' },
    { api: 'ReadableStreamBYOBReader' },
    { api: 'ReadableStreamDefaultReader' },
    { api: 'ReferenceError' },
    { api: 'Reflect' },
    { api: 'RegExp' },
    { api: 'Request' },
    { api: 'Response' },
    // { api: 'self' },
    { api: 'Set' },
    { api: 'setInterval' },
    { api: 'setTimeout' },
    { api: 'SharedArrayBuffer' },
    { api: 'String' },
    // { api: 'structuredClone' },
    // { api: 'SubtleCrypto' },
    { api: 'Symbol' },
    { api: 'SyntaxError' },
    { api: 'TextDecoder' },
    { api: 'TextEncoder' },
    { api: 'TransformStream' },
    { api: 'TypeError' },
    { api: 'Uint8Array' },
    { api: 'Uint8ClampedArray' },
    { api: 'Uint16Array' },
    { api: 'Uint32Array' },
    // { api: 'URIError' },
    { api: 'URL' },
    // { api: 'URLPattern' },
    { api: 'URLSearchParams' },
    { api: 'WeakMap' },
    { api: 'WeakSet' },
    { api: 'WebAssembly' },
    { api: 'WritableStream' },
    { api: 'WritableStreamDefaultWriter' },
  ])('$api is defined in global scope', ({ api }) => {
    expect(edgeVM.evaluate(api)).toBeDefined()
  })
})
