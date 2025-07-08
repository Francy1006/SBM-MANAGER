<template>
  <div style="display:flex;">
    <SidebarComponent />
    <div style="flex:1; min-height:100vh; display:flex; flex-direction:column; margin-left:1.5rem;">
      <HeaderComponent />
      <router-view />
      <FooterComponent />
    </div>
  </div>
</template>

<script>
import SidebarComponent from './components/SidebarComponent.vue';
import HeaderComponent from './components/HeaderComponent.vue';
import FooterComponent from './components/FooterComponent.vue';

export default {
  name: 'App',
  components: { SidebarComponent, HeaderComponent, FooterComponent },
};
</script> 