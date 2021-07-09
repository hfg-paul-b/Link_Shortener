<template>
  <div>
    <h1>An error ocurred.</h1>
      <p>The link is not available, doesn't exist or you are using a false URL.</p>
      <br/>
      <el-button><router-link style="text-decoration:none;color:#5F6266;" to="/">Back</router-link></el-button>
  </div>
</template>

<script>

export default {
  name: 'Unknown',
  props: {
  },

  data: function(){
    return {
      domain: window.location.origin,
      short: window.location.pathname.split("/")[1],
      error: false,
      url: null,
    }
  },

  methods: {
  },

  mounted(){
  },
}
</script>

<style scoped>
h1 {
  color: aliceblue;
  padding: 25px;
}

p {
  color: aliceblue;
}

</style>