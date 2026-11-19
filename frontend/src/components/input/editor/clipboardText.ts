import type {Fragment, Slice} from '@tiptap/pm/model'

const LIST_NODE_NAMES = new Set(['bulletList', 'orderedList', 'taskList'])

// Renders a fragment as lines of markdown-style plain text. List items keep their
// markers so copying a list out of the editor and pasting it back again (or into any
// other plain text field) preserves the list structure.
function fragmentLines(fragment: Fragment): string[] {
	const lines: string[] = []

	fragment.forEach(node => {
		if (LIST_NODE_NAMES.has(node.type.name)) {
			node.forEach((item, _offset, itemIndex) => {
				const marker = node.type.name === 'orderedList' ? `${itemIndex + 1}. ` : '- '
				const [first = '', ...rest] = fragmentLines(item.content)
				const indent = ' '.repeat(marker.length)
				lines.push(marker + first, ...rest.map(line => indent + line))
			})
			return
		}

		if (node.isTextblock) {
			lines.push(node.textContent)
			return
		}

		if (node.isText) {
			lines.push(node.text ?? '')
			return
		}

		if (node.isBlock && !node.isAtom && node.childCount > 0) {
			lines.push(...fragmentLines(node.content))
		}
	})

	return lines
}

export function serializeSliceAsText(slice: Slice): string {
	return fragmentLines(slice.content).join('\n')
}
