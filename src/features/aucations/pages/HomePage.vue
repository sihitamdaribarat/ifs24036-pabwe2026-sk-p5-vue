<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Loader2, PackageOpen, Plus, Search, Trash2 } from "lucide-vue-next";
import AucationCard from "../components/AucationCard.vue";
import AddModal from "../modals/AddModal.vue";
import { useAucationsStore } from "../states/aucationsStore";
import { useUsersStore } from "../../users/states/usersStore";
import { useInput } from "../../../hooks/useInput";
import { isClosed, showConfirmDialog, showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const TABS = [
  { key: "all", label: "Semua Lelang" },
  { key: "mine", label: "Lelang Saya" },
  { key: "open", label: "Lelang Berlangsung" },
  { key: "closed", label: "Lelang Ditutup" },
];

const route = useRoute();
const router = useRouter();
const aucationsStore = useAucationsStore();
const usersStore = useUsersStore();

const [keyword] = useInput("");
const now = ref(Date.now());
let timer = null;

const activeTab = computed(() => (TABS.some((tab) => tab.key === route.query.tab) ? route.query.tab : "all"));
const isAddOpen = computed(() => route.query.add === "1");
const profileId = computed(() => usersStore.profile?.id);

const filteredAucations = computed(() => {
  const search = keyword.value.trim().toLowerCase();
  return aucationsStore.aucations.filter((item) => {
    const closed = isClosed(item.closed_at, now.value);
    if (activeTab.value === "open" && closed) return false;
    if (activeTab.value === "closed" && !closed) return false;
    if (!search) return true;
    return `${item.title} ${item.description}`.toLowerCase().includes(search);
  });
});

async function loadAucations() {
  const result = await aucationsStore.getAucations({ isMe: activeTab.value === "mine" });
  if (!result.success) showErrorDialog(result.message);
}

function selectTab(key) {
  router.push({ name: "home", query: key === "all" ? {} : { tab: key } });
}

function setAddOpen(open) {
  const query = { ...route.query };
  if (open) query.add = "1";
  else delete query.add;
  router.replace({ name: "home", query });
}

async function onDelete(aucation) {
  const confirmed = await showConfirmDialog(`Lelang "${aucation.title}" akan dihapus permanen.`, "Hapus lelang?", "Ya, hapus");
  if (!confirmed) return;
  const result = await aucationsStore.deleteAucation(aucation.id);
  if (!result.success) {
    showErrorDialog(result.message);
    return;
  }
  showSuccessDialog(result.message || "Lelang berhasil dihapus");
}

async function onDeleteAll() {
  const confirmed = await showConfirmDialog(
    "Semua lelang milikmu beserta cover dan tawarannya akan dihapus permanen.",
    "Hapus semua lelang saya?",
    "Ya, hapus semua",
  );
  if (!confirmed) return;
  const result = await aucationsStore.deleteAllAucations();
  if (!result.success) {
    showErrorDialog(result.message);
    return;
  }
  showSuccessDialog(result.message || "Semua lelang berhasil dihapus");
  loadAucations();
}

watch(() => activeTab.value, loadAucations);

onMounted(() => {
  loadAucations();
  timer = setInterval(() => {
    now.value = Date.now();
  }, 30000);
});

onBeforeUnmount(() => clearInterval(timer));
</script>

<template>
  <section>
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Dashboard Lelang</h1>
        <p class="mt-1 text-sm text-slate-500">Temukan barang menarik dan ajukan penawaran terbaikmu.</p>
      </div>
      <div class="flex gap-2">
        <button
          v-if="activeTab === 'mine' && aucationsStore.aucations.length > 0"
          type="button"
          data-testid="delete-all"
          :disabled="aucationsStore.isAucationDeleteAll"
          class="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
          @click="onDeleteAll"
        >
          <Trash2 class="h-4 w-4" /> Hapus Semua
        </button>
        <button
          type="button"
          data-testid="open-add"
          class="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          @click="setAddOpen(true)"
        >
          <Plus class="h-4 w-4" /> Buat Lelang
        </button>
      </div>
    </div>

    <div class="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex gap-1 overflow-x-auto rounded-xl bg-white p-1 ring-1 ring-slate-200" role="tablist">
        <button
          v-for="tab in TABS"
          :key="tab.key"
          type="button"
          role="tab"
          :data-testid="`tab-${tab.key}`"
          :aria-selected="activeTab === tab.key"
          :class="[
            'whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition',
            activeTab === tab.key ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100',
          ]"
          @click="selectTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>

      <label class="relative block lg:w-80">
        <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          v-model="keyword"
          type="search"
          data-testid="search-input"
          placeholder="Cari judul atau deskripsi..."
          class="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />
      </label>
    </div>

    <div v-if="aucationsStore.isAucations" class="flex justify-center py-20 text-slate-500">
      <Loader2 class="h-6 w-6 animate-spin" />
    </div>

    <div
      v-else-if="filteredAucations.length === 0"
      data-testid="empty-state"
      class="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center"
    >
      <PackageOpen class="h-12 w-12 text-slate-300" />
      <p class="mt-3 font-semibold text-slate-700">Belum ada lelang</p>
      <p class="mt-1 text-sm text-slate-500">Tidak ada lelang yang cocok dengan filter atau pencarian.</p>
    </div>

    <div v-else class="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <AucationCard
        v-for="item in filteredAucations"
        :key="item.id"
        :aucation="item"
        :now="now"
        :is-owner="item.user_id === profileId"
        @delete="onDelete"
      />
    </div>

    <AddModal :open="isAddOpen" @close="setAddOpen(false)" @saved="loadAucations" />
  </section>
</template>
