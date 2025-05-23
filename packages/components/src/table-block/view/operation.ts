import type { Ctx } from '@milkdown/ctx'

import { commandsCtx, editorViewCtx } from '@milkdown/core'
import {
  addColAfterCommand,
  addColBeforeCommand,
  addRowAfterCommand,
  addRowBeforeCommand,
  deleteSelectedCellsCommand,
  selectColCommand,
  selectRowCommand,
  setAlignCommand,
} from '@milkdown/preset-gfm'

import type { Refs } from './types'

export function useOperation(
  refs: Refs,
  ctx?: Ctx,
  getPos?: () => number | undefined
) {
  const {
    xLineHandleRef,
    contentWrapperRef,
    colHandleRef,
    rowHandleRef,
    hoverIndex,
    lineHoverIndex,
  } = refs

  const onAddRow = () => {
    if (!ctx) return
    const xHandle = xLineHandleRef.value
    if (!xHandle) return

    const [rowIndex] = lineHoverIndex.value!
    if (rowIndex < 0) return

    if (!ctx.get(editorViewCtx).editable) return

    const rows = Array.from(
      contentWrapperRef.value?.querySelectorAll('tr') ?? []
    )
    const commands = ctx.get(commandsCtx)
    const pos = (getPos?.() ?? 0) + 1
    if (rows.length === rowIndex) {
      commands.call(selectRowCommand.key, { pos, index: rowIndex - 1 })
      commands.call(addRowAfterCommand.key)
    } else {
      commands.call(selectRowCommand.key, { pos, index: rowIndex })
      commands.call(addRowBeforeCommand.key)
    }

    commands.call(selectRowCommand.key, { pos, index: rowIndex })
    xHandle.dataset.show = 'false'
  }

  const onAddCol = () => {
    if (!ctx) return
    const xHandle = xLineHandleRef.value
    if (!xHandle) return

    const [_, colIndex] = lineHoverIndex.value!
    if (colIndex < 0) return

    if (!ctx.get(editorViewCtx).editable) return

    const cols = Array.from(
      contentWrapperRef.value?.querySelector('tr')?.children ?? []
    )
    const commands = ctx.get(commandsCtx)

    const pos = (getPos?.() ?? 0) + 1
    if (cols.length === colIndex) {
      commands.call(selectColCommand.key, { pos, index: colIndex - 1 })
      commands.call(addColAfterCommand.key)
    } else {
      commands.call(selectColCommand.key, { pos, index: colIndex })
      commands.call(addColBeforeCommand.key)
    }

    commands.call(selectColCommand.key, { pos, index: colIndex })
  }

  const selectCol = () => {
    if (!ctx) return
    const [_, colIndex] = hoverIndex.value!
    const commands = ctx.get(commandsCtx)
    const pos = (getPos?.() ?? 0) + 1
    commands.call(selectColCommand.key, { pos, index: colIndex })
    const buttonGroup =
      colHandleRef.value?.querySelector<HTMLElement>('.button-group')
    if (buttonGroup)
      buttonGroup.dataset.show =
        buttonGroup.dataset.show === 'true' ? 'false' : 'true'
  }

  const selectRow = () => {
    if (!ctx) return
    const [rowIndex, _] = hoverIndex.value!
    const commands = ctx.get(commandsCtx)
    const pos = (getPos?.() ?? 0) + 1
    commands.call(selectRowCommand.key, { pos, index: rowIndex })
    const buttonGroup =
      rowHandleRef.value?.querySelector<HTMLElement>('.button-group')
    if (buttonGroup && rowIndex > 0)
      buttonGroup.dataset.show =
        buttonGroup.dataset.show === 'true' ? 'false' : 'true'
  }

  const deleteSelected = (e: PointerEvent) => {
    if (!ctx) return

    if (!ctx.get(editorViewCtx).editable) return

    e.preventDefault()
    e.stopPropagation()
    const commands = ctx.get(commandsCtx)
    commands.call(deleteSelectedCellsCommand.key)
    requestAnimationFrame(() => {
      ctx.get(editorViewCtx).focus()
    })
  }

  const onAlign =
    (direction: 'left' | 'center' | 'right') => (e: PointerEvent) => {
      if (!ctx) return

      if (!ctx.get(editorViewCtx).editable) return

      e.preventDefault()
      e.stopPropagation()
      const commands = ctx.get(commandsCtx)
      commands.call(setAlignCommand.key, direction)
      requestAnimationFrame(() => {
        ctx.get(editorViewCtx).focus()
      })
    }

  return {
    onAddRow,
    onAddCol,
    selectCol,
    selectRow,
    deleteSelected,
    onAlign,
  }
}
