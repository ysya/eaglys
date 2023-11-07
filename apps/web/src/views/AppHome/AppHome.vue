<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from 'vue'
import { basicSetup } from 'codemirror'
import { EditorView, keymap, ViewUpdate } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { sql, PostgreSQL } from '@codemirror/lang-sql'
import { vscodeKeymap } from '@replit/codemirror-vscode-keymap'
import { oneDark } from '@codemirror/theme-one-dark'
import * as sqlFormatter from 'sql-formatter'
import axios from 'axios'
import { Notify } from 'quasar'

const originSql = ref(
  sqlFormatter.format(`START TRANSACTION; UPDATE users
            SET "email" = 'new.mail@example.com'
            WHERE "username" = 'john_doe';
            UPDATE users
            SET "last_login" = NOW()
            WHERE "username" = 'john_doe';
            ROLLBACK;`)
)
const parsedSql = ref('')
const parsedHashMap = ref<Record<string, string>>()
const editorElement = ref<Element | DocumentFragment | undefined>(undefined)
const editorState: Ref<EditorState | undefined> = ref()
const editor: Ref<EditorView | undefined> = ref()
onMounted(() => {
  editorState.value = EditorState.create({
    doc: originSql.value,
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
function formatEditorSql() {
  if (editor.value) {
    editor.value.dispatch({
      changes: {
        from: 0,
        to: editorState.value?.doc.length ?? 0,
        insert: sqlFormatter.format(editorState.value?.doc.toString() ?? ''),
      },
    })
  }
}
const loading = ref(false)
async function parseSql() {
  loading.value = true
  console.log(originSql.value)
  const reqBody = {
    sqlString: originSql.value,
  }
  try {
    await axios
      .post('http://localhost:3000/api/sql/hash', reqBody)
      .then((res) => {
        console.log(res.data)
        parsedSql.value = sqlFormatter.format(res.data.data.sqlParsed)
        parsedHashMap.value = res.data.data.hashMap
        console.log(parsedSql.value)
      })
  } catch (error) {
    console.log(error)
    Notify.create({
      message: 'parse sql error',
      color: 'negative',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <q-page padding>
    <div class="relative flex flex-col gap-4 container">
      <div>
        <div class="my-2 text-lg">Please Input SQL:</div>
        <div class="mb-2">
          <q-btn color="primary" @click="formatEditorSql()">Format</q-btn>
        </div>
        <div ref="editorElement"></div>
      </div>
      <q-btn color="primary" @click="parseSql" :loading="loading">
        <q-icon name="arrow_downward">
          <q-tooltip>parse</q-tooltip>
        </q-icon>
      </q-btn>
      <div>
        <div class="my-2 text-lg">Parse Result:</div>
        <q-card flat bordered>
          <q-card-section>
            <pre style="white-space: pre-wrap">{{ parsedSql }}</pre>
          </q-card-section>
        </q-card>
      </div>
      <div>
        <div class="my-2 text-lg">Map:</div>
        <q-card flat bordered>
          <q-card-section>
            <pre style="white-space: pre-wrap">{{ parsedHashMap }}</pre>
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
