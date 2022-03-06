<template>
  <div class="file-upload">
    <div class="upload-area" :class="{ 'is-dragover': drag && isDragOver }" v-on="events">
      <slot v-if="isUpLoading" name="loading">
        <button disabled>正在上传</button>
      </slot>
      <slot
        name="uploaded"
        v-else-if="lastFileData && lastFileData.loaded"
        :uploadedData="lastFileData.data"
      >
        <button>点击上传</button>
      </slot>
      <slot v-else name="default">
        <button>点击上传</button>
      </slot>
    </div>
    <input ref="fileInput" type="file" :style="{ display: 'none' }" @change="handleFileChange" />
    <ul :class="`upload-list upload-list-${listType}`" v-if="showUploadList">
      <li
        v-for="file in filesList"
        :key="file.uid"
        :class="`upload-file upload-${file.status}`
        "
      >
        <img
          v-if="file.url && listType === 'picture'"
          class="upload-list-thumbnail"
          :src="file.url"
          :alt="file.name"
        />
        <span v-if="file.status === 'loading'" class="file-icon">
          <LoadingOutlined />
        </span>
        <span v-else class="file-icon">
          <FileOutlined />
        </span>
        <span class="filename">{{ file.name }}</span>
        <span class="delete-icon" @click="removeFile(file.uid)">
          <DeleteOutlined />
        </span>
      </li>
    </ul>
  </div>
</template>
<script lang='ts'>
import { v4 as uuidv4 } from 'uuid';
import { computed, defineComponent, PropType, reactive, ref } from 'vue';
import { DeleteOutlined, LoadingOutlined, FileOutlined } from '@ant-design/icons-vue'
import axios from 'axios';
// import { last } from 'lodash-es';
type UploadStatus = 'ready' | 'loading' | 'success' | 'error';
type CheckUpload = (file: File) => boolean | Promise<File>;
type FileListType = 'picture' | 'text';
export interface UploadFile {
  uid: string;
  name: string;
  size: number;
  status: UploadStatus;
  raw: File;
  resp?: any;
  url?: string;
}
const TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiIxNTk2NjYzNTAxNSIsInBhc3N3b3JkIjoiM2Q5MjdmMDVkYmQzNzg5YjA5ZDUyMGM1ZDMzZjM0Y2UiLCJwaG9uZU51bWJlciI6IjE1OTY2NjM1MDE1Iiwibmlja05hbWUiOiLkuZDpq5g1MDE1IiwiZ2VuZGVyIjowLCJwaWN0dXJlIjpudWxsLCJjaXR5IjpudWxsLCJsYXRlc3RMb2dpbkF0IjoiMjAyMi0wMy0wNVQxNTozMDozNi4wMDBaIiwiaXNGcm96ZW4iOmZhbHNlLCJjcmVhdGVkQXQiOiIyMDIwLTA5LTIzVDA1OjU5OjQyLjAwMFoiLCJ1cGRhdGVkQXQiOiIyMDIyLTAzLTA1VDE1OjMwOjM2LjAwMFoiLCJpYXQiOjE2NDY1NzU3ODMsImV4cCI6MTY0NjY2MjE4M30.TWeWWnVAptr67NmxGVxK3U4RJEctyB6a5t5MqFemSpc";
export default defineComponent({
  name: 'Uploader',
  components: {
    DeleteOutlined,
    LoadingOutlined,
    FileOutlined
  },
  props: {
    action: {
      type: String,
      required: true,
    },
    beforeUpload: {
      type: Function as PropType<CheckUpload>,
    },
    drag: {
      type: Boolean,
    },
    autoUpload: {
      type: Boolean,
      default: true,
    },
    listType: {
      type: String as PropType<FileListType>,
      default: 'text'
    },
    showUploadList: {
      type: Boolean,
      default: true,
    }
  },
  emits: ['success', 'error', 'change'],
  setup(props, { emit }) {
    const fileInput = ref<null | HTMLInputElement>(null);
    // 上传文件列表
    const filesList = ref<UploadFile[]>([]);
    const isDragOver = ref(false);
    // 当前是否正在上传
    const isUpLoading = computed(() => filesList.value.some(v => v.status === 'loading'));
    const lastFileData = computed(() => {
      const lastFile = filesList.value[filesList.value.length - 1];
      if (lastFile) {
        return {
          loaded: lastFile.status === 'success',
          data: lastFile.resp
        }
      }
      return false;
    })
    const postFile = async (readyFile: UploadFile) => {
      const formData = new FormData();
      formData.append(readyFile.name, readyFile.raw);
      readyFile.status = 'loading';
      try {
        const res = await axios.post(props.action, formData, {
          headers: {
            'Content-Type': 'mutipart/form-data',
            'authorization': `Bearer ${TEST_TOKEN}`,
          }
        })
        res.data.data.url = res.data.data.urls[0];
        readyFile.status = 'success';
        readyFile.resp = res.data;
        emit('success', { resp: res.data, file: readyFile, list: filesList.value })
      } catch (error) {
        readyFile.status = 'error';
        emit('error', { error: error, file: readyFile, list: filesList.value })
      } finally {
        if (fileInput.value) {
          fileInput.value.value = '';
        }
      }
    }
    const addFileToList = (uploadedFile: File) => {
      const fileObj = reactive<UploadFile>({
        uid: uuidv4(),
        name: uploadedFile.name,
        size: uploadedFile.size,
        raw: uploadedFile,
        status: 'ready'
      });
      if (props.listType === 'picture') {
        // 第一种预览方法
        try {
          fileObj.url = URL.createObjectURL(uploadedFile);
        } catch (error) {
          console.error(error)
        }
        // 第二种预览方法
        // const fileReader = new FileReader();
        // fileReader.readAsDataURL(uploadedFile);
        // fileReader.addEventListener("load", function () {
        //   fileObj.url = fileReader.result as string;
        // }, false);
      }
      filesList.value.push(fileObj)
      if (props.autoUpload) {
        postFile(fileObj)
      }
    }
    const beforeUploadCheck = (files: null | FileList) => {
      if (files) {
        const uploadedFile = files[0];
        if (props.beforeUpload) {
          const result = props.beforeUpload(uploadedFile);
          if (result && result instanceof Promise) {
            result.then(processedFile => {
              if (processedFile instanceof File) {
                addFileToList(processedFile);
              } else {
                throw new Error('beforedUpload Promise should return File Object')
              }
            }).catch(e => {
              console.error(e)
            })
          } else if (result === true) {
            addFileToList(uploadedFile)
          }
        } else {
          addFileToList(uploadedFile)
        }
      }
    }
    const uploadFiles = () => {
      filesList.value.filter(file => file.status === 'ready').forEach(readyFile => postFile(readyFile));
    }
    // 点击上传按钮
    const triggerUpload = () => {
      if (fileInput.value) {
        fileInput.value?.click()
      }
    }
    // input 选择文件回调
    const handleFileChange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      beforeUploadCheck(target.files)
    }
    // 移除文件列表中的文件
    const removeFile = (uid: string) => {
      filesList.value = filesList.value.filter(v => v.uid !== uid)
    }
    let events: { [key: string]: (e: any) => void } = {
      'click': triggerUpload
    };
    const handleDrag = (e: DragEvent, over: boolean) => {
      e.preventDefault();
      isDragOver.value = over;
    }
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      isDragOver.value = false;
      if (e.dataTransfer) {
        beforeUploadCheck(e.dataTransfer.files)
      }
    }
    if (props.drag) {
      events = {
        ...events,
        'dragover': (e: DragEvent) => handleDrag(e, true),
        'dragleave': (e: DragEvent) => handleDrag(e, false),
        'drop': handleDrop
      }
    }

    return {
      fileInput,
      triggerUpload,
      handleFileChange,
      isUpLoading,
      filesList,
      removeFile,
      lastFileData,
      isDragOver,
      events,
      uploadFiles
    }
  }
})
</script>
<style lang="scss">
.upload-list {
  margin: 0;
  padding: 0;
  list-style-type: none;
  & li {
    transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
    font-size: 14px;
    line-height: 1.8;
    margin-top: 5px;
    box-sizing: border-box;
    border-radius: 4px;
    min-width: 200px;
    position: relative;
  }
  &:first-child {
    margin-top: 10px;
  }
  .file-icon {
    svg {
      margin-right: 5px;
      color: rgba(0, 0, 0, 0.45);
    }
  }
  .filename {
    margin-left: 5px;
    margin-right: 40px;
  }
  &.upload-error {
    color: #f5222d;
    svg {
      color: #f5222d;
    }
  }
  .file-status {
    display: block;
    position: absolute;
    right: 5px;
    top: 0;
    line-height: inherit;
  }
  .delete-icon {
    display: none;
    position: absolute;
    right: 7px;
    top: 0;
    line-height: inherit;
    cursor: pointer;
  }
  &:hover {
    background-color: #efefef;
    .file-status {
      display: none;
    }
    .delete-icon {
      display: block;
    }
  }
}
</style>
