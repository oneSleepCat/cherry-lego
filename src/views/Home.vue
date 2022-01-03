<template>
  <div class="content-container">
    <template-list :list="testData"></template-list>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import TemplateList from '../components/TemplateList.vue';
// import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { GlobalDataProps } from '../store/index';

export default defineComponent({
  components: {
    TemplateList,
  },
  setup() {
    const store = useStore<GlobalDataProps>();
    const testData = computed(() => store.state.templates);

    return {
      testData,
    };
  },
});
</script>

<style scoped>
.content-container {
  background: #fff;
  padding: 0 24px 24px 30px;
  min-height: 85vh;
  max-width: 1200px;
  margin: 50px auto;
  width: 100%;
}
</style>