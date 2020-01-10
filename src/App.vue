<template>
  <div id="app">
    <b-navbar toggleable="lg" type="dark" variant="dark">
      <b-navbar-brand href="/#/"><img height="24" style="float:left; margin-right:10px" src="./assets/logo.png"> News Feed</b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <a href="/#/new">
            <b-button size="sm" class="my-2 my-sm-0" type="submit">Write news</b-button>
          </a>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <router-view/>
  </div>
</template>

<style>
  @import url('https://rsms.me/inter/inter.css');
  html, #app { font-family: 'Inter', sans-serif; }
</style>