import {describe, it, expect, afterEach} from 'vitest'
import {ref} from 'vue'
import {Editor} from '@tiptap/core'

import {createEditorExtensions, type EditorExtensionDeps} from './editorExtensions'
import {serializeSliceAsText} from './clipboardText'

window.API_URL = 'http://localhost:3456'

function createEditor(content: string) {
	const holder = document.createElement('div')
	document.body.appendChild(holder)

	let editor: Editor
	const deps: EditorExtensionDeps = {
		t: key => key,
		isEditing: ref(true),
		isEditEnabled: () => true,
		placeholder: '',
		contentHasChanged: ref(false),
		bubbleSave: () => {},
		getEditor: () => editor,
		uploadCallback: undefined,
		uploadAndInsertFiles: () => {},
	}

	editor = new Editor({element: holder, extensions: createEditorExtensions(deps), content})

	return editor
}

function serializeWholeDocument(editor: Editor) {
	return serializeSliceAsText(editor.state.doc.slice(0, editor.state.doc.content.size))
}

afterEach(() => {
	document.body.innerHTML = ''
})

describe('serializing copied content as plain text', () => {
	it('keeps the markers of a bullet list', () => {
		const editor = createEditor('<p>start</p><ul><li><p>this</p></li><li><p>is</p></li><li><p>a</p></li><li><p>list</p></li></ul><p>end</p>')

		expect(serializeWholeDocument(editor)).toBe('start\n- this\n- is\n- a\n- list\nend')
	})

	it('numbers the items of an ordered list', () => {
		const editor = createEditor('<ol><li><p>one</p></li><li><p>two</p></li></ol>')

		expect(serializeWholeDocument(editor)).toBe('1. one\n2. two')
	})

	it('indents nested list items under their parent', () => {
		const editor = createEditor('<ul><li><p>parent</p><ul><li><p>child</p></li></ul></li></ul>')

		expect(serializeWholeDocument(editor)).toBe('- parent\n  - child')
	})
})
