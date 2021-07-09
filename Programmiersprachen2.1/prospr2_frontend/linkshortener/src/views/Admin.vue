<template>
  <div>
    <div v-if="error === false" >
        <h1>Admin-Bereich</h1>
        <p> Kürzel: {{ info.shortCode }} </p>
        <p> URL: {{ info.originalURL }} </p>
        <p> Aufrufe: {{ info.clickCounter }} </p>
        <p> IP: {{ ip }} </p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Admin',
  props: {
  },

  data: function(){
    return {
        domain: window.location.origin,
        short: window.location.pathname.split("/")[2],
        error: false,
        // "info" speichert Datenbank-Objekt
        info: {},
        ip: {},
    }
  },

  methods: {

  },

  mounted(){
    axios.get(`http://localhost:4000/code/${this.short}`)
    .then((response) => {
      this.info = response.data
    })
    .catch(() => {
      this.error = true
      window.location.href = `/unknown/${this.short}`
    })

/*
    axios.get('http://ipinfo.io/json')
    .then((response) => {
      this.ip = response.data
    })
    .catch(() => {
      //this.error = true
    })
*/

  },
}
</script>

<style scoped>

h1 {
  color: aliceblue;
  padding: 25px;
}

p{ 
  font-size: 50px;
font-weight: bold;
color: black;
}
</style>