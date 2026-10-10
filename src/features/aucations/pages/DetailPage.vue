<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import {
  ArrowLeft,
  CalendarClock,
  Gavel,
  ImageOff,
  ImageUp,
  Loader2,
  Pencil,
  Trash2,
  Trophy,
  Undo2,
} from "lucide-vue-next";
import MarkdownViewer from "../components/MarkdownViewer.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import ChangeCoverModal from "../modals/ChangeCoverModal.vue";
import BidModal from "../modals/BidModal.vue";
import { useAucationsStore } from "../states/aucationsStore";
import { useUsersStore } from "../../users/states/usersStore";
import {
  formatCountdown,
  formatDate,
  formatRupiah,
  getHighestBid,
  isClosed,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

const route = useRoute();
const router = useRouter();
const aucationsStore = useAucationsStore();
const usersStore = useUsersStore();

const errorMessage = ref("");
const activeModal = ref(null);
const now = ref(Date.now());
let timer = null;

const aucationId = computed(() => Number(route.params.aucationId));
const aucation = computed(() => {
  const current = aucationsStore.aucation;
  return current?.id === aucationId.value ? current : null;
});
const isOwner = computed(() => aucation.value.user_id === usersStore.profile?.id);
const closed = computed(() => isClosed(aucation.value.closed_at, now.value));
const highestBid = computed(() => getHighestBid(aucation.value.bids));
const myBid = computed(() => aucation.value.my_bid ?? null);
const bids = computed(() => [...(aucation.value.bids ?? [])].sort((a, b) => b.bid - a.bid));

async function loadAucation() {
  errorMessage.value = "";
  const result = await aucationsStore.getAucation(aucationId.value);
  if (!result.success) errorMessage.value = result.message;
}

async function onDelete() {
  const confirmed = await showConfirmDialog(
    `Lelang "${aucation.value.title}" akan dihapus permanen.`,
    "Hapus lelang?",
    "Ya, hapus",
  );
  if (!confirmed) return;
  const result = await aucationsStore.deleteAucation(aucation.value.id);
  if (!result.success) {
    showErrorDialog(result.message);
    return;
  }
  showSuccessDialog(result.message || "Lelang berhasil dihapus");
  router.push({ name: "home" });
}

async function onCancelBid() {
  const confirmed = await showConfirmDialog("Tawaran kamu pada lelang ini akan dibatalkan.", "Batalkan tawaran?", "Ya, batalkan");
  if (!confirmed) return;
  const result = await aucationsStore.deleteBid(aucation.value.id);
  if (!result.success) {
    showErrorDialog(result.message);
    return;
  }
  showSuccessDialog(result.message || "Tawaran berhasil dibatalkan");
  loadAucation();
}

watch(aucationId, loadAucation);

onMounted(() => {
  loadAucation();
  timer = setInterval(() => {
    now.value = Date.now();
  }, 30000);
});

onBeforeUnmount(() => clearInterval(timer));
</script>

<template>
  <section>
    <RouterLink to="/" class="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600">
      <ArrowLeft class="h-4 w-4" /> Kembali ke dashboard
    </RouterLink>

    <div v-if="errorMessage" data-testid="detail-error" class="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
      <p class="font-semibold">Lelang tidak dapat dimuat</p>
      <p class="mt-1 text-sm">{{ errorMessage }}</p>
    </div>

    <div v-else-if="!aucation" class="flex justify-center py-20 text-slate-500">
      <Loader2 class="h-6 w-6 animate-spin" />
    </div>

    <div v-else class="mt-4 grid gap-6 lg:grid-cols-5">
      <div class="space-y-6 lg:col-span-3">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          <img
            v-if="aucation.cover"
            :src="aucation.cover"
            :alt="aucation.title"
            data-testid="detail-cover"
            class="aspect-[4/3] w-full object-cover"
          />
          <div v-else class="flex aspect-[4/3] flex-col items-center justify-center text-slate-400">
            <ImageOff class="h-14 w-14" />
            <span class="mt-2 text-sm">Belum ada cover</span>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 class="mb-3 text-lg font-bold text-slate-900">Deskripsi Barang</h2>
          <MarkdownViewer :content="aucation.description" />
        </div>
      </div>

      <div class="space-y-6 lg:col-span-2">
        <div class="rounded-2xl border border-slate-200 bg-white p-6">
          <span
            :class="[
              'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
              closed ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-700',
            ]"
          >
            {{ closed ? "Lelang Ditutup" : "Lelang Berlangsung" }}
          </span>
          <h1 class="mt-3 text-2xl font-bold text-slate-900">{{ aucation.title }}</h1>
          <div class="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <img v-if="aucation.author?.photo" :src="aucation.author.photo" alt="" class="h-6 w-6 rounded-full object-cover" />
            <span>oleh {{ aucation.author?.name ?? "Pengguna" }}</span>
          </div>

          <dl class="mt-5 grid grid-cols-2 gap-3">
            <div class="rounded-xl bg-slate-50 p-3">
              <dt class="text-xs text-slate-500">Harga Awal</dt>
              <dd class="mt-0.5 font-bold text-slate-800">{{ formatRupiah(aucation.start_bid) }}</dd>
            </div>
            <div class="rounded-xl bg-emerald-50 p-3">
              <dt class="text-xs text-emerald-700">Tawaran Tertinggi</dt>
              <dd data-testid="detail-highest" class="mt-0.5 font-bold text-emerald-700">
                {{ highestBid === null ? "Belum ada" : formatRupiah(highestBid) }}
              </dd>
            </div>
          </dl>

          <div class="mt-3 flex items-center gap-2 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800">
            <CalendarClock class="h-4 w-4 shrink-0" />
            <span>
              Ditutup {{ formatDate(aucation.closed_at) }}
              <strong class="ml-1">({{ formatCountdown(aucation.closed_at, now) }})</strong>
            </span>
          </div>

          <div v-if="myBid" data-testid="my-bid" class="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Tawaran kamu: <strong>{{ formatRupiah(myBid.bid) }}</strong>
          </div>

          <div v-if="isOwner" data-testid="owner-actions" class="mt-5 grid grid-cols-3 gap-2">
            <button
              type="button"
              data-testid="open-change"
              class="flex flex-col items-center gap-1 rounded-xl border border-slate-200 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              @click="activeModal = 'change'"
            >
              <Pencil class="h-4 w-4" /> Ubah
            </button>
            <button
              type="button"
              data-testid="open-cover"
              class="flex flex-col items-center gap-1 rounded-xl border border-slate-200 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              @click="activeModal = 'cover'"
            >
              <ImageUp class="h-4 w-4" /> Ganti Cover
            </button>
            <button
              type="button"
              data-testid="delete-aucation"
              :disabled="aucationsStore.isAucationDelete"
              class="flex flex-col items-center gap-1 rounded-xl border border-rose-200 py-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
              @click="onDelete"
            >
              <Trash2 class="h-4 w-4" /> Hapus
            </button>
          </div>

          <div v-else-if="!closed" data-testid="bidder-actions" class="mt-5 space-y-2">
            <button
              type="button"
              data-testid="open-bid"
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              @click="activeModal = 'bid'"
            >
              <Gavel class="h-4 w-4" /> Ajukan Penawaran
            </button>
            <button
              v-if="myBid"
              type="button"
              data-testid="cancel-bid"
              :disabled="aucationsStore.isBidDelete"
              class="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
              @click="onCancelBid"
            >
              <Undo2 class="h-4 w-4" /> Batalkan Tawaran Saya
            </button>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 class="text-lg font-bold text-slate-900">Riwayat Penawaran</h2>
          <p class="text-sm text-slate-500">{{ bids.length }} penawaran</p>
          <p v-if="bids.length === 0" data-testid="no-bids" class="mt-4 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
            Belum ada penawaran untuk lelang ini.
          </p>
          <ol v-else class="mt-4 space-y-2">
            <li
              v-for="(item, index) in bids"
              :key="item.id"
              data-testid="bid-item"
              :class="[
                'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm',
                index === 0 ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'bg-slate-50',
              ]"
            >
              <span class="flex items-center gap-2">
                <Trophy v-if="index === 0" class="h-4 w-4 text-emerald-600" />
                <span v-else class="w-4 text-center text-xs text-slate-400">{{ index + 1 }}</span>
                <span>
                  <span class="block font-semibold text-slate-800">{{ formatRupiah(item.bid) }}</span>
                  <span class="block text-xs text-slate-500">{{ formatDate(item.created_at) }}</span>
                </span>
              </span>
              <span v-if="item.id === myBid?.id" class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                Tawaran Anda
              </span>
            </li>
          </ol>
        </div>
      </div>

      <ChangeModal :open="activeModal === 'change'" :aucation="aucation" @close="activeModal = null" @saved="loadAucation" />
      <ChangeCoverModal :open="activeModal === 'cover'" :aucation="aucation" @close="activeModal = null" @saved="loadAucation" />
      <BidModal :open="activeModal === 'bid'" :aucation="aucation" @close="activeModal = null" @saved="loadAucation" />
    </div>
  </section>
</template>
