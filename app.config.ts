export default defineAppConfig({
  ui: {
    primary: 'emerald',
    gray: 'zinc',
    card: {
      background: 'bg-white dark:bg-zinc-950',
      rounded: 'rounded-lg',
      ring: 'ring-1 ring-zinc-200/80 dark:ring-zinc-800',
      shadow: 'shadow-none',
      divide: 'divide-y divide-zinc-200/80 dark:divide-zinc-800',
      header: {
        padding: 'px-5 py-4 sm:px-6'
      },
      body: {
        padding: 'p-5 sm:p-6'
      },
      footer: {
        padding: 'px-5 py-3.5 sm:px-6'
      }
    },
    button: {
      rounded: 'rounded-md',
      font: 'font-medium',
      default: {
        size: 'sm',
        loadingIcon: 'i-heroicons-arrow-path-20-solid'
      }
    },
    input: {
      rounded: 'rounded-md',
      color: {
        white: {
          outline: 'shadow-none ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-zinc-900 dark:focus:ring-zinc-100'
        }
      },
      default: {
        size: 'sm'
      }
    },
    select: {
      rounded: 'rounded-md',
      color: {
        white: {
          outline: 'shadow-none ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-zinc-900 dark:focus:ring-zinc-100'
        }
      },
      default: {
        size: 'sm'
      }
    },
    modal: {
      rounded: 'rounded-lg',
      ring: 'ring-1 ring-zinc-200 dark:ring-zinc-800',
      shadow: 'shadow-none'
    },
    slideover: {
      ring: 'ring-1 ring-zinc-200 dark:ring-zinc-800'
    }
  }
})

