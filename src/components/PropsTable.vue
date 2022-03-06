<template>
  <div class="prop-table">
    <div v-for="(item,key) in finalProps" :key="key" class="prop-item">
      <span class="label" v-if="item.text">{{ item.text }}</span>
      <div class="prop-component">
        <component
          :is="item.component"
          :[item.valueProp]="item.value"
          v-bind="item.extraProps"
          v-on="item.events"
        >
          <template v-if="item.options">
            <component
              v-for="(option, subKey) in item.options"
              :key="subKey"
              :is="item.subComponent"
              :value="option.value"
            >
              <RenderVnode :vNode="option.text" />
            </component>
          </template>
        </component>
      </div>
    </div>
  </div>
</template>
<script lang='ts'>
import { defineComponent, computed, PropType, VNode } from 'vue';
import { reduce } from 'lodash-es';
import { mapPropsToForms } from '../propsMap';
import { TextComponentProps } from '@/defaultProps';
import RenderVnode from '@/components/RenderVnode';
import ColorPicker from '@/components/ColorPicker.vue';

interface FormProps {
  component: string; // 对应的组件名
  subComponent?: string; // 对应子组件
  value: string; // 值
  text?: string; // 属性标题
  extraProps?: { [key: string]: any }; // 额外属性，透传给antd组件
  options?: { text: string | VNode; value: any }[];
  initalTransform?: (data: any) => any;
  valueProp: string; // 自定义 value 的别名
  eventName: string;
  events: { [key: string]: (e: any) => void };
}

export default defineComponent({
  name: 'PropsTable',
  props: {
    props: {
      type: Object as PropType<Partial<TextComponentProps>>,
      required: true
    }
  },
  components: {
    RenderVnode,
    ColorPicker
  },
  emits: ['change'],
  setup(props, context) {
    const finalProps = computed(() => {
      return reduce(props.props, (result, value, key) => {
        const newKey = key as keyof TextComponentProps;
        const item = mapPropsToForms[newKey];
        if (item) {
          const { valueProp = 'value', eventName = 'change', initalTransform, afterTransform } = item;
          const newItem: FormProps = {
            ...item,
            value: initalTransform ? initalTransform(value) : value,
            valueProp,
            eventName,
            events: {
              [eventName]: (e: any) => { context.emit('change', { key, value: afterTransform ? afterTransform(e) : e }) }
            }
          }
          result[newKey] = newItem;
        }
        return result
      }, {} as { [key: string]: FormProps })
    })

    console.log('finalProps', finalProps.value)

    return {
      finalProps
    }
  }
})
</script>
<style scoped>
.prop-item {
  display: flex;
  margin-bottom: 10px;
  align-items: center;
}
.label {
  width: 28%;
}
.prop-component {
  width: 70%;
}
</style>

