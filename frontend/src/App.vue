<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/camera">Camera</router-link> |
      <router-link to="/login">Login</router-link> |
      <router-link to="/alerts">Alerts</router-link> |
      <router-link to="/dashboard">Dashboard</router-link>
      <h1 class="text-3xl font-bold underline text-blue-500">
        Tailwind 적용 확인!
      </h1>
    </nav>
    <router-view />
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
