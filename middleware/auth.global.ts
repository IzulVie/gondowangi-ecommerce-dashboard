export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()

  // If user is not logged in and trying to access any page other than /login
  if (!loggedIn.value && to.path !== '/login') {
    return navigateTo('/login')
  }

  // If user is already logged in and trying to access /login, redirect to dashboard
  if (loggedIn.value && to.path === '/login') {
    return navigateTo('/')
  }
})

