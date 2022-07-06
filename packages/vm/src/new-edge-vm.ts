import type { Primitives } from '@edge-runtime/primitives'
import type { VMOptions } from './vm'
import { requireWithCache } from './require'
import { VM } from './vm'

export class EdgeVM<T extends Primitives> extends VM<T> {
  constructor(options: VMOptions<T> = {}) {
    super(options)

    // TODO Add this file from a polyfill
    // This is not going to work right now
    // Use https://github.com/inexorabletash/text-encoding
    const encodeInVM = requireWithCache({
      context: this.context,
      cache: new Map(),
      path: require.resolve(
        '../../primitives/src/polyfills/encoding'
      ),
    })

    this.context.TextEncoder = TextEncoder
    this.context.TextDecoder = TextDecoder

    const webStreamsInVm = requireWithCache({
      cache: new Map(),
      context: this.context,
      path: require.resolve(
        '../../primitives/src/polyfills/web-streams'
      ),
    })

    this.context.ReadableStream = webStreamsInVm.ReadableStream
    this.context.ReadableStreamBYOBReader = webStreamsInVm.ReadableStreamBYOBReader
    this.context.ReadableStreamDefaultReader = webStreamsInVm.ReadableStreamDefaultReader
    this.context.TransformStream = webStreamsInVm.TransformStream
    this.context.WritableStream = webStreamsInVm.WritableStream
    this.context.WritableStreamDefaultWriter = webStreamsInVm.WritableStreamDefaultWriter

    const abortInVm = requireWithCache({
      context: this.context,
      cache: new Map([]),
      path: require.resolve('../../primitives/src/polyfills/abort-controller'),
    })

    this.context.AbortController = abortInVm.AbortController
    this.context.AbortSignal = abortInVm.AbortSignal

    // const consoleInVm = requireWithCache({
    //   context: this.context,
    //   cache: new Map(),
    //   path: require.resolve('../../primitives/src/polyfills/console'),
    // })

    this.context.console = require('../../primitives/src/polyfills/console')

    // let httpInVm
    // let httpInVm = requireWithCache({
    //   context: this.context,
    //   cache: new Map([['http', { exports: require('http') }]]),
    //   path: require.resolve('../../primitives/src/polyfills/http'),
    // })

    // httpInVm = require('http')

    // const self = {}
    // requireWithCache({
    //   context: this.context,
    //   cache: new Map(),
    //   path: require.resolve('../../primitives/src/polyfills/url'),
    //   scopedContext: {
    //     global: self
    //   }
    // })

    // TODO Use a polyfill
    const url = require('url');
    this.context.URL = url.URL
    this.context.URLSearchParams = url.URLSearchParams

    const bufferInVm = requireWithCache({
      context: this.context,
      cache: new Map([
        ['web-streams-polyfill', { exports: webStreamsInVm }],
        ['buffer', { exports: require('buffer') }],
        ['util', {
          exports: {
            deprecate: () => {},
            inspect: { custom: Symbol.for('edge-runtime.inspect.custom') },
          },
        }],
      ]),
      path: require.resolve('../../primitives/src/polyfills/buffer'),
    })

    this.context.Blob = bufferInVm.Blob
    this.context.atob = bufferInVm.atob
    this.context.btoa = bufferInVm.btoa

    // Timers
    this.context.clearInterval = clearInterval
    this.context.clearTimeout = clearTimeout
    this.context.setInterval = setInterval
    this.context.setTimeout = setTimeout

    const undici = requireWithCache({
      context: this.context,
      cache: new Map([
        ['abort-controller', { exports: abortInVm }],
        ['assert', { exports: require('assert') }], // Mock it
        ['diagnostics_channel', { exports: require('diagnostics_channel') }],
        ['buffer', { exports: bufferInVm }],
        ['events', { exports: require('events') }], // EventEmitter
        ['http', { exports: require('../../primitives/src/polyfills/http') }],
        ['net', { exports: require('net') }],
        ['perf_hooks', { exports: require('perf_hooks') }],
        ['stream', { exports: require('stream') }],
        ['stream/web', { exports: webStreamsInVm }],
        ['util', { exports: require('util') }],
        ['util/types', { exports: require('util').types }],
        ['zlib', { exports: require('zlib') }],
        ['tls', { exports: require('tls') }],
      ]),
      path: require.resolve('../../primitives/src/polyfills/undici'),
      scopedContext: {
        global: {
          AbortController: abortInVm.AbortController,
          AbortSignal: abortInVm.AbortSignal,
          FinalizationRegistry: function () { return ({ register: () => {} }) },
        },
        queueMicrotask: queueMicrotask,
        Buffer: bufferInVm.Buffer,
        process: {
          env: {  },
          versions: {
            node: '12.0.0',
          }
        }
      }
    })

    this.context.fetch = undici.fetch
    this.context.File = undici.File
    this.context.FormData = undici.FormData
    this.context.Headers = undici.Headers
    this.context.Request = undici.Request
    this.context.Response = undici.Response
  }
}
