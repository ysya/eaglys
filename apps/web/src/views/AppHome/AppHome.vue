<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from 'vue'
import { basicSetup } from 'codemirror'
import { EditorView, keymap, ViewUpdate } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { sql, PostgreSQL } from '@codemirror/lang-sql'
import { vscodeKeymap } from '@replit/codemirror-vscode-keymap'
import { oneDark } from '@codemirror/theme-one-dark'

const originSql = ref('')
const parsedSql = ref('')
const editorElement = ref<Element | DocumentFragment | undefined>(undefined)
const editorState: Ref<EditorState | undefined> = ref()
const editor: Ref<EditorView | undefined> = ref()
onMounted(() => {
  editorState.value = EditorState.create({
    doc: '',
    extensions: [
      // syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      sql({ dialect: PostgreSQL, upperCaseKeywords: true }),
      basicSetup,
      keymap.of(vscodeKeymap),
      oneDark,
      EditorView.updateListener.of((v: ViewUpdate) => {
        if (v.docChanged) {
          originSql.value = v.state.doc.toString()
        }
      }),
    ],
  })
  editor.value = new EditorView({
    state: editorState.value,
    parent: editorElement.value,
  })
})
</script>

<template>
  <q-page padding>
    <div class="relative flex flex-col gap-4 container">
      <div>
        <div class="my-2 text-lg">Please Input SQL:</div>
        <div ref="editorElement"></div>
      </div>
      <q-btn color="primary">
        <q-icon name="arrow_downward">
          <q-tooltip>parse</q-tooltip>
        </q-icon>
      </q-btn>
      <div>
        <div class="my-2 text-lg">Parse Result:</div>
        <q-card flat bordered>
          <q-card-section>
            <pre style="white-space: pre-line">{{ originSql }}</pre>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style lang="scss">
.cm-content,
.cm-gutter {
  min-height: 300px !important;
}
.cm-gutters {
  margin: 1px;
}
.cm-wrap {
  height: 100%;
}
.cm-scroller {
  overflow: auto;
  max-height: 300px;
}
</style>
