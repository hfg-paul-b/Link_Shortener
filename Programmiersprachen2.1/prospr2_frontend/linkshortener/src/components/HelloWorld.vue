<template>
  <div>
    <img
      src="../assets/scissors3.svg"
      style="width: 420px; margin-bottom: 50px"
    /><br />
    
    
    <div class="bar">                                              
      <h1>Your favourite Link Shortener</h1>
      <el-menu
        :default-active="activeIndex"
        mode="horizontal"
        @select="handleSelect"
      >
        <el-menu-item index="1" v-on:click="setRandom = false"
          >Choose_URL</el-menu-item
        >
        <el-menu-item index="2" v-on:click="setRandom = true"
          >Random_URL</el-menu-item
        >
      </el-menu>

      <div class="border">
        <div v-if="error">
          <el-alert
            v-bind:title="status"
            type="error"
            show-icon
            :closable="false"
          ></el-alert>
        </div>
        <div v-if="success">
          <el-alert
            v-bind:title="status"
            type="success"
            show-icon
            :closable="false"
          ></el-alert>
        </div>

        <p>Place any URL here:</p>
        <p>
          <span style="font-weight: bold">URL</span>:
          <el-input
            class="input"
            type="text"
            v-model="inputLink"
            v-bind:placeholder="defaultText"
            clearable
          />
        </p>
        <p>{{ inputLink }}</p>
        <div v-if="setRandom === true">
          <p>
            Random shortened URL
            <el-button v-on:click="randomPost">get short URL</el-button>
          </p>
        </div>
        <div
          style="
            border: 1px solid white;
            display: border-box;
            background-color: darkslateblue;
            border-radius: 2px;
            padding: 0 18px;
          "
          v-else
        >
          <p>
            {{ domain }}
            <el-input
              class="input no"
              placeholder="choose own acronym"
              type="text"
              v-model="wishLink"
              style="max-width: 180px"
              clearable
            />
            <el-button v-on:click="wishPost">get short URL</el-button>
          </p>
        </div>
        <br />

        <div v-if="linkPosted === true">
          <p>shortUrl: {{ domain + shortUrl }}</p>
          <p>adminCode: {{ adminCode }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "LinkShortener",
  props: {
    msg: String,
    headline: String,
    defaultText: String,
  },

  data: function () {
    return {
      domain: window.location.origin + "/",
      setRandom: false,
      inputLink: "",
      wishLink: "",
      shortUrl: null,
      adminCode: null,
      error: false,
      success: false,
      status: "",
      activeIndex: "1",
      linkPosted: false,
    };
  },

  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },

    axiosPost(kuerzel, random) {
      axios
        .post("http://localhost:4000/code/generate", {
          short: kuerzel,
          url: this.inputLink,
          mode: random,
        })
        .then((response) => {
          this.status = response.status + " " + response.statusText;
          // Short und Admin-Code
          this.shortUrl = response.data.url;
          this.adminCode = response.data.admin;
          this.linkPosted = true;
          (this.error = false), (this.success = true);
        })
        .catch((error) => {
          this.status = error.response.status + " " + error.response.statusText;
          (this.error = true), (this.success = false);
        });
    },

    wishPost() {
      this.axiosPost(this.wishLink, true);
    },
    randomPost() {
      this.axiosPost(null, false);
    },

    axiosGet(kuerzel) {
      axios
        .get(`http://localhost:4000/code/${kuerzel}`)
        .then((response) => {
          this.status = response.status + " " + response.statusText;
          this.error = false;
          this.linkPosted = true;
        })
        .catch((error) => {
          this.status = error.response.status + " " + error.response.statusText;
          this.error = true;
        });
    },
  },

  mounted() {},
};
</script>

<style scoped>

h1{
  text-align: center;
}

.input {
  max-width: 250px;
}

.bar {
  width: 60%;
  background-color:white;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  margin: auto;
  text-align: center;
  overflow: auto;
  margin-bottom: 50px;
}
</style>