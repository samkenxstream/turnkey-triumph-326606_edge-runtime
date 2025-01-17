import type { Context as VMContext, CreateContextOptions } from 'vm'
import type { Dictionary, ExtendedDictionary } from './types'
import { createContext, runInContext } from 'vm'
import { createRequire } from './require'
import { tempFile } from './temp-file'

export interface VMOptions<T> {
  /**
   * Provide code generation options to the Node.js VM.
   * If you don't provide any option, code generation will be disabled.
   */
  codeGeneration?: CreateContextOptions['codeGeneration']
  /**
   * Allows to extend the VMContext. Note that it must return a contextified
   * object so ideally it should return the same reference it receives.
   */
  extend?: (context: VMContext) => ExtendedDictionary<T>
  /**
   * Provides an initial map to the require cache.
   * If none is given, it will be initialized to an empty map.
   */
  requireCache?: Map<string, Dictionary>
}

/**
 * A raw VM with a context that can be extended on instantiation. Implements
 * a realm-like interface where one can evaluate code or require CommonJS
 * modules in multiple ways.
 */
export class VM<T extends Dictionary> {
  private readonly requireFn: (referrer: string, specifier: string) => any
  public readonly requireCache: Map<string, Dictionary>
  public readonly context: ExtendedDictionary<T>

  constructor(options: VMOptions<T> = {}) {
    const context = createContext(
      {},
      {
        name: 'Edge Runtime',
        codeGeneration: options.codeGeneration ?? {
          strings: false,
          wasm: false,
        },
      }
    ) as ExtendedDictionary<T>

    this.requireCache = options.requireCache ?? new Map()
    this.context = options.extend?.(context) ?? context
    this.requireFn = createRequire(this.context, this.requireCache)
  }

  /**
   * Allows to run arbitrary code within the VM.
   */
  evaluate<T = any>(code: string): T {
    return runInContext(code, this.context)
  }

  /**
   * Allows to require a CommonJS module referenced in the provided file
   * path within the VM context. It will return its exports.
   */
  require<T extends Dictionary = any>(filepath: string): T {
    return this.requireFn(filepath, filepath)
  }

  /**
   * Same as `require` but it will copy each of the exports in the context
   * of the vm. Then exports can be used inside of the vm with an
   * evaluated script.
   */
  requireInContext<T extends Dictionary = any>(filepath: string): void {
    const moduleLoaded = this.require<T>(filepath)
    for (const [key, value] of Object.entries(moduleLoaded)) {
      this.context[key as keyof typeof this.context] = value
    }
  }

  /**
   * Same as `requireInContext` but allows to pass the code instead of a
   * reference to a file. It will create a temporary file and then load
   * it in the VM Context.
   */
  requireInlineInContext(code: string): void {
    const file = tempFile(code)
    this.requireInContext(file.path)
    file.remove()
  }
}
