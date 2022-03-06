/* 此文件是 PropsTable.vue  的另一种实现方式*/
import { defineComponent, computed, PropType, VNode } from 'vue';
import { reduce } from 'lodash-es';
import { Input, InputNumber, Slider, Radio, Select } from 'ant-design-vue'
import { mapPropsToForms } from '../propsMap';
import { TextComponentProps } from '@/defaultProps';

const mapToComponent = {
  'a-textarea': Input.TextArea,
  'a-input-number': InputNumber,
  'a-slider': Slider,
  'a-radio-group': Radio.Group,
  'a-radio-button': Radio.Button,
  'a-select': Select,
  'a-select-option': Select.Option
} as any

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

// 将字符串首字母大写
const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toLocaleUpperCase() + string.slice(1)
}

export default defineComponent({
  name: 'PropsTable',
  props: {
    props: {
      type: Object as PropType<Partial<TextComponentProps>>,
      required: true
    }
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
              [`on${capitalizeFirstLetter(eventName)}`]: (e: any) => { context.emit('change', { key, value: afterTransform ? afterTransform(e) : e }) }
            }
          }
          result[newKey] = newItem;
        }
        return result
      }, {} as { [key: string]: FormProps })
    })

    return () => (
      <div class="prop-table">
        {
          Object.keys(finalProps.value).map((key) => {
            const item = finalProps.value[key];
            const ComponentName = mapToComponent[item.component];
            const SubComponentName = item.subComponent ? mapToComponent[item.subComponent] : null;
            const props = {
              [item.valueProp]: item.value,
              ...item.extraProps,
              ...item.events
            }
            return (
              <div class='prop-item'>
                {item.text && <span class="label">{item.text}</span>}
                <ComponentName {...props}>
                  {
                    item.options && item.options.map(option => {
                      return (
                        <SubComponentName value={option.value}>
                          {option.text}
                        </SubComponentName>
                      )
                    })
                  }
                </ComponentName>
              </div>
            )
          })
        }
      </div>
    )
  }
})
