<template>
  <div class="homepage-container">
    <a-layout :style="{ background: '#fff' }">
      <a-layout-header class="header">
        <div class="page-title">
          <router-link to="/">乐高</router-link>
        </div>
        <user-profile :user="user" />
      </a-layout-header>
      <a-layout-content class="home-layout">
        <router-view></router-view>
      </a-layout-content>
      <a-layout-footer>© 慕课网（imooc.com）版权所有 | 津ICP备20000929号-2</a-layout-footer>
    </a-layout>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useStore } from 'vuex';
import UserProfile from '../components/UserProfile.vue';
import { GlobalDataProps } from '../store/index';

export default defineComponent({
  name: 'Index',
  components: {
    UserProfile
  },
  setup() {

    const store = useStore<GlobalDataProps>();
    const user = computed(() => store.state.user)

    return {
      user
    }
  }
});
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.page-title {
  color: #fff;
}
.content-container {
  background: #fff;
  padding: 0 24px 24px 30px;
  min-height: 85vh;
  max-width: 1200px;
  margin: 50px auto;
  width: 100%;
}
</style>