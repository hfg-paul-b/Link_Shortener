<template>
  <div>
      <h1>redirecting...</h1>
      <p>Thank you for choosing LinkShortener!</p>
      <br/>
      <p>If you are not redirected within 5 seconds, click here:</p>
      <el-button v-on:click="window.location.href = this.url"> {{ url }} </el-button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Redirect',
  props: {
  },

  data: function(){
    return {
      domain: window.location.origin,
      short: window.location.pathname.split("/")[1],
      url: null,
    }
  },

  mounted(){
    axios.get(`http://localhost:4000/redirect/${this.short}`)
    .then((response) => {
      this.url = (response.data.originalURL).toString()
      setTimeout(function(){ window.location.href = (response.data.originalURL).toString() }, 3000);
    })
    .catch(() => {
      window.location.href = `/unknown/${this.short}`
    })

  },
}
</script>

<style scoped>


</style>