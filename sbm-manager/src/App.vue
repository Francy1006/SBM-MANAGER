<template>
  <div style="display:flex;">
    <Sidebar />
    <div style="flex:1; margin-left:220px; min-height:100vh; display:flex; flex-direction:column;">
      <Header />
      <Home />
      <Footer />
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue';
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import Home from './views/Home.vue';

export default {
  name: 'App',
  components: { Sidebar, Header, Home, Footer },
};
</script> 