<template>
  <div>
    <img src="./assets/logo.png" style="max-width:180px;position:absolute;left:25px;top:20px;">
    <div style="margin-top:70px;">
      <router-view/> 
    </div>
  </div>
</template>

<style lang="scss">
#app {
  font-family: sans-serif;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
