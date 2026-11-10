declare module '#auth-utils' {
  interface User {
    id: string
    email: string
    name: string
    role: 'ADMIN' | 'STAFF'
  }
}

export {}

