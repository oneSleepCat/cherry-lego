import { Module } from 'vuex';
import { v4 as uuidv4 } from 'uuid';
import { GlobalDataProps } from './index';
import { TextComponentProps, ImageComponentProps } from '@/defaultProps';

export interface EditorProps {
	// 供中间编辑器渲染的数组
	components: ComponentData[];
	// 当前编辑的元素
	currentElement: string;
}

export interface ComponentData {
	// 元素的属性
	props: Partial<TextComponentProps & ImageComponentProps>;
	// id uuid v4生成
	id: string;
	// 业务组件名称
	name: 'l-text' | 'l-image';
}

export const testComponents: ComponentData[] = [
	{
		id: uuidv4(),
		name: 'l-text',
		props: {
			text: 'hellow',
			fontSize: '10px',
			color: '#000000',
			lineHeight: '1',
			textAlign: 'left',
			fontFamily: '',
		},
	},
	{
		id: uuidv4(),
		name: 'l-text',
		props: {
			text: 'hellow2',
			fontSize: '15px',
			color: 'red',
			lineHeight: '2',
			textAlign: 'left',
			fontFamily: '',
		},
	},
	{
		id: uuidv4(),
		name: 'l-text',
		props: {
			text: 'hellow3',
			fontSize: '20px',
			fontWeight: 'bold',
			actionType: 'url',
			url: 'https://www.baidu.com',
		},
	},
];

const editor: Module<EditorProps, GlobalDataProps> = {
	state: {
		components: testComponents, // 模板列表
		currentElement: '', // 画布中选中的当前模板id
	},
	mutations: {
		addComponent(state, component: ComponentData) {
			state.components.push(component);
		},
		setActive(state, currentId: string) {
			state.currentElement = currentId;
		},
		updateComponent(state, { key, value }) {
			const updateComponent = state.components.find(
				(component) => component.id === state.currentElement
			);
			if (updateComponent) {
				updateComponent.props[key as keyof TextComponentProps] = value;
			}
		},
	},
	getters: {
		getCurrentElement(state) {
			return state.components.find(
				(component) => component.id === state.currentElement
			);
		},
	},
};

export default editor;
