<!-- File / Format / Insert / Help menus — mirrors the MenuBar in
     packages/react/src/components/TitleBar.tsx. Items emit a string `action`
     event; Insert > Table opens an inline grid picker and emits `insert-table`. -->
<template>
  <div class="menu-bar" role="menubar">
    <MenuDropdown v-if="fileItems.length" :label="t('toolbar.file')" :items="fileItems" />
    <MenuDropdown v-if="formatItems.length" :label="t('toolbar.format')" :items="formatItems" />
    <MenuDropdown v-if="insertItems.length" :label="t('toolbar.insert')" :items="insertItems">
      <template #submenu="{ item, closeMenu }">
        <TableGridInline
          v-if="item.key === 'table'"
          @insert="
            (rows: number, cols: number) => {
              emit('insert-table', rows, cols);
              closeMenu();
            }
          "
        />
      </template>
    </MenuDropdown>
    <MenuDropdown v-if="helpItems.length" :label="t('toolbar.help')" :items="helpItems" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTranslation } from '../i18n';
import MenuDropdown, { type MenuEntry, type MenuSeparator } from './ui/MenuDropdown.vue';
import TableGridInline from './ui/TableGridInline.vue';

const props = defineProps<{
  /** Action ids to hide from the menu bar. A menu with no remaining items
   *  is not rendered (its `v-if` list comes back empty). */
  hiddenMenuActions?: string[];
}>();

const emit = defineEmits<{
  (e: 'action', action: string): void;
  (e: 'insert-table', rows: number, cols: number): void;
}>();

const { t } = useTranslation();

function act(action: string) {
  return () => emit('action', action);
}

function isSeparator(entry: MenuEntry): entry is MenuSeparator {
  return 'type' in entry && entry.type === 'separator';
}

/**
 * Drop entries whose `id` is in `hiddenMenuActions`, then tidy the
 * surviving separators — strip leading/trailing ones and collapse any
 * runs left behind by the removed items.
 */
function visible(items: MenuEntry[]): MenuEntry[] {
  const hidden = props.hiddenMenuActions;
  const kept =
    hidden && hidden.length
      ? items.filter((entry) => isSeparator(entry) || !entry.id || !hidden.includes(entry.id))
      : items.slice();

  const cleaned: MenuEntry[] = [];
  for (const entry of kept) {
    if (isSeparator(entry) && (cleaned.length === 0 || isSeparator(cleaned[cleaned.length - 1]))) {
      continue; // leading or consecutive separator
    }
    cleaned.push(entry);
  }
  while (cleaned.length && isSeparator(cleaned[cleaned.length - 1])) {
    cleaned.pop(); // trailing separator
  }
  return cleaned;
}

const fileItems = computed<MenuEntry[]>(() =>
  visible([
    {
      id: 'open',
      icon: 'file_upload',
      label: t('toolbar.open'),
      shortcut: t('toolbar.openShortcut'),
      onClick: act('open'),
    },
    {
      id: 'save',
      icon: 'file_download',
      label: t('toolbar.save'),
      shortcut: t('toolbar.saveShortcut'),
      onClick: act('save'),
    },
    { type: 'separator' },
    { id: 'pageSetup', icon: 'settings', label: t('toolbar.pageSetup'), onClick: act('pageSetup') },
  ])
);

const formatItems = computed<MenuEntry[]>(() =>
  visible([
    {
      id: 'dirLTR',
      icon: 'format_textdirection_l_to_r',
      label: t('toolbar.leftToRight'),
      onClick: act('dirLTR'),
    },
    {
      id: 'dirRTL',
      icon: 'format_textdirection_r_to_l',
      label: t('toolbar.rightToLeft'),
      onClick: act('dirRTL'),
    },
  ])
);

const insertItems = computed<MenuEntry[]>(() =>
  visible([
    { id: 'insertImage', icon: 'image', label: t('toolbar.image'), onClick: act('insertImage') },
    { id: 'table', icon: 'grid_on', label: t('toolbar.table'), key: 'table', submenu: true },
    { type: 'separator' },
    {
      id: 'insertPageBreak',
      icon: 'page_break',
      label: t('toolbar.pageBreak'),
      onClick: act('insertPageBreak'),
    },
    {
      id: 'insertTOC',
      icon: 'format_list_numbered',
      label: t('toolbar.tableOfContents'),
      onClick: act('insertTOC'),
    },
    {
      id: 'watermark',
      icon: 'branding_watermark',
      label: t('toolbar.watermark'),
      onClick: act('watermark'),
    },
  ])
);

const helpItems = computed<MenuEntry[]>(() =>
  visible([{ id: 'reportIssue', label: t('toolbar.reportIssue'), onClick: act('reportIssue') }])
);
</script>

<style scoped>
.menu-bar {
  display: flex;
  align-items: center;
}
</style>
