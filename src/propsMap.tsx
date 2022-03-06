import { VNode } from 'vue';
import { TextComponentProps } from '@/defaultProps';

export interface PropToForm {
  component: string; // 对应的组件名
  subComponent?: string; // 对应子组件
  text?: string; // 属性标题
  extraProps?: { [key: string]: any }; // 额外属性，透传给antd组件
  options?: { text: string | VNode; value: any }[];
  initalTransform?: (data: any) => any; // 对输入的数据进行类型转换再进行输出
  afterTransform?: (data: any) => any; // 对输出的数据进行转换为指定的数据结构
  valueProp?: string; // 自定义 value 的别名
  eventName?: string;
}

const fontFamilyArr = [
  { text: '宋体', value: '"SimSun","STSong"' },
  { text: '黑体', value: '"SimHei","STHeiti"' },
  { text: '楷体', value: '"KaiTi","STKaiti"' },
  { text: '仿宋', value: '"FangSong","STFangsong"' },
]

const fontFamilyOptios = fontFamilyArr.map(item => {
  return {
    value: item.value,
    text: <span style={{ fontFamily: item.value }}>{item.text}</span> as VNode
  }
})

export type PropsToForms = {
  [P in keyof TextComponentProps]?: PropToForm;
};

export const mapPropsToForms: PropsToForms = {
  text: {
    component: 'a-textarea',
    text: '文本',
    extraProps: {
      rows: 3,
    },
    afterTransform: (e: any) => e.target.value,
  },
  fontSize: {
    component: 'a-input-number',
    text: '字号',
    initalTransform: (v: string) => parseInt(v),
    afterTransform: (e: number) => (e ? `${e}px` : ''),
  },
  lineHeight: {
    component: 'a-slider',
    text: '行高',
    extraProps: {
      min: 0,
      max: 3,
      step: 0.1,
    },
    initalTransform: (v: string) => parseFloat(v),
    afterTransform: (e: number) => e.toString(),
  },
  textAlign: {
    component: 'a-radio-group',
    subComponent: 'a-radio-button',
    text: '对齐',
    options: [
      {
        text: '左',
        value: 'left',
      },
      {
        text: '中',
        value: 'center',
      },
      {
        text: '右',
        value: 'right',
      },
    ],
    afterTransform: (e: any) => e.target.value,
  },
  fontFamily: {
    component: 'a-select',
    subComponent: 'a-select-option',
    text: '字体',
    options: [
      { value: '', text: '无' },
      ...fontFamilyOptios
    ],
  },
  color: {
    component: 'color-picker',
    text: '字体颜色',
  }
};
