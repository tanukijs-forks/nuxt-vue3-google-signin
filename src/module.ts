import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineNuxtModule, addPlugin, addComponent } from '@nuxt/kit'
import { defineUnimportPreset } from 'unimport'
import defu from 'defu'
import pkg from '../package.json'

const MODULE_NAME = 'nuxt-vue3-google-signin'

function toModuleError (message: string) {
  return `[${MODULE_NAME}]: ${message}`
}

export interface ModuleOptions {
  /**
   * Client ID obtained from Google
   *
   * @type {string}
   * @memberof ModuleOptions
   */
  clientId: string;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'vue3-google-signin',
    configKey: 'googleSignIn',
    compatibility: {
      nuxt: '^3.0.0',
      bridge: false
    },
    version: pkg.version
  },
  defaults: {
    clientId: ''
  },
  setup (options, nuxt) {
    if (options.clientId.trim().length === 0) {
      throw new Error(toModuleError('clientId is required'))
    }

    nuxt.options.runtimeConfig.public.googleSignIn = defu(nuxt.options.runtimeConfig.googleSignIn, {
      clientId: options.clientId
    })

    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)
    addPlugin(resolve(runtimeDir, 'plugin'))

    // Add auto-imported components
    GsiBuiltinComponents.map(name =>
      addComponent({
        name,
        export: name,
        filePath: 'vue3-google-signin'
      })
    )

    // Add auto-imported composables
    nuxt.hook('autoImports:sources', (presets) => {
      presets.push(
        defineUnimportPreset({
          from: 'vue3-google-signin',
          imports: [...GsiComposables]
        })
      )
    })
  }
})

const GsiBuiltinComponents = [
  'GoogleSignInButton'
]

const GsiComposables = [
  'useTokenClient',
  'useCodeClient',
  'useGsiScript',
  'useOneTap'
]